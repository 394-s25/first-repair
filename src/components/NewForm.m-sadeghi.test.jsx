// Mahmmood Sadeghi
// Test 1

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react'; // Import React for forwardRef
import { describe, expect, it, vi } from 'vitest';
import Form from './NewForm.jsx';

// recaptcha
vi.mock('react-google-recaptcha', () => ({
    default: React.forwardRef((props, ref) => <div data-test="test-recaptcha" />),
}));

vi.mock('./LocationAutocomplete.jsx', () => ({
    default: ({ onPlaceSelected, value}) => (
        <button data-testid="test-location" onClick={()=>{
            onPlaceSelected({ description:'Test Loc', place_id:'2025'});
        }}></button>
    )
}));

vi.mock('./SingleSelectDrowdown', () => ({ }))
vi.mock('./MultiSelectDropdown', () => ({ }))

describe('NewForm — Location Requirement', () => {
    it('should not go to step 3 if no location is selected', async ()=> {
        render(<Form />);

        // step 1 to 2 on the form
        fireEvent.click(screen.getByRole('button', {name: /Next Step/i}));
        await waitFor(() => screen.getByText(/About You/i));

        // fill in other REQUIRED fields
        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Fake User'},});
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'fakeuser@test.com'},});

        // try to go to step 3
        fireEvent.click(screen.getByRole('button', { name: /Next Step/i }))
        
        // location is required error
        await waitFor(() => 
            expect(screen.getByText('Location is required')).toBeInTheDocument());
        // still on step 2
        expect(screen.getByText(/About You/i)).toBeInTheDocument();
    });
});