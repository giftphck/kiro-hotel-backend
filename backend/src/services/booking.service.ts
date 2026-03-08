import pool from '../config/database.config';
import bookingRepository, { CreateBookingData } from '../repositories/booking.repository';
import customerRepository from '../repositories/customer.repository';
import * as roomRepository from '../repositories/room.repository';
import paymentHistoryRepository from '../repositories/payment-history.repository';
import validationService from './validation.service';
import { Booking, BookingStatus, CreateBookingDto } from '../models/booking.model';
import { RoomStatus } from '../models/room.model';
import { PaymentType, PaymentHistory, PaymentStatus } from '../models/payment-history.model';

export class BookingService {
  /**
   * Create a new booking with complete flow:
   * 1. Validate booking data
   * 2. Check for double booking
   * 3. Create or find customer
   * 4. Create booking
   * 5. Update room status
   * All within a database transaction for atomicity
   */
  async createBooking(bookingDto: CreateBookingDto): Promise<Booking> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Validate booking data
      const validationResult = validationService.validateBooking(bookingDto);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // 2. Validate dates
      const dateValidation = validationService.validateDates(
        bookingDto.checkInDate,
        bookingDto.checkOutDate
      );
      if (!dateValidation.isValid) {
        throw new Error(dateValidation.errors.join(', '));
      }

      // 3. Check for double booking (with row-level locking)
      const doubleBookingCheck = await validationService.checkDoubleBooking(
        bookingDto.roomId,
        bookingDto.checkInDate,
        bookingDto.checkOutDate,
        client
      );
      if (!doubleBookingCheck.isValid) {
        throw new Error('Double booking detected: ' + doubleBookingCheck.errors.join(', '));
      }

      // 4. Create or find customer
      let customer = await customerRepository.findCustomerByThaiId(bookingDto.customer.thaiIdCard);
      
      if (!customer) {
        // Create new customer
        customer = await customerRepository.createCustomer({
          name: bookingDto.customer.name,
          phoneNumber: bookingDto.customer.phoneNumber,
          thaiIdCard: bookingDto.customer.thaiIdCard
        });
      }

      // 5. Determine room status based on check-in date
      const now = new Date();
      const checkInDate = new Date(bookingDto.checkInDate);
      let newRoomStatus: RoomStatus;
      
      if (checkInDate <= now) {
        // Check-in is today or in the past -> OCCUPIED
        newRoomStatus = RoomStatus.OCCUPIED;
      } else {
        // Check-in is in the future -> RESERVED
        newRoomStatus = RoomStatus.RESERVED;
      }

      // 6. Create booking
      const bookingData: CreateBookingData = {
        roomId: bookingDto.roomId,
        customerId: customer.customerId,
        bookingType: bookingDto.bookingType,
        checkInDate: new Date(bookingDto.checkInDate),
        checkOutDate: new Date(bookingDto.checkOutDate),
        numberOfGuests: bookingDto.numberOfGuests,
        priceType: bookingDto.priceType,
        unitPrice: bookingDto.unitPrice,
        totalPrice: bookingDto.calculatedPrice || bookingDto.totalPrice,
        deposit: bookingDto.deposit,
        remark: bookingDto.remark,
        bookingStatus: BookingStatus.ACTIVE
      };

      const booking = await bookingRepository.createBooking(bookingData, client);

      // 7. Update room status
      await roomRepository.updateRoomStatus(bookingDto.roomId, newRoomStatus);

      // 8. Record initial payments
      // 8.1 Record deposit if deposit > 0
      if (bookingDto.deposit > 0) {
        await paymentHistoryRepository.create({
          bookingId: booking.bookingId,
          amount: bookingDto.deposit,
          priceType: bookingDto.priceType,
          paymentType: PaymentType.DEPOSIT,
          remark: 'เงินมัดจำ'
        }, client);
      }

      await client.query('COMMIT');
      
      // Return booking with populated data
      const fullBooking = await bookingRepository.getBookingById(booking.bookingId);
      if (!fullBooking) {
        throw new Error('Failed to retrieve created booking');
      }
      
