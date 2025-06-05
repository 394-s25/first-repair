import emailjs from '@emailjs/browser'; // Import the mocked module
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react'; // Import React for forwardRef
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addConsultationRequest } from '../api/consultationService.js'; // Import the mocked function
import Form from './NewForm.jsx';


// Mock child components or external dependencies
// Keep track of the onChange callback passed to the mock ReCAPTCHA
let recaptchaOnChangeCallback = null;
vi.mock('react-google-recaptcha', () => ({
  default: React.forwardRef((props, ref) => { // Use React.forwardRef
    // Store the onChange prop so we can call it
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

// Mock MultiSelectDropdown
let mockTopicsOnChange = null;
let mockCurrentTopicsValue = [];
vi.mock('./MultiSelectDropdown.jsx', () => ({
  default: vi.fn((props) => {
    mockTopicsOnChange = props.onChange;
    mockCurrentTopicsValue = props.value;
    return (
      <div data-testid="mock-multiselect-topics">
        <label htmlFor={`mock-multiselect-${props.name}`}>{props.label}</label>
        {/* Simulate interaction that calls onChange */}
        <button
          data-testid={`mock-multiselect-${props.name}-button`}
          onClick={() => {
            if (mockTopicsOnChange) {
              const newValue = mockCurrentTopicsValue.includes('Mock Topic 1') ? [] : ['Mock Topic 1'];
              mockTopicsOnChange({ target: { name: props.name, value: newValue } });
            }
          }}
        >
          Toggle Mock Topic 1 (Selected: {mockCurrentTopicsValue.join(', ') || 'None'})
        </button>
      </div>
    );
  }),
}));

// Mock emailjs
vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn().mockResolvedValue({ status: 200, text: 'OK' }),
  },
}));

// Mock consultationService
vi.mock('../api/consultationService.js', () => ({
  addConsultationRequest: vi.fn().mockResolvedValue({ success: true }),
}));

describe('NewForm Component - Next Step Functionality', () => {
  beforeEach(() => {
    // Clear mocks that might have been called in previous tests if necessary
    vi.mocked(emailjs.send).mockClear();
    vi.mocked(addConsultationRequest).mockClear();
    recaptchaOnChangeCallback = null; // Reset ReCAPTCHA mock helper
    mockTopicsOnChange = null; // Reset MultiSelectDropdown mock helper
    mockCurrentTopicsValue = []; // Reset MultiSelectDropdown mock helper
  });

  it('should advance from step 0 to step 1 when "Next Step" is clicked', async () => {
    render(<Form />);
    // Step 0 content check
    expect(screen.getByText('Requesting Consultation from FirstRepair')).toBeInTheDocument();
    expect(screen.getByText('Step 1/4')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextButton);

    // Wait for step 1 content to appear
    await waitFor(() => {
      expect(screen.getByText('About You')).toBeInTheDocument();
    });
    expect(screen.getByText('Step 2/4')).toBeInTheDocument(); // Header for step 1 content
  });

  it('should advance from step 1 to step 2 if all validations pass', async () => {
    render(<Form />);
    // Go to step 1
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    // Fill step 1 form
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));
    await waitFor(() => {
        expect(screen.getByText('Mock Location Autocomplete (Selected: Mock Location)')).toBeInTheDocument();
    });

    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    const optionToSelect = await screen.findByRole('option', { name: /Just getting started/i });
    fireEvent.click(optionToSelect);

    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('About Your Question')).toBeInTheDocument();
    });
    expect(screen.getByText('Step 3/4')).toBeInTheDocument(); 
  });

  it('should not advance from step 1 and show error if name is missing', async () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));
    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    fireEvent.click(await screen.findByRole('option', { name: /Just getting started/i }));

    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(screen.getByText('About You')).toBeInTheDocument();
    expect(screen.queryByText('About Your Question')).not.toBeInTheDocument();
  });

  it('should not advance from step 1 and show error if email format is invalid', async () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));
    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    fireEvent.click(await screen.findByRole('option', { name: /Just getting started/i }));

    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
    expect(screen.getByText('About You')).toBeInTheDocument();
  });

  it('should not advance from step 1 and show error if location is missing', async () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    // Do not click mock-location-autocomplete to simulate missing location
    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    fireEvent.click(await screen.findByRole('option', { name: /Just getting started/i }));

    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByText('Location is required')).toBeInTheDocument();
    });
    expect(screen.getByText('About You')).toBeInTheDocument();
  });

  it('should not advance from step 1 and show error if stage is missing', async () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));
    // Do not select a stage

    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByText('Please select a stage of reparations initiative')).toBeInTheDocument();
    });
    expect(screen.getByText('About You')).toBeInTheDocument();
  });
  
  it('should not advance from step 1 if "Other" stage is selected and elaboration is missing', async () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i })); 
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));

    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    const otherOption = await screen.findByRole('option', { name: /Other/i });
    fireEvent.click(otherOption);
    
    await waitFor(() => {
        expect(screen.getByLabelText(/Please elaborate on the stage of your initiative/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByText('Please elaborate on the stage of your reparations initiative')).toBeInTheDocument();
    });
    expect(screen.getByText('About You')).toBeInTheDocument();
  });

  it('should advance from step 1 if "Other" stage is selected and elaboration is provided', async () => {
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));

    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    const otherOption = await screen.findByRole('option', { name: /Other/i });
    fireEvent.click(otherOption);
    
    const elaborationField = await screen.findByLabelText(/Please elaborate on the stage of your initiative/i);
    fireEvent.change(elaborationField, { target: { value: 'Some other stage details' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    await waitFor(() => {
      expect(screen.getByText('About Your Question')).toBeInTheDocument();
    });
  });

  it('should display an error message if topics are missing on submission', async () => {
    render(<Form />);
    // Go to step 1
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About You')).toBeInTheDocument());

    // Fill step 1 form
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('mock-location-autocomplete'));
    const stageSelect = screen.getByLabelText(/Stage of Reparations Initiative/i);
    fireEvent.mouseDown(stageSelect);
    fireEvent.click(await screen.findByRole('option', { name: /Just getting started/i }));

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    await waitFor(() => expect(screen.getByText('About Your Question')).toBeInTheDocument());

    // Fill additional context, but leave topics empty
    fireEvent.change(screen.getByLabelText(/Additional Context/i), { target: { value: 'Some additional context.' } });
    
    // Ensure topics are empty (our mock starts empty, and we don't add any)
    // Verify mock state if needed: expect(mockCurrentTopicsValue).toEqual([]);

    // Simulate ReCAPTCHA completion
    fireEvent.click(screen.getByTestId('mock-recaptcha'));
    // Optional: await waitFor(() => expect(recaptchaOnChangeCallback).toHaveBeenCalled()); // Check if onChange was called

    // Attempt to submit
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    // Check for the specific error message from validateStep2 (via stepError)
    await waitFor(() => {
      expect(screen.getByText('Please select at least one topic of interest')).toBeInTheDocument();
    });

    // Ensure still on step 2
    expect(screen.getByText('About Your Question')).toBeInTheDocument();
    expect(addConsultationRequest).not.toHaveBeenCalled();
    expect(emailjs.send).not.toHaveBeenCalled();
  });
});
