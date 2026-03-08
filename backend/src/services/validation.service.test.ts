import validationService, { ValidationService } from './validation.service';
import { CreateBookingDto, BookingType } from '../models/booking.model';
import bookingRepository from '../repositories/booking.repository';

// Mock the booking repository
jest.mock('../repositories/booking.repository');

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = validationService;
    jest.clearAllMocks();
  });

  describe('validateBooking', () => {
    it('should return success for valid booking data', () => {
      const validBooking: CreateBookingDto = {
        roomId: 'room-123',
        customer: {
          name: 'John Doe',
          phoneNumber: '0812345678',
          thaiIdCard: '1234567890123'
        },
        bookingType: BookingType.DAILY,
        checkInDate: new Date('2024-01-01'),
        checkOutDate: new Date('2024-01-05'),
        numberOfGuests: 2,
        priceType: 'DAILY',
        unitPrice: 500,
        totalPrice: 2000,
        deposit: 1000,
        remark: 'Test booking'
      };

      const result = service.validateBooking(validBooking);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const invalidBooking: CreateBookingDto = {
        roomId: '',
        customer: {
          name: '',
          phoneNumber: '',
          thaiIdCard: ''
        },
        bookingType: BookingType.DAILY,
        checkInDate: new Date('2024-01-01'),
        checkOutDate: new Date('2024-01-05'),
        numberOfGuests: 2,
        priceType: 'DAILY',
        unitPrice: 500,
        totalPrice: 2000,
        deposit: 1000
      };

      const result = service.validateBooking(invalidBooking);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Room ID is required');
      expect(result.errors).toContain('Customer name is required');
    });

    it('should return error for invalid number of guests', () => {
      const invalidBooking: CreateBookingDto = {
        roomId: 'room-123',
        customer: {
          name: 'John Doe',
          phoneNumber: '0812345678',
          thaiIdCard: '1234567890123'
        },
        bookingType: BookingType.DAILY,
        checkInDate: new Date('2024-01-01'),
        checkOutDate: new Date('2024-01-05'),
        numberOfGuests: 0,
        priceType: 'DAILY',
        unitPrice: 500,
        totalPrice: 2000,
        deposit: 1000
      };

      const result = service.validateBooking(invalidBooking);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Number of guests must be greater than 0');
    });

    it('should return error for negative deposit', () => {
      const invalidBooking: CreateBookingDto = {
        roomId: 'room-123',
        customer: {
          name: 'John Doe',
          phoneNumber: '0812345678',
          thaiIdCard: '1234567890123'
        },
        bookingType: BookingType.DAILY,
        checkInDate: new Date('2024-01-01'),
        checkOutDate: new Date('2024-01-05'),
        numberOfGuests: 2,
        priceType: 'DAILY',
        unitPrice: 500,
        totalPrice: 2000,
        deposit: -100
      };

      const result = service.validateBooking(invalidBooking);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Deposit must be greater than or equal to 0');
    });

  });

  describe('validateDates', () => {
    it('should return isValid true when check-out is after check-in', () => {
      const checkIn = new Date('2024-01-01');
      const checkOut = new Date('2024-01-05');

      const result = service.validateDates(checkIn, checkOut);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return isValid false when check-out is before check-in', () => {
      const checkIn = new Date('2024-01-05');
      const checkOut = new Date('2024-01-01');

      const result = service.validateDates(checkIn, checkOut);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Check-out date must be after check-in date');
    });

    it('should return isValid false when check-out equals check-in', () => {
      const checkIn = new Date('2024-01-01');
      const checkOut = new Date('2024-01-01');

      const result = service.validateDates(checkIn, checkOut);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Check-out date must be after check-in date');
    });
  });

  describe('checkDoubleBooking', () => {
    it('should return isValid false when overlapping bookings exist', async () => {
      const mockOverlappingBookings = [
        {
          bookingId: 'booking-1',
          roomId: 'room-123',
          customerId: 'customer-1',
          bookingType: BookingType.DAILY,
          checkInDate: new Date('2024-01-03'),
          checkOutDate: new Date('2024-01-07'),
          numberOfGuests: 2,
          deposit: 1000,
          bookingStatus: 'ACTIVE' as any,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (bookingRepository.findOverlappingBookings as jest.Mock).mockResolvedValue(
        mockOverlappingBookings
      );

      const result = await service.checkDoubleBooking(
        'room-123',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Room is already booked for the selected dates');
      expect(bookingRepository.findOverlappingBookings).toHaveBeenCalledWith(
        'room-123',
        new Date('2024-01-01'),
        new Date('2024-01-05'),
        undefined
      );
    });

    it('should return isValid true when no overlapping bookings exist', async () => {
      (bookingRepository.findOverlappingBookings as jest.Mock).mockResolvedValue([]);

      const result = await service.checkDoubleBooking(
        'room-123',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(bookingRepository.findOverlappingBookings).toHaveBeenCalledWith(
        'room-123',
        new Date('2024-01-01'),
        new Date('2024-01-05'),
        undefined
      );
    });
  });
});
