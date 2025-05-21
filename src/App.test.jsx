import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from './App';

describe('button tests', () => {
    
  test("next step after button is clicked", async () => {
    render(<App />);
    const steps = screen.getByRole('button');
    fireEvent.click(steps);
    expect(await screen.getByText('About You')).toBeDefined();
  });
  
  test('App should render the initial form page with a "Next Step" button', () => {
    render(<App />);
    const nextStepButton = screen.getByRole('button', { name: /next step/i });
    expect(nextStepButton).toBeDefined();
  });

  test('App should render the main title for the form', () => {
    render(<App />);
    expect(screen.getByText('Requesting Consultation from FirstRepair')).toBeDefined();
  });

  test('App should render navigation links', () => {
    render(<App />);
    const requestFormLink = screen.getByRole('link', { name: /request form/i });
    expect(requestFormLink).toBeDefined();

    const adminDashboardLink = screen.getByRole('link', { name: /admin dashboard/i });
    expect(adminDashboardLink).toBeDefined();
  });

});