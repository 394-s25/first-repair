import {describe, expect, test} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import App from './App';

describe('button tests', () => {
    
  test("next step after button is clicked", async () => {
    render(<App />);
    const steps = screen.getByRole('button');
    fireEvent.click(steps);
    expect(await screen.getByText('About You')).toBeDefined();
  });

});