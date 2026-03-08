import pool from '../config/database.config';
import { RoomPrice } from '../models/room-price.model';

export interface CreateRoomPriceData {
  roomId: string;
  date: Date;
  threeHourPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
}

export interface UpdateRoomPriceData {
  threeHourPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
}

export interface RoomPriceFilters {
  roomId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class RoomPriceRepository {
  /**
   * Create a new room price record
   */
  async createRoomPrice(roomPrice: CreateRoomPriceData): Promise<RoomPrice> {
    const query = `
      INSERT INTO room_prices (
        room_id, date, 
        three_hour_price, daily_price, monthly_price
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        price_id as "priceId",
        room_id as "roomId",
        date,
        three_hour_price as "threeHourPrice",
        daily_price as "dailyPrice",
        monthly_price as "monthlyPrice",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [
      roomPrice.roomId,
      roomPrice.date,
      roomPrice.threeHourPrice || null,
      roomPrice.dailyPrice || null,
      roomPrice.monthlyPrice || null
    ]);
    
    return result.rows[0];
  }

  /**
   * Get room price by room ID and date
   */
  async getRoomPriceByRoomAndDate(roomId: string, date: Date): Promise<RoomPrice | null> {
    const query = `
      SELECT 
        price_id as "priceId",
        room_id as "roomId",
        date,
        three_hour_price as "threeHourPrice",
        daily_price as "dailyPrice",
        monthly_price as "monthlyPrice",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM room_prices
      WHERE room_id = $1 AND date = $2
    `;
    
    const result = await pool.query(query, [roomId, date]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get room prices with optional filters
   */
  async getRoomPrices(filters?: RoomPriceFilters): Promise<RoomPrice[]> {
    let query = `
      SELECT 
        rp.price_id as "priceId",
        rp.room_id as "roomId",
        rp.date,
        rp.three_hour_price as "threeHourPrice",
        rp.daily_price as "dailyPrice",
        rp.monthly_price as "monthlyPrice",
        rp.created_at as "createdAt",
        rp.updated_at as "updatedAt",
        r.room_number as "roomNumber"
      FROM room_prices rp
      JOIN rooms r ON rp.room_id = r.room_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.roomId) {
      query += ` AND rp.room_id = $${paramIndex++}`;
      params.push(filters.roomId);
    }
    if (filters?.startDate) {
      query += ` AND rp.date >= $${paramIndex++}`;
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ` AND rp.date <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    query += ` ORDER BY rp.date ASC, r.room_number ASC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Update room price
   */
  async updateRoomPrice(priceId: string, roomPrice: UpdateRoomPriceData): Promise<RoomPrice | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (roomPrice.threeHourPrice !== undefined) {
      updates.push(`three_hour_price = $${paramIndex++}`);
      values.push(roomPrice.threeHourPrice);
    }
    if (roomPrice.dailyPrice !== undefined) {
      updates.push(`daily_price = $${paramIndex++}`);
      values.push(roomPrice.dailyPrice);
    }
    if (roomPrice.monthlyPrice !== undefined) {
      updates.push(`monthly_price = $${paramIndex++}`);
      values.push(roomPrice.monthlyPrice);
    }

    if (updates.length === 0) {
      // No updates, return existing record
      const query = `
        SELECT 
          price_id as "priceId",
          room_id as "roomId",
          date,
          three_hour_price as "threeHourPrice",
          daily_price as "dailyPrice",
          monthly_price as "monthlyPrice",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM room_prices
        WHERE price_id = $1
      `;
      const result = await pool.query(query, [priceId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(priceId);

    const query = `
      UPDATE room_prices
      SET ${updates.join(', ')}
      WHERE price_id = $${paramIndex}
      RETURNING 
        price_id as "priceId",
        room_id as "roomId",
        date,
        three_hour_price as "threeHourPrice",
        daily_price as "dailyPrice",
        monthly_price as "monthlyPrice",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Delete room price
   */
  async deleteRoomPrice(priceId: string): Promise<boolean> {
    const query = `
      DELETE FROM room_prices
      WHERE price_id = $1
      RETURNING price_id
    `;
    
    const result = await pool.query(query, [priceId]);
    return result.rows.length > 0;
  }

  /**
   * Get room price by ID
   */
  async getRoomPriceById(priceId: string): Promise<RoomPrice | null> {
    const query = `
      SELECT 
        price_id as "priceId",
        room_id as "roomId",
        date,
        three_hour_price as "threeHourPrice",
        daily_price as "dailyPrice",
        monthly_price as "monthlyPrice",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM room_prices
      WHERE price_id = $1
    `;
    
    const result = await pool.query(query, [priceId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export default new RoomPriceRepository();