      return fullBooking;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all bookings with optional filters
   */
  async getBookings(filters?: {
    roomId?: string;
    customerId?: string;
    bookingStatus?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Booking[]> {
    return await bookingRepository.getBookings(filters);
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    const booking = await bookingRepository.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    return booking;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const booking = await bookingRepository.updateBookingStatus(bookingId, status);
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    return booking;
  }

  /**
   * Update booking deposit and record payment history
   * Supports both adding payment (positive amount) and refund (negative amount)
   */
  async updateBookingDeposit(bookingId: string, paymentAmount: number): Promise<Booking> {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Get current booking
        const currentBooking = await bookingRepository.getBookingById(bookingId);
        if (!currentBooking) {
          throw new Error('Booking not found');
        }

        // Convert payment amount to number
        const paymentAmountNum = Number(paymentAmount);

        console.log('=== DEBUG updateBookingDeposit ===');
        console.log('bookingId:', bookingId);
        console.log('paymentAmount (received):', paymentAmount);
        console.log('paymentAmountNum (converted):', paymentAmountNum);

        // Get total paid from payment history with status filtering and refund handling
        const paymentHistory = await paymentHistoryRepository.findByBookingId(bookingId);
        const totalPaid = paymentHistory
          .filter(payment => payment.status === PaymentStatus.SUCCESS)
          .reduce((sum, payment) => {
            const amount = Number(payment.amount);
            return payment.paymentType === PaymentType.REFUND 
              ? sum - amount  // Subtract refunds (stored as positive)
              : sum + amount; // Add other payments
          }, 0);

        // Check if this is a refund (negative amount)
        const isRefund = paymentAmountNum < 0;
        const absoluteAmount = Math.abs(paymentAmountNum);

        if (isRefund) {
          // Calculate remaining deposit for refund validation
          const depositPaid = paymentHistory
            .filter(p => p.status === PaymentStatus.SUCCESS && p.paymentType === PaymentType.DEPOSIT)
            .reduce((sum, p) => sum + Number(p.amount), 0);
          const alreadyRefunded = paymentHistory
            .filter(p => p.status === PaymentStatus.SUCCESS && p.paymentType === PaymentType.REFUND)
            .reduce((sum, p) => sum + Number(p.amount), 0);
          const remainingDeposit = depositPaid - alreadyRefunded;

          // Validate refund amount cannot exceed remaining deposit
          if (absoluteAmount > remainingDeposit) {
            throw new Error(
              `Refund amount cannot exceed remaining deposit of ${remainingDeposit} baht`
            );
          }
          if (absoluteAmount < 1) {
            throw new Error('Refund amount must be at least 1 baht');
          }
        } else {
          // Validate payment amount: must be at least 1 baht
          if (paymentAmountNum < 1) {
            throw new Error('Payment amount must be at least 1 baht');
          }

          // Validate payment cannot exceed calculated room price
          const calculatedPrice = Number(currentBooking.totalPrice);
          const newTotalPaid = totalPaid + paymentAmountNum;
          if (newTotalPaid > calculatedPrice) {
            throw new Error(
              `Payment amount would exceed calculated room price. ` +
              `Maximum additional payment: ${calculatedPrice - totalPaid} baht`
            );
          }
        }

        const newTotalPaid = totalPaid + paymentAmountNum;

        console.log('totalPaid (from payment_history):', totalPaid);
        console.log('isRefund:', isRefund);
        console.log('newTotalPaid:', newTotalPaid);

        // Determine payment type based on calculated price
        const calculatedPrice = Number(currentBooking.totalPrice);
        let paymentType: PaymentType;
        if (newTotalPaid >= calculatedPrice) {
          paymentType = PaymentType.FULL;
        } else {
          paymentType = PaymentType.PARTIAL;
        }

        // Update booking deposit to match total paid
        const booking = await bookingRepository.updateBookingDeposit(bookingId, newTotalPaid);
        if (!booking) {
          throw new Error('Failed to update booking deposit');
        }

        // Record payment history with status field
        await paymentHistoryRepository.create({
          bookingId,
          amount: absoluteAmount, // Always positive
          priceType: currentBooking.priceType,
          paymentType: isRefund ? PaymentType.REFUND : paymentType,
          status: PaymentStatus.SUCCESS, // Add status field
          remark: isRefund ? 'คืนเงินมัดจำ' : (paymentType === PaymentType.FULL ? 'ชำระครบแล้ว' : 'รับเงินเพิ่ม')
        }, client);

        await client.query('COMMIT');

        return booking;

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }


  /**
   * Get payment history for a booking
   */
  async getPaymentHistory(bookingId: string): Promise<PaymentHistory[]> {
    return await paymentHistoryRepository.findByBookingId(bookingId);
  }

  /**
   * Cancel booking (set status to CANCELLED and update room status)
   */
  async cancelBooking(bookingId: string): Promise<Booking> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get booking details
      const booking = await bookingRepository.getBookingById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update booking status to CANCELLED
      const updatedBooking = await bookingRepository.updateBookingStatus(bookingId, BookingStatus.CANCELLED);
      if (!updatedBooking) {
        throw new Error('Failed to cancel booking');
      }

      // Update room status to AVAILABLE
      await roomRepository.updateRoomStatus(booking.roomId, RoomStatus.AVAILABLE);

      await client.query('COMMIT');
      
      return updatedBooking;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get today's check-ins
   */
  async getTodayCheckIns(): Promise<Booking[]> {
    const today = new Date();
    return await bookingRepository.getTodayCheckIns(today);
  }

  /**
   * Get today's check-outs
   */
  async getTodayCheckOuts(): Promise<Booking[]> {
    const today = new Date();
    return await bookingRepository.getTodayCheckOuts(today);
  }
}

export default new BookingService();
