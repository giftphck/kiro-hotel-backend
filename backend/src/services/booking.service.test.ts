/**
 * Unit Tests for BookingService - Payment Calculation Fix
 * 
 * These tests validate the fixed behavior of updateBookingDeposit method:
 * - Correct calculation of totalPaid with refunds
 * - Refunds stored as positive amounts with REFUND type
 * - Failed payments excluded from totalPaid calculation
 * - Business rule validations for refunds and payments
 * - Edge cases and error handling
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import bookingService, { BookingService } from './booking.service';
import bookingRepository from '../repositories/booking.repository';
import paymentHistoryRepository from '../repositories/payment-history.repository';
import pool from '../config/database.config';
import { PaymentType, PaymentStatus, PaymentHistory } from '../models/payment-history.model';
import { Booking, BookingType, BookingStatus } from '../models/booking.model';

// Mock dependencies
jest.mock('../repositories/booking.repository');
jest.mock('../repositories/payment-history.repository');
jest.mock('../config/database.config');

describe('BookingService - updateBookingDeposit', () => {
  let service: BookingService;
  let mockClient: any;

  beforeEach(() => {
    service = bookingService;
    jest.clearAllMocks();

    // Mock database client
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  const createMockBooking = (totalPrice: number = 2000): Booking => ({
    bookingId: 'test-booking-1',
    roomId: 'room-1',
    customerId: 'customer-1',
    bookingType: BookingType.DAILY,
    checkInDate: new Date('2024-01-01'),
    checkOutDate: new Date('2024-01-05'),
    numberOfGuests: 2,
    priceType: 'DAILY',
    unitPrice: 500,
    totalPrice,
    deposit: 0,
    bookingStatus: BookingStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const createMockPaymentHistory = (
    amount: number,
    paymentType: PaymentType,
    status: PaymentStatus = PaymentStatus.SUCCESS
  ): PaymentHistory => ({
    paymentId: `payment-${Math.random()}`,
    bookingId: 'test-booking-1',
    amount,
    paymentType,
    status,
    createdAt: new Date()
  });

  describe('Correct totalPaid calculation with refunds', () => {
    it('should correctly calculate totalPaid when payment history contains refunds', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(500, PaymentType.REFUND, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 700
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 200);

      // Verify totalPaid calculation: 1000 - 500 = 500, then + 200 = 700
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 700);
    });

    it('should correctly handle multiple refunds reducing total', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(2000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(300, PaymentType.REFUND, PaymentStatus.SUCCESS),
        createMockPaymentHistory(200, PaymentType.REFUND, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1600
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 100);

      // Verify totalPaid: 2000 - 300 - 200 = 1500, then + 100 = 1600
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 1600);
    });

    it('should correctly calculate totalPaid with mixed payment types and refunds', async () => {
      // **Validates: Requirements 2.1, 2.3**
      const mockBooking = createMockBooking(3000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(500, PaymentType.PARTIAL, PaymentStatus.SUCCESS),
        createMockPaymentHistory(200, PaymentType.REFUND, PaymentStatus.SUCCESS),
        createMockPaymentHistory(300, PaymentType.PARTIAL, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1700
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 100);

      // Verify totalPaid: (1000 + 500 + 300) - 200 = 1600, then + 100 = 1700
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 1700);
    });
  });

  describe('Refunds stored as positive amounts with REFUND type', () => {
    it('should store refund as positive amount with REFUND payment type', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 500
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      // Pass negative amount to indicate refund
      await service.updateBookingDeposit('test-booking-1', -500);

      // Verify refund is stored as positive amount with REFUND type
      expect(paymentHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 'test-booking-1',
          amount: 500, // Positive amount
          paymentType: PaymentType.REFUND,
          status: PaymentStatus.SUCCESS,
          remark: 'คืนเงินมัดจำ'
        }),
        mockClient
      );
    });

    it('should calculate correct totalPaid after refund (subtract from total)', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 700
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', -300);

      // Verify totalPaid: 1000 - 300 = 700
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 700);
    });
  });

  describe('Failed payments excluded from totalPaid calculation', () => {
    it('should exclude FAILED status payments from totalPaid', async () => {
      // **Validates: Requirements 2.2**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(500, PaymentType.PARTIAL, PaymentStatus.FAILED)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1200
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 200);

      // Verify totalPaid: only SUCCESS payments counted: 1000 + 200 = 1200
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 1200);
    });

    it('should exclude PENDING status payments from totalPaid', async () => {
      // **Validates: Requirements 2.2**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(300, PaymentType.PARTIAL, PaymentStatus.PENDING)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1100
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 100);

      // Verify totalPaid: only SUCCESS payments: 1000 + 100 = 1100
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 1100);
    });

    it('should handle mixed SUCCESS, FAILED, and PENDING payments correctly', async () => {
      // **Validates: Requirements 2.2, 2.3**
      const mockBooking = createMockBooking(3000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(500, PaymentType.PARTIAL, PaymentStatus.FAILED),
        createMockPaymentHistory(300, PaymentType.PARTIAL, PaymentStatus.SUCCESS),
        createMockPaymentHistory(200, PaymentType.PARTIAL, PaymentStatus.PENDING)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1400
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 100);

      // Verify totalPaid: only SUCCESS: 1000 + 300 + 100 = 1400
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 1400);
    });
  });

  describe('Validation: refund cannot exceed remaining deposit', () => {
    it('should throw error when refund exceeds remaining deposit', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(300, PaymentType.REFUND, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      // Remaining deposit: 1000 - 300 = 700
      // Attempting to refund 800 should fail
      await expect(
        service.updateBookingDeposit('test-booking-1', -800)
      ).rejects.toThrow('Refund amount cannot exceed remaining deposit of 700 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should allow refund equal to remaining deposit', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(300, PaymentType.REFUND, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 0
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      // Remaining deposit: 1000 - 300 = 700
      // Refund exactly 700 should succeed
      await service.updateBookingDeposit('test-booking-1', -700);

      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 0);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error when refund amount is less than 1 baht', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      await expect(
        service.updateBookingDeposit('test-booking-1', -0.5)
      ).rejects.toThrow('Refund amount must be at least 1 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('Validation: payment cannot exceed calculated room price', () => {
    it('should throw error when payment exceeds calculated room price', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1500, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      // Total paid: 1500, room price: 2000
      // Maximum additional payment: 500
      // Attempting to add 600 should fail
      await expect(
        service.updateBookingDeposit('test-booking-1', 600)
      ).rejects.toThrow('Payment amount would exceed calculated room price. Maximum additional payment: 500 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should allow payment equal to remaining balance', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1500, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 2000
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      // Remaining balance: 2000 - 1500 = 500
      // Payment of exactly 500 should succeed
      await service.updateBookingDeposit('test-booking-1', 500);

      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 2000);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw error when payment amount is less than 1 baht', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      await expect(
        service.updateBookingDeposit('test-booking-1', 0.5)
      ).rejects.toThrow('Payment amount must be at least 1 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('Edge case: empty payment history returns 0', () => {
    it('should correctly handle empty payment history', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1000
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 1000);

      // Verify totalPaid starts at 0, then + 1000 = 1000
      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 1000);
    });

    it('should allow first payment up to room price when history is empty', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 2000
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 2000);

      expect(bookingRepository.updateBookingDeposit).toHaveBeenCalledWith('test-booking-1', 2000);
      expect(paymentHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentType: PaymentType.FULL
        }),
        mockClient
      );
    });
  });

  describe('Edge case: attempting refund when no deposit remains', () => {
    it('should throw error when attempting refund with no remaining deposit', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(1000, PaymentType.REFUND, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      // Remaining deposit: 1000 - 1000 = 0
      await expect(
        service.updateBookingDeposit('test-booking-1', -100)
      ).rejects.toThrow('Refund amount cannot exceed remaining deposit of 0 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error when attempting refund with no deposit at all', async () => {
      // **Validates: Requirements 2.1**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(500, PaymentType.PARTIAL, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      // No DEPOSIT payment type, so remaining deposit = 0
      await expect(
        service.updateBookingDeposit('test-booking-1', -100)
      ).rejects.toThrow('Refund amount cannot exceed remaining deposit of 0 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('Edge case: attempting payment that would exceed room price', () => {
    it('should throw error when payment would exceed room price', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1800, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      // Total paid: 1800, room price: 2000
      // Maximum additional: 200
      await expect(
        service.updateBookingDeposit('test-booking-1', 300)
      ).rejects.toThrow('Payment amount would exceed calculated room price. Maximum additional payment: 200 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error when payment would exceed room price after refunds', async () => {
      // **Validates: Requirements 2.1, 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(2000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS),
        createMockPaymentHistory(500, PaymentType.REFUND, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);

      // Total paid: 2000 - 500 = 1500, room price: 2000
      // Maximum additional: 500
      await expect(
        service.updateBookingDeposit('test-booking-1', 600)
      ).rejects.toThrow('Payment amount would exceed calculated room price. Maximum additional payment: 500 baht');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('Payment type determination', () => {
    it('should set payment type to FULL when total equals room price', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1500, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 2000
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 500);

      expect(paymentHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentType: PaymentType.FULL,
          remark: 'ชำระครบแล้ว'
        }),
        mockClient
      );
    });

    it('should set payment type to PARTIAL when total is less than room price', async () => {
      // **Validates: Requirements 2.3**
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [
        createMockPaymentHistory(1000, PaymentType.DEPOSIT, PaymentStatus.SUCCESS)
      ];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1300
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 300);

      expect(paymentHistoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentType: PaymentType.PARTIAL,
          remark: 'รับเงินเพิ่ม'
        }),
        mockClient
      );
    });
  });

  describe('Transaction handling', () => {
    it('should commit transaction on success', async () => {
      const mockBooking = createMockBooking(2000);
      const mockPaymentHistory: PaymentHistory[] = [];

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockResolvedValue(mockPaymentHistory);
      (bookingRepository.updateBookingDeposit as jest.Mock).mockResolvedValue({
        ...mockBooking,
        deposit: 1000
      });
      (paymentHistoryRepository.create as jest.Mock).mockResolvedValue({});

      await service.updateBookingDeposit('test-booking-1', 1000);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const mockBooking = createMockBooking(2000);

      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (paymentHistoryRepository.findByBookingId as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        service.updateBookingDeposit('test-booking-1', 1000)
      ).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error when booking not found', async () => {
      (bookingRepository.getBookingById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateBookingDeposit('non-existent-booking', 1000)
      ).rejects.toThrow('Booking not found');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
