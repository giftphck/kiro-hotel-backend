import { PoolClient } from 'pg';
import pool from '../config/database.config';
import { Booking, BookingStatus, BookingType } from '../models/booking.model';

export interface CreateBookingData {
  roomId: string;
  customerId: string;
  bookingType: BookingType;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  priceType: string;
  unitPrice: number;
  totalPrice: number;
  deposit: number;
  remark?: string;
  bookingStatus: BookingStatus;
}

export interface BookingFilters {
  roomId?: string;
  customerId?: string;
  bookingStatus?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  checkOutDateStart?: Date;
  checkOutDateEnd?: Date;
  status?: BookingStatus; // Alias for bookingStatus
}

export class BookingRepository {
  /**
   * Create a new booking
   * Note: This should be called within a transaction
   */
  async createBooking(booking: CreateBookingData, client?: PoolClient): Promise<Booking> {
    const dbClient = client || pool;
    
    const query = `
      INSERT INTO bookings (
        room_id, customer_id, booking_type, 
        check_in_date, check_out_date, 
        number_of_guests, price_type, unit_price, total_price, deposit, 
        remark, booking_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING 
        booking_id as "bookingId",
        room_id as "roomId",
        customer_id as "customerId",
        booking_type as "bookingType",
        check_in_date as "checkInDate",
        check_out_date as "checkOutDate",
        actual_check_in_at as "actualCheckInAt",
        actual_check_out_at as "actualCheckOutAt",
        number_of_guests as "numberOfGuests",
        price_type as "priceType",
        unit_price as "unitPrice",
        total_price as "totalPrice",
        deposit,
        remark,
        booking_status as "bookingStatus",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await dbClient.query(query, [
      booking.roomId,
      booking.customerId,
      booking.bookingType,
      booking.checkInDate,
      booking.checkOutDate,
      booking.numberOfGuests,
      booking.priceType,
      booking.unitPrice,
      booking.totalPrice,
      booking.deposit,
      booking.remark || null,
      booking.bookingStatus
    ]);
    
    return result.rows[0];
  }

  /**
   * Get booking by ID with populated room and customer data
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    const query = `
      SELECT 
        b.booking_id as "bookingId",
        b.room_id as "roomId",
        b.customer_id as "customerId",
        b.booking_type as "bookingType",
        b.check_in_date as "checkInDate",
        b.check_out_date as "checkOutDate",
        b.actual_check_in_at as "actualCheckInAt",
        b.actual_check_out_at as "actualCheckOutAt",
        b.number_of_guests as "numberOfGuests",
        b.price_type as "priceType",
        b.unit_price as "unitPrice",
        b.total_price as "totalPrice",
        b.deposit,
        b.remark,
        b.booking_status as "bookingStatus",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt",
        -- Room data
        r.room_number as "roomNumber",
        r.room_status as "roomStatus",
        r.room_type as "roomType",
        -- Customer data
        c.name as "customerName",
        c.phone_number as "customerPhone",
        c.thai_id_card as "customerThaiId"
      FROM bookings b
      JOIN rooms r ON b.room_id = r.room_id
      JOIN customers c ON b.customer_id = c.customer_id
      WHERE b.booking_id = $1
    `;
    
    const result = await pool.query(query, [bookingId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get bookings with optional filters
   */
  async getBookings(filters?: BookingFilters): Promise<Booking[]> {
    let query = `
      SELECT 
        b.booking_id as "bookingId",
        b.room_id as "roomId",
        b.customer_id as "customerId",
        b.booking_type as "bookingType",
        b.check_in_date as "checkInDate",
        b.check_out_date as "checkOutDate",
        b.actual_check_in_at as "actualCheckInAt",
        b.actual_check_out_at as "actualCheckOutAt",
        b.number_of_guests as "numberOfGuests",
        b.price_type as "priceType",
        b.unit_price as "unitPrice",
        b.total_price as "totalPrice",
        b.deposit,
        b.remark,
        b.booking_status as "bookingStatus",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt",
        -- Room data
        r.room_number as "roomNumber",
        r.room_status as "roomStatus",
        -- Customer data
        c.name as "customerName",
        c.phone_number as "customerPhone"
      FROM bookings b
      JOIN rooms r ON b.room_id = r.room_id
      JOIN customers c ON b.customer_id = c.customer_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.roomId) {
      query += ` AND b.room_id = $${paramIndex++}`;
      params.push(filters.roomId);
    }
    if (filters?.customerId) {
      query += ` AND b.customer_id = $${paramIndex++}`;
      params.push(filters.customerId);
    }
    if (filters?.bookingStatus) {
      query += ` AND b.booking_status = $${paramIndex++}`;
      params.push(filters.bookingStatus);
    }
    if (filters?.startDate) {
      query += ` AND b.check_out_date > $${paramIndex++}`;
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ` AND b.check_in_date < $${paramIndex++}`;
      params.push(filters.endDate);
    }
    if (filters?.checkOutDateStart) {
      query += ` AND b.check_out_date >= $${paramIndex++}`;
      params.push(filters.checkOutDateStart);
    }
    if (filters?.checkOutDateEnd) {
      query += ` AND b.check_out_date <= $${paramIndex++}`;
      params.push(filters.checkOutDateEnd);
    }
    if (filters?.status && !filters?.bookingStatus) {
      query += ` AND b.booking_status = $${paramIndex++}`;
      params.push(filters.status);
    }

