import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DashboardPage from './DashboardPage.jsx';
import { getAllConsultationRequests } from '../api/consultationService.js';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Mock the API ---
vi.mock('../api/consultationService.js', () => ({
  getAllConsultationRequests: vi.fn(),
}));

// --- Mock AuthContext (so useAuth().logout exists) ---
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

// --- Mock react-router-dom navigation ---
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('DashboardPage – Timestamp Rendering', () => {
  beforeEach(() => {
    // Reset the mock before each test
    vi.mocked(getAllConsultationRequests).mockReset();
  });

  it('renders each inquiry’s createdAt timestamp in a human-readable format', async () => {
    // 1) Prepare a fake timestamp and wrap it in a Firestore-like object
    const mockDate = new Date('2025-05-21T16:19:00Z');
    const fireStoreTimestamp = { toDate: () => mockDate };

    // 2) Mock the API to return one request
    const mockRequests = [
      {
        id: 'req-1',
        name: 'Alice',
        organization: 'Org A',
        email: 'alice@example.com',
        phone: null,
        location: { address: '123 Main St', region: 'Unknown' },
        stage: 'Just getting started',
        topics: ['Arts and Culture'],
        additionalContext: 'Needs help with X',
        status: 'pending',
        createdAt: fireStoreTimestamp,
      },
    ];
    vi.mocked(getAllConsultationRequests).mockResolvedValue({
      success: true,
      data: mockRequests,
    });

    // 3) Render the dashboard
    render(<DashboardPage />);

    // 4) Wait for the request to show up
    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });

    // 5) Assert that the formatted timestamp appears
    const expectedText = mockDate.toLocaleString(); 
    expect(screen.getByText(new RegExp(expectedText))).toBeInTheDocument();
  });
});
