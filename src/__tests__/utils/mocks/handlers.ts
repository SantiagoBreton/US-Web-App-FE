import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api';

export const handlers = [
  // Auth endpoints - full URL and relative path
  http.post(`${BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER'
      }
    });
  }),

  http.post('/auth/login', () => {
    return HttpResponse.json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER'
      }
    });
  }),

  http.post(`${BASE_URL}/auth/register`, () => {
    return HttpResponse.json({
      message: 'User registered successfully',
      user: {
        id: 2,
        name: 'New User',
        email: 'newuser@example.com',
        role: 'USER'
      }
    });
  }),

  http.post('/auth/register', () => {
    return HttpResponse.json({
      message: 'User registered successfully',
      user: {
        id: 2,
        name: 'New User',
        email: 'newuser@example.com',
        role: 'USER'
      }
    });
  }),

  // Dashboard endpoint - returns user data based on authorization header
  http.get(`${BASE_URL}/dashboard`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.includes('admin-token')) {
      return HttpResponse.json({
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        },
        apartments: [],
        amenities: [],
        reservations: []
      });
    }
    
    if (authHeader?.includes('tenant-token')) {
      return HttpResponse.json({
        user: {
          id: 2,
          name: 'Tenant User',
          email: 'tenant@example.com',
          role: 'tenant'
        },
        apartments: [{ id: 1, unit: '101' }],
        amenities: [{ id: 1, name: 'Piscina' }],
        reservations: []
      });
    }
    
    // Default unauthorized response
    return new HttpResponse(null, { status: 401 });
  }),

  http.get('/dashboard', ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.includes('admin-token')) {
      return HttpResponse.json({
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        },
        apartments: [],
        amenities: [],
        reservations: []
      });
    }
    
    if (authHeader?.includes('tenant-token')) {
      return HttpResponse.json({
        user: {
          id: 2,
          name: 'Tenant User',
          email: 'tenant@example.com',
          role: 'tenant'
        },
        apartments: [{ id: 1, unit: '101' }],
        amenities: [{ id: 1, name: 'Piscina' }],
        reservations: []
      });
    }
    
    // Default unauthorized response
    return new HttpResponse(null, { status: 401 });
  }),

  // Admin endpoints
  http.get(`${BASE_URL}/admin/apartments`, () => {
    return HttpResponse.json([
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
    ]);
  }),

  // Apartments endpoint for registration (simple list)
  http.get(`${BASE_URL}/apartments`, () => {
    return HttpResponse.json([
      { id: 1, unit: '1A', floor: 1, rooms: 2, ownerId: 1 },
      { id: 2, unit: '1B', floor: 1, rooms: 2, ownerId: 2 },
      { id: 3, unit: '2A', floor: 2, rooms: 3, ownerId: 3 },
      { id: 4, unit: '2B', floor: 2, rooms: 3, ownerId: 4 }
    ]);
  }),

  http.get('/apartments', () => {
    return HttpResponse.json([
      { id: 1, unit: '1A', floor: 1, rooms: 2, ownerId: 1 },
      { id: 2, unit: '1B', floor: 1, rooms: 2, ownerId: 2 },
      { id: 3, unit: '2A', floor: 2, rooms: 3, ownerId: 3 },
      { id: 4, unit: '2B', floor: 2, rooms: 3, ownerId: 4 }
    ]);
  }),

  http.post(`${BASE_URL}/admin/apartments`, () => {
    return HttpResponse.json({
      id: 3,
      unit: '103',
      floor: 1,
      rooms: 2,
      areaM2: 85.5,
      isOccupied: false,
      observations: 'New apartment',
      owner: null,
      tenant: null,
      _count: { users: 0, reservations: 0 }
    });
  }),

  http.put(`${BASE_URL}/admin/apartments/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: parseInt(id as string),
      unit: '101-Updated',
      floor: 1,
      rooms: 2,
      areaM2: 85.5,
      isOccupied: true,
      observations: 'Updated apartment',
      owner: { id: 1, name: 'John Doe', email: 'john@example.com' },
      tenant: null,
      _count: { users: 1, reservations: 2 }
    });
  }),

  http.delete(`${BASE_URL}/admin/apartments/:id`, () => {
    return HttpResponse.json({ message: 'Apartment deleted successfully' });
  }),

  // Users endpoints
  http.get(`${BASE_URL}/admin/users`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
        isActive: true,
        apartment: { id: 1, unit: '101' },
        _count: { reservations: 2 }
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'ADMIN',
        isActive: true,
        apartment: null,
        _count: { reservations: 0 }
      }
    ]);
  }),

  // Amenities endpoints
  http.get(`${BASE_URL}/amenities`, () => {
    return HttpResponse.json([
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
    ]);
  }),

  // Reservations endpoints
  http.get(`${BASE_URL}/reservations/amenity/:id`, () => {
    return HttpResponse.json([
      {
        id: 1,
        amenityId: 1,
        userId: 1,
        startTime: '2025-09-15T10:00:00Z',
        endTime: '2025-09-15T12:00:00Z',
        status: 'CONFIRMED',
        user: { id: 1, name: 'John Doe' }
      }
    ]);
  }),

  http.post(`${BASE_URL}/reservations`, () => {
    return HttpResponse.json({
      message: 'Reservation created successfully',
      reservation: {
        id: 2,
        amenityId: 1,
        userId: 1,
        startTime: '2025-09-16T14:00:00Z',
        endTime: '2025-09-16T16:00:00Z',
        status: 'CONFIRMED'
      }
    });
  }),

  http.delete(`${BASE_URL}/reservations/:id`, () => {
    return HttpResponse.json({ message: 'Reservation cancelled successfully' });
  }),

  // User profile endpoints
  http.put(`${BASE_URL}/auth/update-name`, () => {
    return HttpResponse.json({
      message: 'Name updated successfully',
      user: {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'USER'
      }
    });
  }),

  http.put(`${BASE_URL}/auth/update-password`, () => {
    return HttpResponse.json({ message: 'Password updated successfully' });
  })
];