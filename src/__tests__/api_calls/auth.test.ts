import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register } from '../../api_calls/auth';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Authentication API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockClear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          token: 'mock-jwt-token',
          user: { id: 1, email: 'test@example.com' }
        })
      });

      const result = await login({ email: 'test@example.com', password: 'password' });

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('mock-jwt-token');
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    });

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' })
      });

      const result = await login({ email: 'wrong@example.com', password: 'wrongpassword' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 1, name: 'New User', email: 'newuser@example.com' }
        })
      });

      const result = await register({ name: 'New User', email: 'newuser@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.data.user.name).toBe('New User');
    });

    it('should handle registration failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'User already exists' })
      });

      const result = await register({ name: 'Existing User', email: 'existing@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User already exists');
    });
  });
});
