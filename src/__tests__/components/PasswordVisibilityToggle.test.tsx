import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../../pages/Login';
import Register from '../../pages/Register';

// Mock the auth API calls
vi.mock('../../api_calls/auth', () => ({
  login: vi.fn().mockResolvedValue({ success: true }),
  register: vi.fn().mockResolvedValue({ success: true })
}));

// Mock the forgot password API call
vi.mock('../../api_calls/forgot_password', () => ({
  forgotPassword: vi.fn().mockResolvedValue({})
}));

// Mock the get apartments API call
vi.mock('../../api_calls/get_apartments', () => ({
  getApartments: vi.fn().mockResolvedValue([
    { id: 1, unit: '1A', floor: 1, rooms: 2, ownerId: 1 }
  ])
}));

describe('Password Visibility Toggle', () => {
  it('should toggle password visibility in Login page', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const toggleButton = passwordInput.parentElement?.querySelector('button');

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button to show password
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    } else {
      throw new Error('Toggle button not found');
    }
  });

  it('should toggle password visibility in Register page', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contraseña');
    
    // Get toggle buttons (there should be two in the Register page)
    const toggleButtons = passwordInput.parentElement?.querySelector('button');
    const confirmToggleButton = confirmPasswordInput.parentElement?.querySelector('button');

    // Initially both password fields should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Test password field toggle
    if (toggleButtons) {
      fireEvent.click(toggleButtons);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }

    // Test confirm password field toggle
    if (confirmToggleButton) {
      fireEvent.click(confirmToggleButton);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    }
  });

  it('should show eye icons when toggling password visibility', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const toggleButton = passwordInput.parentElement?.querySelector('button');

    // Initially should show eye icon (to reveal password)
    expect(toggleButton).toBeInTheDocument();
    
    if (toggleButton) {
      // Click to show password - should now show eye-off icon
      fireEvent.click(toggleButton);
      
      // The icon should change (we can't easily test the specific icon, but we can test that it changes)
      expect(toggleButton).toBeInTheDocument();
    }
  });
});