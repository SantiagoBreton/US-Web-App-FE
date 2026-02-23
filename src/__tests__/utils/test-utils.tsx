import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/Toast';

// Create a custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { 
    initialEntries?: string[];
    withRouter?: boolean;
  }
) => {
  const { initialEntries = ['/'], withRouter = true, ...renderOptions } = options || {};
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (!withRouter) {
      return (
        <ToastProvider>
          {children}
        </ToastProvider>
      );
    }
    
    return (
      <ToastProvider>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </ToastProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Integration test render function with authentication support
export const renderIntegration = (
  ui: ReactElement, 
  options?: Omit<RenderOptions, 'wrapper'> & {
    userRole?: 'admin' | 'tenant';
    token?: string;
    initialRoute?: string;
  }
) => {
  const { userRole, token, initialRoute = '/', ...renderOptions } = options || {};
  
  // Setup localStorage for authenticated users
  if (userRole && token) {
    const mockLocalStorage = window.localStorage;
    if (mockLocalStorage && mockLocalStorage.getItem) {
      (mockLocalStorage.getItem as any).mockImplementation((key: string) => {
        if (key === 'token') return token;
        if (key === 'userRole') return userRole;
        return null;
      });
    }
  }
  
  // For App component tests, we render directly without wrapper since App has its own router
  return render(ui, renderOptions);
};

// Mock data for tests
export const mockApartments = [
  {
    id: 1,
    unit: '101',
    floor: 1,
    rooms: 2,
    areaM2: 85.5,
    isOccupied: true,
    observations: 'Test apartment',
    owner: { id: 1, name: 'John Doe', email: 'john@example.com' },
    tenant: null,
    _count: { users: 1, reservations: 2 }
  },
  {
    id: 2,
    unit: '102',
    floor: 1,
    rooms: 3,
    areaM2: 120.0,
    isOccupied: false,
    observations: null,
    owner: null,
    tenant: null,
    _count: { users: 0, reservations: 0 }
  }
];

export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER' as const,
    isActive: true,
    apartment: { id: 1, unit: '101' },
    _count: { reservations: 2 }
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'ADMIN' as const,
    isActive: true,
    apartment: null,
    _count: { reservations: 0 }
  }
];

export const mockAmenities = [
  {
    id: 1,
    name: 'Piscina',
    description: 'Piscina comunitaria',
    capacity: 10,
    maxDuration: 120,
    isActive: true
  },
  {
    id: 2,
    name: 'Gimnasio',
    description: 'Gimnasio completamente equipado',
    capacity: 5,
    maxDuration: 90,
    isActive: true
  }
];

export const mockReservations = [
  {
    id: 1,
    amenityId: 1,
    userId: 1,
    startTime: '2025-09-15T10:00:00Z',
    endTime: '2025-09-15T12:00:00Z',
    status: 'CONFIRMED' as const,
    user: { id: 1, name: 'John Doe' }
  }
];

// Utility functions for tests
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 100));

export const createMockToken = () => 'mock-jwt-token';

export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER' as const,
  ...overrides
});

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';