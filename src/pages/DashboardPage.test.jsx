import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllConsultationRequests } from '../api/consultationService';
import { useAuth } from '../contexts/AuthContext';
import DashboardPage from './DashboardPage';

//firebase initialization
vi.mock('../firebase/firebase_ini.js', () => ({
  auth: {
    onAuthStateChanged: vi.fn(() => vi.fn()),
  },
  db: {}
}));

//consultation service
vi.mock('../api/consultationService', () => ({
  getAllConsultationRequests: vi.fn()
}));

//auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

//mock data
const mockRequests = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    organization: 'Test Org',
    phone: '123-456-7890',
    location: {
      address: '123 Test St',
      state: 'CA',
      region: 'West'
    },
    stage: 'Planning',
    topics: ['Topic 1', 'Topic 2'],
    additionalContext: 'Test context',
    status: 'pending',
    createdAt: { toDate: () => new Date('2024-03-20') }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    organization: 'Another Org',
    phone: '098-765-4321',
    location: {
      address: '456 Test Ave',
      state: 'NY',
      region: 'Northeast'
    },
    stage: 'Implementation',
    topics: ['Topic 3'],
    additionalContext: 'Another context',
    status: 'resolved',
    createdAt: { toDate: () => new Date('2024-03-19') }
  }
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Dashboard Display Consultation Requests', () => {
  beforeEach(() => {
    //clear all mocks before each test
    vi.clearAllMocks();
    
    //auth moick
    useAuth.mockReturnValue({
      logout: vi.fn()
    });

    //initial data
    getAllConsultationRequests.mockResolvedValue({
      success: true,
      data: mockRequests
    });
  });

  it('should show loading state while fetching requests', async () => {
    getAllConsultationRequests.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockRequests }), 100))
    );

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Loading requests...')).toBeInTheDocument();

    //wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading requests...')).not.toBeInTheDocument();
    });
  });

  it('should display all consultation requests when data is successfully loaded', async () => {
    renderWithRouter(<DashboardPage />);
    await waitFor(() => {
      //check if both requests are displayed
      expect(screen.getByText('John Doe - Test Org')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith - Another Org')).toBeInTheDocument();
      expect(screen.getByText('Email: john@example.com | Phone: 123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('Email: jane@example.com | Phone: 098-765-4321')).toBeInTheDocument();
    });
  });

  it('should display requests in correct status categories', async () => {
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      //verify new status 
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('John Doe - Test Org')).toBeInTheDocument();

      //verify resolved status
      expect(screen.getByText('Resolved')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith - Another Org')).toBeInTheDocument();
    });
  });

  it('should fail when request data is missing required fields', async () => {

    getAllConsultationRequests.mockResolvedValue({
      success: true,
      data: [{
        id: '1',
        email: 'test@example.com'
      }]
    });
  
    renderWithRouter(<DashboardPage />);
  
    //expect this to fail
    await expect(async () => {
      await waitFor(() => {
        expect(screen.getByText('Test Org')).toBeInTheDocument();
      });
    }).rejects.toThrow();
  });
});
