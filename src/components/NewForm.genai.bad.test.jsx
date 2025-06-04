// Form.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import Form from './NewForm';

// Mocks
vi.mock('emailjs-com', () => ({
  send: vi.fn(() => Promise.resolve({ status: 200 })),
}));

vi.mock('../api/consultationService.js', () => ({
  addConsultationRequest: vi.fn(() => Promise.resolve({ success: true })),
}));

// Basic mocks for dropdowns and location component
vi.mock('./LocationAutocomplete.jsx', () => ({
  default: ({ onPlaceSelected }) => {
    return (
      <button onClick={() => onPlaceSelected({ description: 'Chicago, IL' })}>
        Mock Location
      </button>
    );
  },
}));

vi.mock('./MultiSelectDropdown.jsx', () => ({
  default: ({ onChange }) => {
    return (
      <button onClick={() => onChange({ target: { name: 'topics', value: ['Legal Strategy'] } })}>
        Mock Topics
      </button>
    );
  },
}));

vi.mock('./SingleSelectDropdown.jsx', () => ({
  default: ({ onChange }) => {
    return (
      <button onClick={() => onChange({ target: { name: 'stage', value: 'Just getting started / Exploring' } })}>
        Mock Stage
      </button>
    );
  },
}));

vi.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: ({ onChange }) => (
    <button onClick={() => onChange('mock-recaptcha-token')}>Mock ReCAPTCHA</button>
  ),
}));

describe('Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows thank you message after successful form submission', async () => {
    render(<Form />);

    // Step 0 → 1
    fireEvent.click(screen.getByText(/Next Step/i));

    // Step 1 – fill user info
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });

    fireEvent.click(screen.getByText(/Mock Location/i)); // Triggers onPlaceSelected with mock value
    fireEvent.click(screen.getByText(/Mock Stage/i));     // Sets the stage

    fireEvent.click(screen.getByText(/Next Step/i));

    // Step 2 – fill topics and context
    fireEvent.click(screen.getByText(/Mock Topics/i)); // Sets a topic

    fireEvent.change(screen.getByLabelText(/Additional Context/i), {
      target: { value: 'Looking for legal guidance on local reparations policy.' },
    });

    fireEvent.click(screen.getByText(/Mock ReCAPTCHA/i)); // Triggers onChange with token

    // Final step – Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    // Wait for success screen
    await waitFor(() => {
expect(screen.getByRole('heading', { name: 'Thank You!' })).toBeInTheDocument();


      expect(
        screen.getByText(/Request submitted successfully!/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/In the meantime, please explore additional resources/i)
      ).toBeInTheDocument();
    });
  });
});
