// Mahmmood Sadeghi
// Test 2

import '@testing-library/jest-dom';
import DashboardPage from '../pages/DashboardPage';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react'; 
import { describe, expect, it, vi , beforeEach} from 'vitest';
import { getAllConsultationRequests } from '../api/consultationService.js';

vi.mock('../api/consultationService', () => ({
    getAllConsultationRequests: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ logout: vi.fn()})
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

describe.only('DashboardPage - Times', () => {
    beforeEach(() => {
        vi.mocked(getAllConsultationRequests).mockResolvedValue({ // mock data from actual dhasboard
          success: true,
          data: [
            {
              id: '1',
              name: 'Abrams',
              organization: 'Lafayette Concil',
              email: 'ray_chensirui@hotmail.com',
              phone: '8027715288',
              location: 'Lafayette County, AR, USA (South)',
              stage: 'Just getting started / Exploring',
              topics: ['Legislative Strategy','Legal Strategy','Movement and Well-being'],
              additionalContext: "Looking for some legislative advice on Lafayette, AR's reparation initiatives.",
              status: 'pending',
              createdAt: new Date('2025-06-03T18:37:04'),
            },
            {
              id: '2',
              name: 'Jane Abrams',
              organization: 'Arkansas State Council',
              email: 'abrams@gmail.com',
              phone: '8027715288',
              location: 'Lafayette, AR, USA (South)',
              stage: 'Developing proposals / advocacy',
              topics: ['Legislative Strategy'],
              additionalContext: 'I am looking for guidance about sample legislation',
              status: 'pending',
              createdAt: new Date('2025-06-01T23:08:33'),
            },
          ],
        })
    })

    it('show timestamp for each submission', async () => {
        render(<DashboardPage />)
        await waitFor(() => screen.getByText(/Admin Dashboard/i)) 
        // ref: https://vitest.dev/api/vi
        const submittedLines = screen.getAllByText(/Submitted:/)
        expect(submittedLines.length).toBeGreaterThanOrEqual(2); // two submissions
    
        // get the submission time info
        submittedLines.forEach(node => {
          const text = node.textContent || ''
          const m = text.match(/Submitted:\s*([^(]+)/)
          expect(m).toBeTruthy() // ref: https://vitest.dev/api/expect
    
          const dateStr = m[1].trim()
          const parsed = Date.parse(dateStr)
          expect(isNaN(parsed)).toBe(false)
        })
    })
})