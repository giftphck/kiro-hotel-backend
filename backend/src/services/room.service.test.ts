import roomService from './room.service';
import * as roomRepository from '../repositories/room.repository';
import { RoomStatus } from '../models/room.model';

// Mock the repository
jest.mock('../repositories/room.repository');

describe('RoomService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRooms', () => {
    it('should return all rooms from repository', async () => {
      const mockRooms = [
        {
          roomId: '1',
          roomNumber: '101',
          roomStatus: RoomStatus.AVAILABLE,
          roomType: 'Standard',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          roomId: '2',
          roomNumber: '102',
          roomStatus: RoomStatus.OCCUPIED,
          roomType: 'Deluxe',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (roomRepository.getAllRooms as jest.Mock).mockResolvedValue(mockRooms);

      const result = await roomService.getRooms();

      expect(result).toEqual(mockRooms);
      expect(roomRepository.getAllRooms).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRoomById', () => {
    it('should return room when found', async () => {
      const mockRoom = {
        roomId: '1',
        roomNumber: '101',
        roomStatus: RoomStatus.AVAILABLE,
        roomType: 'Standard',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (roomRepository.getRoomById as jest.Mock).mockResolvedValue(mockRoom);

      const result = await roomService.getRoomById('1');

      expect(result).toEqual(mockRoom);
      expect(roomRepository.getRoomById).toHaveBeenCalledWith('1');
    });

    it('should throw error when room not found', async () => {
      (roomRepository.getRoomById as jest.Mock).mockResolvedValue(null);

      await expect(roomService.getRoomById('999')).rejects.toThrow(
        'Room with ID 999 not found'
      );
    });
  });

  describe('updateRoomStatus', () => {
    it('should update room status successfully', async () => {
      const existingRoom = {
        roomId: '1',
        roomNumber: '101',
        roomStatus: RoomStatus.AVAILABLE,
        roomType: 'Standard',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedRoom = {
        ...existingRoom,
        roomStatus: RoomStatus.CLEANING
      };

      (roomRepository.getRoomById as jest.Mock).mockResolvedValue(existingRoom);
      (roomRepository.updateRoomStatus as jest.Mock).mockResolvedValue(updatedRoom);

      const result = await roomService.updateRoomStatus('1', RoomStatus.CLEANING);

      expect(result).toEqual(updatedRoom);
      expect(roomRepository.getRoomById).toHaveBeenCalledWith('1');
      expect(roomRepository.updateRoomStatus).toHaveBeenCalledWith('1', RoomStatus.CLEANING);
    });

    it('should throw error for invalid status', async () => {
      await expect(
        roomService.updateRoomStatus('1', 'INVALID_STATUS' as RoomStatus)
      ).rejects.toThrow('Invalid room status: INVALID_STATUS');
    });

    it('should throw error when room not found', async () => {
      (roomRepository.getRoomById as jest.Mock).mockResolvedValue(null);

      await expect(
        roomService.updateRoomStatus('999', RoomStatus.CLEANING)
      ).rejects.toThrow('Room with ID 999 not found');
    });

    it('should throw error when update fails', async () => {
      const existingRoom = {
        roomId: '1',
        roomNumber: '101',
        roomStatus: RoomStatus.AVAILABLE,
        roomType: 'Standard',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (roomRepository.getRoomById as jest.Mock).mockResolvedValue(existingRoom);
      (roomRepository.updateRoomStatus as jest.Mock).mockResolvedValue(null);

      await expect(
        roomService.updateRoomStatus('1', RoomStatus.CLEANING)
      ).rejects.toThrow('Failed to update room status for room 1');
    });
  });

  describe('getRoomStatusForDateRange', () => {
    it('should return bookings for date range', async () => {
      const mockRoom = {
        roomId: '1',
        roomNumber: '101',
        roomStatus: RoomStatus.AVAILABLE,
        roomType: 'Standard',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockBookings = [
        {
          bookingId: 'b1',
          checkInDate: new Date('2024-01-10'),
          checkOutDate: new Date('2024-01-15'),
          bookingStatus: 'ACTIVE',
          customerName: 'John Doe'
        }
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (roomRepository.getRoomById as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepository.getRoomStatusForDateRange as jest.Mock).mockResolvedValue(mockBookings);

      const result = await roomService.getRoomStatusForDateRange('1', startDate, endDate);

      expect(result).toEqual(mockBookings);
      expect(roomRepository.getRoomById).toHaveBeenCalledWith('1');
      expect(roomRepository.getRoomStatusForDateRange).toHaveBeenCalledWith('1', startDate, endDate);
    });

    it('should throw error when start date is after end date', async () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');

      await expect(
        roomService.getRoomStatusForDateRange('1', startDate, endDate)
      ).rejects.toThrow('Start date must be before end date');
    });

    it('should throw error when start date equals end date', async () => {
      const date = new Date('2024-01-15');

      await expect(
        roomService.getRoomStatusForDateRange('1', date, date)
      ).rejects.toThrow('Start date must be before end date');
    });

    it('should throw error when room not found', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (roomRepository.getRoomById as jest.Mock).mockResolvedValue(null);

      await expect(
        roomService.getRoomStatusForDateRange('999', startDate, endDate)
      ).rejects.toThrow('Room with ID 999 not found');
    });
  });
});
