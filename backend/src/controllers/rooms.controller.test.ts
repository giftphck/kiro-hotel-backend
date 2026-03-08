import { Request, Response, NextFunction } from 'express';
import roomsController from './rooms.controller';
import roomService from '../services/room.service';
import { RoomStatus } from '../models/room.model';

// Mock the room service
jest.mock('../services/room.service');

describe('RoomsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllRooms', () => {
    it('should return all rooms with 200 status', async () => {
      const mockRooms = [
        {
          roomId: '1',
          roomNumber: '101',
          roomStatus: RoomStatus.AVAILABLE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (roomService.getRooms as jest.Mock).mockResolvedValue(mockRooms);

      await roomsController.getAllRooms(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(roomService.getRooms).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRooms);
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Service error');
      (roomService.getRooms as jest.Mock).mockRejectedValue(error);

      await roomsController.getAllRooms(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getRoomById', () => {
    it('should return room with 200 status when found', async () => {
      const mockRoom = {
        roomId: '1',
        roomNumber: '101',
        roomStatus: RoomStatus.AVAILABLE,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '1' };
      (roomService.getRoomById as jest.Mock).mockResolvedValue(mockRoom);

      await roomsController.getRoomById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(roomService.getRoomById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRoom);
    });

    it('should return 404 when room not found', async () => {
      mockRequest.params = { id: '999' };
      (roomService.getRoomById as jest.Mock).mockRejectedValue(
        new Error('Room with ID 999 not found')
      );

      await roomsController.getRoomById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Room with ID 999 not found'
      });
    });
  });

  describe('getRoomStatus', () => {
    it('should return room status for valid date range', async () => {
      const mockStatusData = [
        { date: '2026-04-08', status: RoomStatus.AVAILABLE }
      ];

      mockRequest.params = { id: '1' };
      mockRequest.query = {
        startDate: '2026-04-08',
        endDate: '2026-04-15'
      };

      (roomService.getRoomStatusForDateRange as jest.Mock).mockResolvedValue(mockStatusData);

      await roomsController.getRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(roomService.getRoomStatusForDateRange).toHaveBeenCalledWith(
        '1',
        new Date('2026-04-08'),
        new Date('2026-04-15')
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockStatusData);
    });

    it('should return 400 when query parameters are missing', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.query = {};

      await roomsController.getRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required query parameters: startDate and endDate'
      });
    });

    it('should return 400 for invalid date format', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.query = {
        startDate: 'invalid-date',
        endDate: '2026-04-15'
      };

      await roomsController.getRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid date format. Use ISO date strings (YYYY-MM-DD)'
      });
    });

    it('should return 404 when room not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.query = {
        startDate: '2026-04-08',
        endDate: '2026-04-15'
      };

      (roomService.getRoomStatusForDateRange as jest.Mock).mockRejectedValue(
        new Error('Room with ID 999 not found')
      );

      await roomsController.getRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateRoomStatus', () => {
    it('should update room status and return 200', async () => {
      const mockUpdatedRoom = {
        roomId: '1',
        roomNumber: '101',
        roomStatus: RoomStatus.CLEANING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { status: RoomStatus.CLEANING };

      (roomService.updateRoomStatus as jest.Mock).mockResolvedValue(mockUpdatedRoom);

      await roomsController.updateRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(roomService.updateRoomStatus).toHaveBeenCalledWith('1', RoomStatus.CLEANING);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedRoom);
    });

    it('should return 400 when status is missing', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      await roomsController.updateRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required field: status'
      });
    });

    it('should return 400 for invalid status value', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'INVALID_STATUS' };

      await roomsController.updateRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid status')
      });
    });

    it('should return 404 when room not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { status: RoomStatus.CLEANING };

      (roomService.updateRoomStatus as jest.Mock).mockRejectedValue(
        new Error('Room with ID 999 not found')
      );

      await roomsController.updateRoomStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