    query += ` ORDER BY b.check_in_date DESC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
    const query = `
      UPDATE bookings
      SET booking_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE booking_id = $2
      RETURNING 
        booking_id as "bookingId",
        room_id as "roomId",
        customer_id as "customerId",
        booking_type as "bookingType",
        check_in_date as "checkInDate",
        check_out_date as "checkOutDate",
        actual_check_in_at as "actualCheckInAt",
        actual_check_out_at as "actualCheckOutAt",
        number_of_guests as "numberOfGuests",
        price_type as "priceType",
        unit_price as "unitPrice",
        total_price as "totalPrice",
        deposit,
        remark,
        booking_status as "bookingStatus",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [status, bookingId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update booking deposit
   */
  async updateBookingDeposit(bookingId: string, deposit: number): Promise<Booking | null> {
    const query = `
      UPDATE bookings
      SET deposit = $1, updated_at = CURRENT_TIMESTAMP
      WHERE booking_id = $2
      RETURNING 
        booking_id as "bookingId",
        room_id as "roomId",
        customer_id as "customerId",
        booking_type as "bookingType",
        check_in_date as "checkInDate",
        check_out_date as "checkOutDate",
        actual_check_in_at as "actualCheckInAt",
        actual_check_out_at as "actualCheckOutAt",
        number_of_guests as "numberOfGuests",
        price_type as "priceType",
        unit_price as "unitPrice",
        total_price as "totalPrice",
        deposit,
        remark,
        booking_status as "bookingStatus",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [deposit, bookingId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get today's check-ins
   * Returns bookings where check_in_date equals the given date and status is ACTIVE
   */
  async getTodayCheckIns(date: Date): Promise<Booking[]> {
    const query = `
      SELECT 
        b.booking_id as "bookingId",
        b.room_id as "roomId",
        b.customer_id as "customerId",
        b.booking_type as "bookingType",
        b.check_in_date as "checkInDate",
        b.check_out_date as "checkOutDate",
        b.number_of_guests as "numberOfGuests",
        b.deposit,
        b.remark,
        b.booking_status as "bookingStatus",
        -- Room data
        r.room_number as "roomNumber",
        -- Customer data
        c.name as "customerName",
        c.phone_number as "customerPhone"
      FROM bookings b
      JOIN rooms r ON b.room_id = r.room_id
      JOIN customers c ON b.customer_id = c.customer_id
      WHERE DATE(b.check_in_date) = DATE($1)
        AND b.booking_status = 'ACTIVE'
      ORDER BY b.check_in_date ASC
    `;
    
    const result = await pool.query(query, [date]);
    return result.rows;
  }

  /**
   * Get today's check-outs
   * Returns bookings where check_out_date equals the given date and status is ACTIVE
   */
  async getTodayCheckOuts(date: Date): Promise<Booking[]> {
    const query = `
      SELECT 
        b.booking_id as "bookingId",
        b.room_id as "roomId",
        b.customer_id as "customerId",
        b.booking_type as "bookingType",
        b.check_in_date as "checkInDate",
        b.check_out_date as "checkOutDate",
        b.number_of_guests as "numberOfGuests",
        b.deposit,
        b.remark,
        b.booking_status as "bookingStatus",
        -- Room data
        r.room_number as "roomNumber",
        -- Customer data
        c.name as "customerName",
        c.phone_number as "customerPhone"
      FROM bookings b
      JOIN rooms r ON b.room_id = r.room_id
      JOIN customers c ON b.customer_id = c.customer_id
      WHERE DATE(b.check_out_date) = DATE($1)
        AND b.booking_status = 'ACTIVE'
      ORDER BY b.check_out_date ASC
    `;
    
    const result = await pool.query(query, [date]);
    return result.rows;
  }

  /**
   * Find overlapping bookings for a room in a given time range
   * CRITICAL: Uses SELECT ... FOR UPDATE for row-level locking to prevent race conditions
   * 
   * Overlap logic (from BOOKING_RULES.md):
   * - Only checks against ACTIVE bookings
   * - Two bookings overlap if: (existing.check_in_date < new.check_out_date) 
   *   AND (existing.check_out_date > new.check_in_date)
   * 
   * @param roomId - The room to check
   * @param checkInDate - New booking check-in date
   * @param checkOutDate - New booking check-out date
   * @param client - Optional database client for transaction support
   * @returns Array of overlapping bookings
   */
  async findOverlappingBookings(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
    client?: PoolClient
  ): Promise<Booking[]> {
    const dbClient = client || pool;
    
    const query = `
      SELECT 
        booking_id as "bookingId",
        room_id as "roomId",
        customer_id as "customerId",
        booking_type as "bookingType",
        check_in_date as "checkInDate",
        check_out_date as "checkOutDate",
        number_of_guests as "numberOfGuests",
        deposit,
        remark,
        booking_status as "bookingStatus",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bookings
      WHERE room_id = $1
        AND booking_status = 'ACTIVE'
        AND check_in_date < $3
        AND check_out_date > $2
      FOR UPDATE
    `;
    
    const result = await dbClient.query(query, [roomId, checkInDate, checkOutDate]);
    return result.rows;
  }
}

export default new BookingRepository();
