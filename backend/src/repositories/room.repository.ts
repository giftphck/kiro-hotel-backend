import pool from '../config/database.config';
import { Room, RoomStatus } from '../models/room.model';

/**
 * Room Repository
 * Handles all database operations for rooms
 * Uses parameterized queries to prevent SQL injection
 */

/**
 * Get all rooms from the database
 * @returns Promise<Room[]> Array of all rooms
 */
export const getAllRooms = async (): Promise<Room[]> => {
  const query = `
    SELECT 
      room_id as "roomId",
      room_number as "roomNumber",
      room_status as "roomStatus",
      room_type as "roomType",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM rooms
    ORDER BY room_number ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get a single room by ID
 * @param roomId - UUID of the room
 * @returns Promise<Room | null> Room object or null if not found
 */
export const getRoomById = async (roomId: string): Promise<Room | null> => {
  const query = `
    SELECT 
      room_id as "roomId",
      room_number as "roomNumber",
      room_status as "roomStatus",
      room_type as "roomType",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM rooms
    WHERE room_id = $1
  `;

  const result = await pool.query(query, [roomId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Update room status
 * @param roomId - UUID of the room
 * @param status - New room status
 * @returns Promise<Room | null> Updated room object or null if not found
 */
export const updateRoomStatus = async (
  roomId: string,
  status: RoomStatus
): Promise<Room | null> => {
  const query = `
    UPDATE rooms
    SET 
      room_status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE room_id = $2
    RETURNING 
      room_id as "roomId",
      room_number as "roomNumber",
      room_status as "roomStatus",
      room_type as "roomType",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  const result = await pool.query(query, [status, roomId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Interface for room status in a date range
 */
export interface RoomStatusForDate {
  date: Date;
  roomStatus: RoomStatus;
  bookingId?: string;
  guestName?: string;
}

/**
 * Get room status for a date range
 * Returns the status of a room for each date in the specified range
 * @param roomId - UUID of the room
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Promise<RoomStatusForDate[]> Array of room statuses for each date
 */
export const getRoomStatusForDateRange = async (
  roomId: string,
  startDate: Date,
  endDate: Date
): Promise<RoomStatusForDate[]> => {
  const query = `
    WITH date_series AS (
      SELECT generate_series(
        $2::date,
        $3::date,
        '1 day'::interval
      )::date AS date
    )
    SELECT 
      ds.date,
      COALESCE(
        CASE 
          WHEN b.booking_id IS NOT NULL AND b.check_in_date <= ds.date AND b.check_out_date > ds.date THEN
            CASE 
              WHEN ds.date < b.check_in_date THEN 'RESERVED'
              WHEN ds.date >= b.check_in_date THEN 'OCCUPIED'
            END
          ELSE r.room_status
        END,
        r.room_status
      ) as "roomStatus",
      b.booking_id as "bookingId",
      c.name as "guestName"
    FROM date_series ds
    CROSS JOIN rooms r
    LEFT JOIN bookings b ON 
      b.room_id = r.room_id 
      AND b.booking_status = 'ACTIVE'
      AND b.check_in_date <= ds.date 
      AND b.check_out_date > ds.date
    LEFT JOIN customers c ON b.customer_id = c.customer_id
    WHERE r.room_id = $1
    ORDER BY ds.date ASC
  `;

  const result = await pool.query(query, [roomId, startDate, endDate]);
  return result.rows;
};
