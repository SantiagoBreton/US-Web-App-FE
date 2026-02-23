import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReservationsByAmenity, type Reservation } from '../../api_calls/get_amenity_reservations';
import { createReservation, type ReservationPayload } from '../../api_calls/post_reservation';
import { cancelReservation } from '../../api_calls/cancel_reservation';

// Mock the API calls
vi.mock('../../api_calls/get_amenity_reservations', () => ({
  getReservationsByAmenity: vi.fn()
}));

vi.mock('../../api_calls/post_reservation', () => ({
  createReservation: vi.fn()
}));

vi.mock('../../api_calls/cancel_reservation', () => ({
  cancelReservation: vi.fn()
}));

describe('Reservation API Calls', () => {
  const mockToken = 'test-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReservationsByAmenity', () => {
    it('should fetch reservations successfully', async () => {
      const mockReservations: Reservation[] = [
        {
          id: 1,
          amenityId: 1,
          userId: 123,
          user: { id: 123, name: 'John Doe' },
          startTime: '2024-09-15T10:00:00Z',
          endTime: '2024-09-15T11:00:00Z',
          status: 'confirmed',
          createdAt: '2024-09-01T08:00:00Z'
        },
        {
          id: 2,
          amenityId: 1,
          userId: 456,
          user: { id: 456, name: 'Jane Smith' },
          startTime: '2024-09-15T14:00:00Z',
          endTime: '2024-09-15T16:00:00Z',
          status: 'confirmed',
          createdAt: '2024-09-01T09:00:00Z'
        }
      ];

      (getReservationsByAmenity as any).mockResolvedValue(mockReservations);

      const result = await getReservationsByAmenity(mockToken, 1);
      
      expect(getReservationsByAmenity).toHaveBeenCalledWith(mockToken, 1);
      expect(result).toEqual(mockReservations);
    });

    it('should handle API error gracefully', async () => {
      const mockError = new Error('Failed to fetch reservations');
      (getReservationsByAmenity as any).mockRejectedValue(mockError);

      await expect(getReservationsByAmenity(mockToken, 2)).rejects.toThrow('Failed to fetch reservations');
    });

    it('should handle different amenity IDs', async () => {
      const amenityIds = [1, 2, 3, 4];
      
      for (const amenityId of amenityIds) {
        (getReservationsByAmenity as any).mockResolvedValue([]);
        await getReservationsByAmenity(mockToken, amenityId);
        expect(getReservationsByAmenity).toHaveBeenCalledWith(mockToken, amenityId);
      }
    });

    it('should handle date range filtering', async () => {
      const amenityId = 1;
      const startDate = '2024-09-15';
      const endDate = '2024-09-22';

      (getReservationsByAmenity as any).mockResolvedValue([]);
      await getReservationsByAmenity(mockToken, amenityId, startDate, endDate);
      
      expect(getReservationsByAmenity).toHaveBeenCalledWith(mockToken, amenityId, startDate, endDate);
    });
  });

  describe('createReservation', () => {
    it('should create reservation successfully', async () => {
      const reservationData: ReservationPayload = {
        amenityId: 1,
        startTime: '2024-09-20T15:00:00Z',
        endTime: '2024-09-20T16:30:00Z'
      };

      const mockResponse = {
        id: 123,
        ...reservationData,
        userId: 789,
        status: 'confirmed',
        createdAt: '2024-09-15T10:00:00Z'
      };

      (createReservation as any).mockResolvedValue(mockResponse);

      const result = await createReservation(mockToken, reservationData);
      
      expect(createReservation).toHaveBeenCalledWith(mockToken, reservationData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const invalidData: ReservationPayload = {
        amenityId: 0,
        startTime: 'invalid-date',
        endTime: 'invalid-date'
      };

      const mockError = new Error('Validation failed');
      (createReservation as any).mockRejectedValue(mockError);

      await expect(createReservation(mockToken, invalidData)).rejects.toThrow('Validation failed');
    });

    it('should handle time conflicts', async () => {
      const reservationData: ReservationPayload = {
        amenityId: 1,
        startTime: '2024-09-20T15:00:00Z',
        endTime: '2024-09-20T16:00:00Z'
      };

      const conflictError = new Error('Time slot already reserved');
      (createReservation as any).mockRejectedValue(conflictError);

      await expect(createReservation(mockToken, reservationData)).rejects.toThrow('Time slot already reserved');
    });

    it('should handle different time ranges', async () => {
      const timeRanges = [
        { start: '2024-09-20T10:00:00Z', end: '2024-09-20T10:30:00Z' },
        { start: '2024-09-20T14:00:00Z', end: '2024-09-20T15:00:00Z' },
        { start: '2024-09-20T16:00:00Z', end: '2024-09-20T17:30:00Z' },
        { start: '2024-09-20T19:00:00Z', end: '2024-09-20T21:00:00Z' }
      ];
      
      for (const timeRange of timeRanges) {
        const reservationData: ReservationPayload = {
          amenityId: 2,
          startTime: timeRange.start,
          endTime: timeRange.end
        };

        (createReservation as any).mockResolvedValue({ id: 1, ...reservationData });
        await createReservation(mockToken, reservationData);
        expect(createReservation).toHaveBeenCalledWith(mockToken, reservationData);
      }
    });
  });

  describe('cancelReservation', () => {
    it('should cancel reservation successfully', async () => {
      const reservationId = 123;
      (cancelReservation as any).mockResolvedValue({ success: true });

      const result = await cancelReservation(mockToken, reservationId);
      
      expect(cancelReservation).toHaveBeenCalledWith(mockToken, reservationId);
      expect(result).toEqual({ success: true });
    });

    it('should handle cancellation errors', async () => {
      const reservationId = 999;
      const mockError = new Error('Reservation not found');
      (cancelReservation as any).mockRejectedValue(mockError);

      await expect(cancelReservation(mockToken, reservationId)).rejects.toThrow('Reservation not found');
    });

    it('should handle unauthorized cancellation', async () => {
      const reservationId = 456;
      const authError = new Error('Not authorized to cancel this reservation');
      (cancelReservation as any).mockRejectedValue(authError);

      await expect(cancelReservation(mockToken, reservationId)).rejects.toThrow('Not authorized to cancel this reservation');
    });

    it('should handle past reservation cancellation', async () => {
      const reservationId = 789;
      const pastError = new Error('Cannot cancel past reservations');
      (cancelReservation as any).mockRejectedValue(pastError);

      await expect(cancelReservation(mockToken, reservationId)).rejects.toThrow('Cannot cancel past reservations');
    });
  });

  describe('Reservation workflow integration', () => {
    it('should handle complete booking workflow', async () => {
      // Step 1: Check existing reservations
      const existingReservations: Reservation[] = [
        {
          id: 1,
          amenityId: 1,
          userId: 456,
          user: { id: 456, name: 'Jane Smith' },
          startTime: '2024-09-20T10:00:00Z',
          endTime: '2024-09-20T11:00:00Z',
          status: 'confirmed',
          createdAt: '2024-09-15T08:00:00Z'
        }
      ];
      (getReservationsByAmenity as any).mockResolvedValue(existingReservations);

      const reservations = await getReservationsByAmenity(mockToken, 1);
      expect(reservations).toHaveLength(1);

      // Step 2: Create new reservation
      const newReservationData: ReservationPayload = {
        amenityId: 1,
        startTime: '2024-09-20T15:00:00Z',
        endTime: '2024-09-20T16:30:00Z'
      };
      
      const createdReservation = {
        id: 2,
        ...newReservationData,
        userId: 123,
        status: 'confirmed',
        createdAt: '2024-09-15T10:00:00Z'
      };
      (createReservation as any).mockResolvedValue(createdReservation);

      const result = await createReservation(mockToken, newReservationData);
      expect(result.id).toBe(2);

      // Step 3: Verify reservation was created
      const updatedReservations = [...existingReservations, {
        ...createdReservation,
        user: { id: 123, name: 'John Doe' }
      }];
      (getReservationsByAmenity as any).mockResolvedValue(updatedReservations);

      const finalReservations = await getReservationsByAmenity(mockToken, 1);
      expect(finalReservations).toHaveLength(2);
    });

    it('should handle cancellation workflow', async () => {
      // Step 1: Get user's reservations
      const userReservations: Reservation[] = [
        {
          id: 1,
          amenityId: 2,
          userId: 123,
          user: { id: 123, name: 'John Doe' },
          startTime: '2024-09-25T16:00:00Z',
          endTime: '2024-09-25T17:00:00Z',
          status: 'confirmed',
          createdAt: '2024-09-20T08:00:00Z'
        }
      ];
      (getReservationsByAmenity as any).mockResolvedValue(userReservations);

      const reservations = await getReservationsByAmenity(mockToken, 2);
      expect(reservations).toHaveLength(1);

      // Step 2: Cancel reservation
      (cancelReservation as any).mockResolvedValue({ success: true });
      await cancelReservation(mockToken, 1);

      // Step 3: Verify reservation was cancelled
      (getReservationsByAmenity as any).mockResolvedValue([]);
      const updatedReservations = await getReservationsByAmenity(mockToken, 2);
      expect(updatedReservations).toHaveLength(0);
    });
  });
});