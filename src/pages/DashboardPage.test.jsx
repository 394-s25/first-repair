import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage.jsx';
import { useAuth } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { exportToSpreadsheet } from '../api/spreadsheetService';


// Mock the auth context (FROM EXISTING TEST FILE)
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));


// Mock spreadsheet export
vi.mock('../api/spreadsheetService', () => ({
  exportToSpreadsheet: vi.fn().mockResolvedValue( { success: true }),
}));


// Wrapper component to provide router context (FROM EXISTING TEST FILE)
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}
it('calls export service on clicking the "Export to CSV" button on the dashboard', async () => {
    // From existing test file
    useAuth.mockReturnValue({
        logout: vi.fn()
    });
    renderWithRouter(<DashboardPage />);

    // Waits for button to render
    await waitFor(() => {
        expect(screen.getByText('Export to CSV')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText(/Export to CSV/i );
    fireEvent.click(exportButton);

    // Ensures export api was called
    await waitFor(() => {
      expect(exportToSpreadsheet).toHaveBeenCalled();
    });
    
})