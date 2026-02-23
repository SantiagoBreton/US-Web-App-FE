import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Register from '../../pages/Register';

// Mock the API calls
vi.mock('../../api_calls/auth', () => ({
  registerUser: vi.fn()
}));

vi.mock('../../api_calls/get_apartments', () => ({
  getApartments: vi.fn().mockResolvedValue([
    { id: '1', unit: 'Apt 101' },
    { id: '2', unit: 'Apt 102' }
  ])
}));

describe('Register Page Password Toggle Fix', () => {
  it('should keep password requirements visible when password toggle button is clicked', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Wait for apartments to load
    await screen.findByText('Apt 101');

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    
    // Focus the password input
    fireEvent.focus(passwordInput);
    
    // Check if requirements are shown
    expect(screen.getByText('La contraseña debe tener:')).toBeInTheDocument();

    // Find the toggle button
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    expect(toggleButton).toBeTruthy();

    // Click the toggle button (simulating the onMouseDown event first)
    if (toggleButton) {
      fireEvent.mouseDown(toggleButton);
      fireEvent.click(toggleButton);
    }

    // The requirements should still be visible (which means focus wasn't lost)
    expect(screen.getByText('La contraseña debe tener:')).toBeInTheDocument();
    
    // And the password should now be visible (type="text")
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle back to hidden
    if (toggleButton) {
      fireEvent.click(toggleButton);
    }
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});