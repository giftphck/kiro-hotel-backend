import pool from '../config/database.config';
import { PoolClient } from 'pg';
import { PaymentHistory, CreatePaymentHistoryDto } from '../models/payment-history.model';

class PaymentHistoryRepository {
  /**
   * Create a new payment history record
   */
  async create(dto: CreatePaymentHistoryDto, client?: PoolClient): Promise<PaymentHistory> {
    const db = client || pool;
    
    const query = `
      INSERT INTO payment_history (
        booking_id, amount, price_type, payment_type, payment_method, status, remark, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        payment_id as "paymentId",
        booking_id as "bookingId",
        amount,
        price_type as "priceType",
        payment_type as "paymentType",
        payment_method as "paymentMethod",
        status,
        remark,
        created_at as "createdAt",
        created_by as "createdBy"
    `;
    
    const values = [
      dto.bookingId,
      dto.amount,
      dto.priceType || null,
      dto.paymentType,
      dto.paymentMethod || null,
      dto.status || 'SUCCESS',
      dto.remark || null,
      dto.createdBy || null
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all payment history for a booking
   */
  async findByBookingId(bookingId: string): Promise<PaymentHistory[]> {
    const query = `
      SELECT 
        payment_id as "paymentId",
        booking_id as "bookingId",
        amount,
        price_type as "priceType",
        payment_type as "paymentType",
        payment_method as "paymentMethod",
        status,
        remark,
        created_at as "createdAt",
        created_by as "createdBy"
      FROM payment_history
      WHERE booking_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [bookingId]);
    return result.rows;
  }

  /**
   * Get payment history by ID
   */
  async findById(paymentId: string): Promise<PaymentHistory | null> {
    const query = `
      SELECT 
        payment_id as "paymentId",
        booking_id as "bookingId",
        amount,
        price_type as "priceType",
        payment_type as "paymentType",
        payment_method as "paymentMethod",
        status,
        remark,
        created_at as "createdAt",
        created_by as "createdBy"
      FROM payment_history
      WHERE payment_id = $1
    `;
    
    const result = await pool.query(query, [paymentId]);
    return result.rows[0] || null;
  }

  /**
   * Delete all payment history for a booking (used when booking is deleted)
   */
  async deleteByBookingId(bookingId: string, client?: PoolClient): Promise<void> {
    const db = client || pool;
    await db.query('DELETE FROM payment_history WHERE booking_id = $1', [bookingId]);
  }
}

export default new PaymentHistoryRepository();
