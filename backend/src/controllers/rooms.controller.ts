import { Request, Response, NextFunction } from 'express';
import roomService from '../services/room.service';
import { RoomStatus } from '../models/room.model';

export class RoomsController {
  /**
   * GET /api/rooms
   * Get all rooms
   */
  async getAllRooms(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rooms = await roomService.getRooms();
      res.status(200).json(rooms);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rooms/:id
   * Get room by ID
   */
  async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);
      res.status(200).json(room);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * GET /api/rooms/:id/status
   * Get room status for date range
   * Query params: startDate, endDate (ISO date strings)
   */
  async getRoomStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      // Validate query parameters
      if (!startDate || !endDate) {
        res.status(400).json({ 
          error: 'Missing required query parameters: startDate and endDate' 
        });
        return;
      }

      // Parse dates
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      // Validate date parsing
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Invalid date format. Use ISO date strings (YYYY-MM-DD)' 
        });
        return;
      }

      const statusData = await roomService.getRoomStatusForDateRange(id, start, end);
      res.status(200).json(statusData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('Start date')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * PUT /api/rooms/:id/status
   * Update room status
   * Body: { status: RoomStatus }
   */
  async updateRoomStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate request body
      if (!status) {
        res.status(400).json({ 
          error: 'Missing required field: status' 
        });
        return;
      }

      // Validate status value
      if (!Object.values(RoomStatus).includes(status)) {
        res.status(400).json({ 
          error: `Invalid status. Must be one of: ${Object.values(RoomStatus).join(', ')}` 
        });
        return;
      }

      const updatedRoom = await roomService.updateRoomStatus(id, status);
      res.status(200).json(updatedRoom);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('Invalid')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * POST /api/rooms
   * Create a new room
   * Body: { roomNumber: string, roomType: string, roomStatus?: RoomStatus }
   */
  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomNumber, roomType, roomStatus } = req.body;

      // Validate request body
      if (!roomNumber || !roomType) {
        res.status(400).json({ 
          error: 'Missing required fields: roomNumber and roomType' 
        });
        return;
      }

      const newRoom = await roomService.createRoom(roomNumber, roomType, roomStatus);
      res.status(201).json(newRoom);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('required')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * PUT /api/rooms/:id
   * Update room details
   * Body: { roomNumber: string, roomType: string }
   */
  async updateRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { roomNumber, roomType } = req.body;

      // Validate request body
      if (!roomNumber || !roomType) {
        res.status(400).json({ 
          error: 'Missing required fields: roomNumber and roomType' 
        });
        return;
      }

      const updatedRoom = await roomService.updateRoom(id, roomNumber, roomType);
      res.status(200).json(updatedRoom);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('required')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * DELETE /api/rooms/:id
   * Delete a room
   */
  async deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await roomService.deleteRoom(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('active bookings')) {
        res.status(409).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }
}

export default new RoomsController();
