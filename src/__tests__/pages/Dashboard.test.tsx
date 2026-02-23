import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import Dashboard from '../../pages/Dashboard';

// Mock react-router-dom with importOriginal to preserve MemoryRouter
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    Navigate: ({ to }: any) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>
  };
});

// Mock child components
vi.mock('../../components/LoadingSpinner', () => ({
  LoadingOverlay: ({ isVisible, text }: any) => 
    isVisible ? <div data-testid="loading-overlay">{text}</div> : null
}));

vi.mock('../AdminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>
}));

vi.mock('../TenantDashboard', () => ({
  default: () => <div data-testid="tenant-dashboard">Tenant Dashboard</div>
}));

vi.mock('../../pages/AdminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>
}));

vi.mock('../../pages/TenantDashboard', () => ({
  default: () => <div data-testid="tenant-dashboard">Tenant Dashboard</div>
}));

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000'
  },
  writable: true
});

describe('Dashboard Page', () => {
  const mockToken = 'mock-jwt-token';
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    localStorage.setItem('token', mockToken);
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Dashboard />);
    
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    expect(screen.getByText('Verificando permisos...')).toBeInTheDocument();
  });

  it('redirects to login when no token exists', async () => {
    // No token in localStorage
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    });
  });

  it('shows admin dashboard for admin users', async () => {
    localStorage.setItem('token', mockToken);
    
    const mockAdminData = {
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAdminData)
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/dashboard',
      {
        headers: {
          Authorization: `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  });

  it('shows tenant dashboard for tenant users', async () => {
    localStorage.setItem('token', mockToken);
    
    const mockTenantData = {
      user: {
        id: 2,
        name: 'Tenant User',
        email: 'tenant@example.com',
        role: 'tenant'
      }
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTenantData)
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tenant-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Tenant Dashboard')).toBeInTheDocument();
    });
  });

  it('shows tenant dashboard for tenant users', async () => {
    localStorage.setItem('token', mockToken);
    
    const mockTenantData = {
      user: {
        id: 3,
        name: 'Tenant User',
        email: 'tenant@example.com',
        role: 'tenant'
      }
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTenantData)
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tenant-dashboard')).toBeInTheDocument();
    });
  });

  it('shows tenant dashboard as default for unknown roles', async () => {
    localStorage.setItem('token', mockToken);
    
    const mockUnknownRoleData = {
      user: {
        id: 4,
        name: 'Unknown Role User',
        email: 'unknown@example.com',
        role: 'unknown_role'
      }
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUnknownRoleData)
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tenant-dashboard')).toBeInTheDocument();
    });
  });

  it('shows tenant dashboard when no user role is provided', async () => {
    localStorage.setItem('token', mockToken);
    
    const mockNoRoleData = {
      user: {
        id: 5,
        name: 'No Role User',
        email: 'norole@example.com'
        // no role property
      }
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockNoRoleData)
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tenant-dashboard')).toBeInTheDocument();
    });
  });

  it('redirects to login on authentication error', async () => {
    localStorage.setItem('token', mockToken);
    
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    });
    
    // Token should be removed from localStorage
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('handles fetch network error', async () => {
    localStorage.setItem('token', mockToken);
    
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    });
    
    // Token should be removed from localStorage
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('handles malformed response data', async () => {
    localStorage.setItem('token', mockToken);
    
    const mockMalformedData = {
      // Missing user object
      someOtherData: 'value'
    };
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMalformedData)
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tenant-dashboard')).toBeInTheDocument();
    });
  });

  it('calls dashboard API with correct headers', async () => {
    localStorage.setItem('token', mockToken);
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        user: { role: 'tenant' }
      })
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/dashboard',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });
  });

  it('does not make API call when no token exists', () => {
    // No token in localStorage
    render(<Dashboard />);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });
});