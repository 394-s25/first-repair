import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react'; // Import React for forwardRef
import { expect, it, vi } from 'vitest';
import Form from './NewForm.jsx';

// Mocks are from NewForm.test.jsx
let recaptchaOnChangeCallback = null;

// Mock emailjs
vi.mock('emailjs-com', () => ({
  default: {
    send: vi.fn().mockResolvedValue({ status: 200, text: 'OK' }),
  },
}));

vi.mock('react-google-recaptcha', () => ({
  default: React.forwardRef((props, ref) => { // Use React.forwardRef
    recaptchaOnChangeCallback = props.onChange;
    // If a ref is passed, you can assign it or parts of it if needed by the component logic
    // For this mock, we might not need to do much with the ref itself,
    // but forwardRef ensures React handles it correctly.
    if (ref) {
      // Example: if the parent component tries to call methods on the ref:
      // ref.current = { reset: vi.fn(), getValue: vi.fn().mockReturnValue('mock-token') };
    }
    return (
      <div data-testid="mock-recaptcha" onClick={() => {
        if (recaptchaOnChangeCallback) {
          recaptchaOnChangeCallback('mock-token'); // Simulate ReCAPTCHA success
        }
      }}>
        Mock ReCAPTCHA
      </div>
    );
  }),
}));

// Mock LocationAutocomplete to control its behavior
vi.mock('./LocationAutocomplete.jsx', () => ({
  default: vi.fn(({ onPlaceSelected, value }) => (
    <button
      data-testid="mock-location-autocomplete"
      onClick={() => onPlaceSelected({ description: 'Mock Location', place_id: 'mock_place_id' })}
    >
      Mock Location Autocomplete (Selected: {value ? value.description : 'None'})
    </button>
  )),
}));

it('displays Thank You on form submission', async () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    // Fill step 1
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));
    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    fireEvent.click(await screen.findByRole('option', { name: /Just getting started/i }));

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About Your Question')).toBeInTheDocument());

    // Fill in step 2
    fireEvent.change(screen.getByLabelText(/Additional Context/i), { target: { value: 'Some additional context.' } });
    const getSelect = screen.getByLabelText(/seeking consultation/i );
    fireEvent.mouseDown(getSelect);
    fireEvent.click(await screen.findByRole('option', { name: /Communications/i }));

    // Simulate ReCAPTCHA completion
    fireEvent.click(screen.getByTestId('mock-recaptcha'));
    // Optional: await waitFor(() => expect(recaptchaOnChangeCallback).toHaveBeenCalled()); // Check if onChange was called

    // Ensures submit button was rendered
    await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

    // Ensures "Thank You!" is rendered when form submitted successfully
    await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
    });
        
})