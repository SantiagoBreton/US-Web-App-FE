import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderIntegration, screen, userEvent, waitFor } from '../utils/test-utils';
import App from '../../App';
import { login, register } from '../../api_calls/auth';
import { getReservationsByAmenity } from '../../api_calls/get_amenity_reservations';
import { createReservation } from '../../api_calls/post_reservation';

// Mock all API calls
vi.mock('../../api_calls/auth', () => ({
  login: vi.fn(),
  register: vi.fn()
}));

vi.mock('../../api_calls/get_amenity_reservations', () => ({
  getReservationsByAmenity: vi.fn(),
  createReservation: vi.fn()
}));

vi.mock('../../api_calls/post_reservation', () => ({
  createReservation: vi.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000'
  },
  writable: true
});

describe('User Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    global.fetch = vi.fn();
  });

  describe('Authentication Integration', () => {
    it('should handle login workflow', async () => {
      const user = userEvent.setup();
      
      // Mock successful login
      (login as any).mockResolvedValue({ 
        success: true, 
        token: 'mock-token-123' 
      });

      renderIntegration(<App />);

      // Should start on login page
      expect(screen.getByText('Bienvenido a US')).toBeInTheDocument();
      
      // Fill login form
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      
      // Submit login
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(loginButton);
      
      // Verify login was attempted with object format
      await waitFor(() => {
        expect(login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it.skip('should handle registration workflow', async () => {
      const user = userEvent.setup();
      
      // Mock successful registration
      (register as any).mockResolvedValue({ success: true });

      renderIntegration(<App />);

      // Navigate to register page
      const registerLink = screen.getByText('Registrate');
      await user.click(registerLink);
      
      // Should show registration form
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument();
      });
      
      // Fill registration form
      await user.type(screen.getByPlaceholderText('Nombre completo'), 'Test User');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      
      // Select apartment (wait for options to load)
      await waitFor(() => {
        expect(screen.getByDisplayValue('Selecciona un apartamento')).toBeInTheDocument();
      });
      const apartmentSelect = screen.getByDisplayValue('Selecciona un apartamento');
      await user.selectOptions(apartmentSelect, '1');
      
      await user.type(screen.getByPlaceholderText('Contraseña'), 'Password123');
      await user.type(screen.getByPlaceholderText('Confirmar contraseña'), 'Password123');
      
      // Submit registration
      const registerButton = screen.getByRole('button', { name: /registrarse/i });
      await user.click(registerButton);
      
      // Verify registration was attempted
      await waitFor(() => {
        expect(register).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          apartmentId: '1'
        });
      });
    });

    it('should handle login errors', async () => {
      const user = userEvent.setup();
      
      // Mock login failure
      (login as any).mockResolvedValue({ 
        success: false, 
        message: 'Invalid credentials' 
      });

      renderIntegration(<App />);
      
      // Go to login page first
      const loginLink = screen.getByText('Iniciar sesión');
      await user.click(loginLink);
      
      // Fill login form with wrong credentials
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'wrong@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'wrongpassword');
      
      // Submit login
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(loginButton);
      
      // Should stay on login page
      expect(screen.getByText('Bienvenido a US')).toBeInTheDocument();
    });

    it.skip('should handle API integration', async () => {
      // Mock API responses
      (getReservationsByAmenity as any).mockResolvedValue([]);
      (createReservation as any).mockResolvedValue({
        id: 1,
        amenityId: 1,
        startTime: '2024-09-20T15:00:00Z',
        endTime: '2024-09-20T16:30:00Z',
        userId: 2,
        status: 'confirmed'
      });
      
      // Test API integration
      const reservations = await getReservationsByAmenity('token', 1);
      expect(reservations).toEqual([]);
      
      const newReservation = await createReservation('token', {
        amenityId: 1,
        startTime: '2024-09-20T15:00:00Z',
        endTime: '2024-09-20T16:30:00Z'
      });
      
      expect(newReservation.status).toBe('confirmed');
    });

    it.skip('should validate form integration', async () => {
      const user = userEvent.setup();
      
      renderIntegration(<App />);
      
      // Navigate to register page to test form validation
      const registerLink = screen.getByText('Registrate');
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
      });
      
      // Test password validation
      const passwordInput = screen.getByPlaceholderText('Contraseña');
      await user.type(passwordInput, 'weak');
      
      // Should show password requirements
      expect(screen.getByText(/Al menos 6 caracteres/)).toBeInTheDocument();
    });

    it.skip('should handle error scenarios', async () => {
      const user = userEvent.setup();
      renderIntegration(<App />);
      
      // We start on login page, navigate to register page
      const registerLink = screen.getByText('Registrate');
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
      });
      
      // Navigate back to login to test error scenarios
      const loginLink = screen.getByText('Iniciar sesión');
      await user.click(loginLink);
      
      await waitFor(() => {
        expect(screen.getByText('Bienvenido a US')).toBeInTheDocument();
      });
      
      // Mock network error - return a resolved promise with error state instead
      (login as any).mockResolvedValue({ 
        success: false, 
        message: 'Network error' 
      });
      
      // Try to login
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      
      const loginButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(loginButton);
      
      // Should handle error gracefully and stay on login page
      await waitFor(() => {
        expect(screen.getByText('Bienvenido a US')).toBeInTheDocument();
      });
    });

    it.skip('should test navigation integration', async () => {
      const user = userEvent.setup();
      
      renderIntegration(<App />);
      
      // Test starts on login page, verify and navigate to register
      await waitFor(() => {
        expect(screen.getByText('Bienvenido a US')).toBeInTheDocument();
      });
      
      // Navigate to register
      const registerLink = screen.getByText('Registrate');
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
      });
      
      // Navigate back to login
      const loginLink = screen.getByText('Iniciar sesión');
      await user.click(loginLink);
      
      await waitFor(() => {
        expect(screen.getByText('Bienvenido a US')).toBeInTheDocument();
      });
    });
  });
});