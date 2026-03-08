import { PoolClient } from 'pg';
import pool from '../config/database.config';
import { Guest } from '../models/guest.model';

export interface CreateGuestData {
  bookingId: string;
  guestName: string;
  idCardNumber: string;
}

export interface UpdateGuestData {
  guestName?: string;
  idCardNumber?: string;
}

export class GuestRepository {
  /**
   * Create a new guest
   * Note: Can be called within a transaction
   */
  async createGuest(guest: CreateGuestData, client?: PoolClient): Promise<Guest> {
    const dbClient = client || pool;
    
    const query = `
      INSERT INTO guests (booking_id, guest_name, id_card_number)
      VALUES ($1, $2, $3)
      RETURNING 
        guest_id as "guestId",
        booking_id as "bookingId",
        guest_name as "guestName",
        id_card_number as "idCardNumber",
        created_at as "createdAt"
    `;
    
    const result = await dbClient.query(query, [
      guest.bookingId,
      guest.guestName,
      guest.idCardNumber
    ]);
    
    return result.rows[0];
  }

  /**
   * Get all guests for a specific booking
   */
  async getGuestsByBookingId(bookingId: string): Promise<Guest[]> {
    const query = `
      SELECT 
        guest_id as "guestId",
        booking_id as "bookingId",
        guest_name as "guestName",
        id_card_number as "idCardNumber",
        created_at as "createdAt"
      FROM guests
      WHERE booking_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [bookingId]);
    return result.rows;
  }

  /**
   * Get a guest by ID
   */
  async getGuestById(guestId: string): Promise<Guest | null> {
    const query = `
      SELECT 
        guest_id as "guestId",
        booking_id as "bookingId",
        guest_name as "guestName",
        id_card_number as "idCardNumber",
        created_at as "createdAt"
      FROM guests
      WHERE guest_id = $1
    `;
    
    const result = await pool.query(query, [guestId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update guest information
   */
  async updateGuest(guestId: string, guest: UpdateGuestData): Promise<Guest | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (guest.guestName !== undefined) {
      updates.push(`guest_name = $${paramIndex++}`);
      values.push(guest.guestName);
    }
    if (guest.idCardNumber !== undefined) {
      updates.push(`id_card_number = $${paramIndex++}`);
      values.push(guest.idCardNumber);
    }

    if (updates.length === 0) {
      return this.getGuestById(guestId);
    }

    values.push(guestId);

    const query = `
      UPDATE guests
      SET ${updates.join(', ')}
      WHERE guest_id = $${paramIndex}
      RETURNING 
        guest_id as "guestId",
        booking_id as "bookingId",
        guest_name as "guestName",
        id_card_number as "idCardNumber",
        created_at as "createdAt"
    `;
    
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete a guest
   */
  async deleteGuest(guestId: string): Promise<boolean> {
    const query = `
      DELETE FROM guests
      WHERE guest_id = $1
      RETURNING guest_id
    `;
    
    const result = await pool.query(query, [guestId]);
    return result.rows.length > 0;
  }
}

export default new GuestRepository();
