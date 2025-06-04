import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllConsultationRequests, updateConsultationRequestStatus } from '../api/consultationService';
import { useAuth } from '../contexts/AuthContext';
import DashboardPage from '../pages/DashboardPage';

// Mock the Firebase initialization
vi.mock('../firebase/firebase_ini.js', () => ({
  auth: {
    onAuthStateChanged: vi.fn(() => vi.fn()), // Mock onAuthStateChanged to return an unsubscribe function
    // Add other auth methods if needed by useAuth or other parts, though likely not for this test
  },
  db: {} // Mock db if it were used directly by DashboardPage or its children
}));

// Mock the consultation service
vi.mock('../api/consultationService', () => ({
  updateConsultationRequestStatus: vi.fn(),
  getAllConsultationRequests: vi.fn()
}));

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock data
const mockRequests = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    status: 'pending',
    location: { state: 'IL', region: 'Midwest' },
    createdAt: new Date('2023-01-01T10:00:00Z'), // Older request
    organization: 'Test Org',
    phone: '123-456-7890',
    stage: 'Planning',
    topics: ['Topic 1', 'Topic 2'],
    additionalContext: 'Test context'
  },
  {
    id: '2',
    name: 'Resolved User',
    email: 'resolved@example.com',
    status: 'resolved',
    location: { state: 'CA', region: 'West' },
    createdAt: new Date('2023-01-02T12:00:00Z'), // Newer request, will be latestRequestData
    organization: 'Resolved Org',
    phone: '987-654-3210',
    stage: 'Implementation',
    topics: ['Topic 3'],
    additionalContext: 'Resolved context'
  }
];

// Wrapper component to provide router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard Resolve Request Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Setup auth mock
    useAuth.mockReturnValue({
      logout: vi.fn()
    });

    // Setup initial data
    getAllConsultationRequests.mockResolvedValue({
      success: true,
      data: mockRequests
    });

    // Setup successful status update
    updateConsultationRequestStatus.mockResolvedValue({
      success: true
    });
  });

  it('should show loading state while fetching requests', async () => {
    // Delay the mock response to ensure loading state is visible
    getAllConsultationRequests.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockRequests }), 100))
    );

    renderWithRouter(<DashboardPage />);

    // Verify loading state is shown
    expect(screen.getByText('Loading requests...')).toBeInTheDocument();

    // Wait for data to load and verify loading state is removed
    await waitFor(() => {
      expect(screen.queryByText('Loading requests...')).not.toBeInTheDocument();
    });
  });

  it('should show error state when request fetch fails', async () => {
    // Setup failed fetch 
    getAllConsultationRequests.mockResolvedValueOnce({
      success: false,
      error: { message: 'Failed to fetch requests' }
    });

    renderWithRouter(<DashboardPage />);

    // Wait for error to be shown
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch requests')).toBeInTheDocument();
    });
  });

  it('should update request status and refresh list when marking as resolved', async () => {
    renderWithRouter(<DashboardPage />);

    // Wait for initial data load
    await waitFor(() => {
      expect(getAllConsultationRequests).toHaveBeenCalled();
    });

    // Wait for the request to be visible. 'Test User' is not the latest, so it appears once.
    await waitFor(() => {
      expect(screen.getByText('Test User - Test Org')).toBeInTheDocument();
    });

    // Find and click the resolve button. Since 'Test User' is not latest, this button should be unique.
    const resolveButton = screen.getByRole('button', { name: 'resolve' });
    fireEvent.click(resolveButton);

    // Verify status update was called with correct parameters
    await waitFor(() => {
      expect(updateConsultationRequestStatus).toHaveBeenCalledWith('1', 'resolved');
    });

    // Verify list was refreshed
    await waitFor(() => {
      expect(getAllConsultationRequests).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('should update request status and refresh list when marking as pending', async () => {
    renderWithRouter(<DashboardPage />);

    // Wait for initial data load
    await waitFor(() => {
      expect(getAllConsultationRequests).toHaveBeenCalled();
    });

    // Wait for the resolved request to be visible. 'Resolved User' is latest, so it appears twice.
    await waitFor(() => {
      expect(screen.getAllByText('Resolved User - Resolved Org').length).toBeGreaterThanOrEqual(1); // Could be 1 or 2 depending on timing
    });

    // Find all "mark-pending" buttons. 'Resolved User' is latest and in list, so two buttons.
    const pendingButtons = await screen.findAllByRole('button', { name: 'mark-pending' });
    
    let targetButton = null;
    if (pendingButtons.length > 1) {
      // If multiple, find the one NOT in the latest-request-section
      for (const btn of pendingButtons) {
        if (!btn.closest('#latest-request-section')) {
          targetButton = btn;
          break;
        }
      }
    } else {
      targetButton = pendingButtons[0];
    }
    
    expect(targetButton).toBeInTheDocument(); // Ensure we found a button
    fireEvent.click(targetButton);

    // Verify status update was called with correct parameters
    await waitFor(() => {
      expect(updateConsultationRequestStatus).toHaveBeenCalledWith('2', 'pending');
    });

    // Verify list was refreshed
    await waitFor(() => {
      expect(getAllConsultationRequests).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('should handle failed status update gracefully', async () => {
    // Setup failed status update
    updateConsultationRequestStatus.mockResolvedValueOnce({
      success: false,
      error: { message: 'Update failed' }
    });

    // Mock window.alert
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithRouter(<DashboardPage />);

    // Wait for initial data load
    await waitFor(() => {
      expect(getAllConsultationRequests).toHaveBeenCalled();
    });

    // Wait for the request to be visible. 'Test User' is not latest, so button is unique.
    await waitFor(() => {
      expect(screen.getByText('Test User - Test Org')).toBeInTheDocument();
    });

    // Find and click the resolve button. 'Test User' is not latest, so button is unique.
    const resolveButton = screen.getByRole('button', { name: 'resolve' });
    fireEvent.click(resolveButton);

    // Verify error was shown
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to update request: Update failed');
    });

    // Verify list was not refreshed
    expect(getAllConsultationRequests).toHaveBeenCalledTimes(1);

    // Cleanup
    mockAlert.mockRestore();
  });
});
