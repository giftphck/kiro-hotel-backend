import * as roomRepository from '../repositories/room.repository';
import { Room, RoomStatus } from '../models/room.model';

export class RoomService {
  /**
   * Get all rooms
   */
  async getRooms(): Promise<Room[]> {
    return await roomRepository.getAllRooms();
  }

  /**
   * Get a room by ID
   * @throws Error if room not found
   */
  async getRoomById(roomId: string): Promise<Room> {
    const room = await roomRepository.getRoomById(roomId);
    
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found`);
    }
    
    return room;
  }

  /**
   * Update room status with validation
   * @throws Error if room not found or invalid status
   */
  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room> {
    // Validate status
    if (!Object.values(RoomStatus).includes(status)) {
      throw new Error(`Invalid room status: ${status}`);
    }

    // Check if room exists
    const existingRoom = await roomRepository.getRoomById(roomId);
    if (!existingRoom) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    // Update status
    const updatedRoom = await roomRepository.updateRoomStatus(roomId, status);
    
    if (!updatedRoom) {
      throw new Error(`Failed to update room status for room ${roomId}`);
    }
    
    return updatedRoom;
  }

  /**
   * Get room status for a date range
   * Returns bookings for the room within the specified date range
   */
  async getRoomStatusForDateRange(
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    // Validate dates
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    // Check if room exists
    const room = await roomRepository.getRoomById(roomId);
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    // Get bookings for the date range
    return await roomRepository.getRoomStatusForDateRange(roomId, startDate, endDate);
  }

  /**
   * Create a new room
   * Note: This is a placeholder - actual implementation needs createRoom in repository
   */
  async createRoom(_roomNumber: string, _roomType: string, _roomStatus?: RoomStatus): Promise<Room> {
    throw new Error('createRoom not implemented in repository');
  }

  /**
   * Update room details
   * Note: This is a placeholder - actual implementation needs updateRoom in repository
   */
  async updateRoom(_roomId: string, _roomNumber: string, _roomType: string): Promise<Room> {
    throw new Error('updateRoom not implemented in repository');
  }

  /**
   * Delete a room
   * Note: This is a placeholder - actual implementation needs deleteRoom in repository
   */
  async deleteRoom(_roomId: string): Promise<void> {
    throw new Error('deleteRoom not implemented in repository');
  }
}

export default new RoomService();
