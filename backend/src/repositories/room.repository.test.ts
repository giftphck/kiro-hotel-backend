import pool from '../config/database.config';
import {
  getAllRooms,
  getRoomById,
  updateRoomStatus,
  getRoomStatusForDateRange,
} from './room.repository';
import { RoomStatus } from '../models/room.model';

// Mock the pool
jest.mock('../config/database.config', () => ({
  query: jest.fn(),
}));

describe('Room Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRooms', () => {
    it('should return all rooms ordered by room number', async () => {
      const mockRooms = [
        {
          roomId: '123e4567-e89b-12d3-a456-426614174000',
          roomNumber: '101',
          roomStatus: RoomStatus.AVAILABLE,
          roomType: 'Standard',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roomId: '123e4567-e89b-12d3-a456-426614174001',
          roomNumber: '102',
          roomStatus: RoomStatus.OCCUPIED,
          roomType: 'Deluxe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockRooms });

      const result = await getAllRooms();

      expect(result).toEqual(mockRooms);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY room_number ASC'));
    });

    it('should return empty array when no rooms exist', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await getAllRooms();

      expect(result).toEqual([]);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRoomById', () => {
    it('should return a room when found', async () => {
      const mockRoom = {
        roomId: '123e4567-e89b-12d3-a456-426614174000',
        roomNumber: '101',
        roomStatus: RoomStatus.AVAILABLE,
        roomType: 'Standard',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockRoom] });

      const result = await getRoomById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockRoom);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE room_id = $1'),
        ['123e4567-e89b-12d3-a456-426614174000']
      );
    });

    it('should return null when room not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await getRoomById('non-existent-id');

      expect(result).toBeNull();
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should use parameterized query to prevent SQL injection', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await getRoomById("'; DROP TABLE rooms; --");

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ["'; DROP TABLE rooms; --"]
      );
    });
  });

  describe('updateRoomStatus', () => {
    it('should update room status and return updated room', async () => {
      const mockUpdatedRoom = {
        roomId: '123e4567-e89b-12d3-a456-426614174000',
        roomNumber: '101',
        roomStatus: RoomStatus.CLEANING,
        roomType: 'Standard',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUpdatedRoom] });

      const result = await updateRoomStatus(
        '123e4567-e89b-12d3-a456-426614174000',
        RoomStatus.CLEANING
      );

      expect(result).toEqual(mockUpdatedRoom);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE rooms'),
        [RoomStatus.CLEANING, '123e4567-e89b-12d3-a456-426614174000']
      );
    });

    it('should return null when room not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await updateRoomStatus('non-existent-id', RoomStatus.AVAILABLE);

      expect(result).toBeNull();
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should use parameterized query to prevent SQL injection', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await updateRoomStatus('room-id', RoomStatus.AVAILABLE);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [RoomStatus.AVAILABLE, 'room-id']
      );
    });

    it('should update the updated_at timestamp', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await updateRoomStatus('room-id', RoomStatus.OCCUPIED);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('updated_at = CURRENT_TIMESTAMP'),
        expect.any(Array)
      );
    });
  });

  describe('getRoomStatusForDateRange', () => {
    it('should return room status for each date in range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');
      const mockStatuses = [
        {
          date: new Date('2024-01-01'),
          roomStatus: RoomStatus.AVAILABLE,
          bookingId: null,
          guestName: null,
        },
        {
          date: new Date('2024-01-02'),
          roomStatus: RoomStatus.OCCUPIED,
          bookingId: 'booking-123',
          guestName: 'John Doe',
        },
        {
          date: new Date('2024-01-03'),
          roomStatus: RoomStatus.OCCUPIED,
          bookingId: 'booking-123',
          guestName: 'John Doe',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockStatuses });

      const result = await getRoomStatusForDateRange('room-id', startDate, endDate);

      expect(result).toEqual(mockStatuses);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('generate_series'),
        ['room-id', startDate, endDate]
      );
    });

    it('should use parameterized query to prevent SQL injection', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');

      await getRoomStatusForDateRange('room-id', startDate, endDate);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['room-id', startDate, endDate]
      );
    });

    it('should handle rooms with active bookings', async () => {
      const mockStatuses = [
        {
          date: new Date('2024-01-01'),
          roomStatus: RoomStatus.OCCUPIED,
          bookingId: 'booking-123',
          guestName: 'Jane Smith',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockStatuses });

      const result = await getRoomStatusForDateRange(
        'room-id',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      expect(result[0].bookingId).toBe('booking-123');
      expect(result[0].guestName).toBe('Jane Smith');
    });

    it('should return empty array for invalid date range', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await getRoomStatusForDateRange(
        'room-id',
        new Date('2024-01-03'),
        new Date('2024-01-01')
      );

      expect(result).toEqual([]);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should use parameterized queries in all methods', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      // Test all methods with potentially malicious input
      const maliciousId = "'; DROP TABLE rooms; --";
      
      await getRoomById(maliciousId);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [maliciousId]);

      await updateRoomStatus(maliciousId, RoomStatus.AVAILABLE);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [RoomStatus.AVAILABLE, maliciousId]
      );

      await getRoomStatusForDateRange(
        maliciousId,
        new Date('2024-01-01'),
        new Date('2024-01-03')
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [maliciousId, expect.any(Date), expect.any(Date)]
      );
    });
  });
});
