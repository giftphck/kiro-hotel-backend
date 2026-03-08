import { PoolClient } from 'pg';
import { CreateBookingDto } from '../models/booking.model';
import bookingRepository from '../repositories/booking.repository';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Booking validation service
 * Implements business logic for validating booking data
 */
export class ValidationService {
  /**
   * Validate all booking fields
   * Checks that all required fields are present and valid
   * 
   * @param booking - The booking data to validate
   * @returns ValidationResult with success status and error details
   */
  validateBooking(booking: CreateBookingDto): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!booking.roomId || booking.roomId.trim() === '') {
      errors.push('Room ID is required');
    }

    if (!booking.customer || !booking.customer.name || booking.customer.name.trim() === '') {
      errors.push('Customer name is required');
    }

    // Phone number and Thai ID card are optional, but if provided must be valid
    if (booking.customer && booking.customer.phoneNumber && booking.customer.phoneNumber.trim() !== '') {
      // Validate phone number format if provided
      if (!/^[0-9]{9,10}$/.test(booking.customer.phoneNumber)) {
        errors.push('Phone number must be 9-10 digits');
      }
    }

    if (booking.customer && booking.customer.thaiIdCard && booking.customer.thaiIdCard.trim() !== '') {
      // Validate Thai ID format if provided
      if (!/^[0-9]{13}$/.test(booking.customer.thaiIdCard)) {
        errors.push('Thai ID card must be 13 digits');
      }
    }

    if (!booking.bookingType) {
      errors.push('Booking type is required');
    }

    if (!booking.checkInDate) {
      errors.push('Check-in date is required');
    }

    if (!booking.checkOutDate) {
      errors.push('Check-out date is required');
    }

    if (booking.numberOfGuests === undefined || booking.numberOfGuests === null) {
      errors.push('Number of guests is required');
    } else if (booking.numberOfGuests <= 0) {
      errors.push('Number of guests must be greater than 0');
    }

    if (booking.deposit === undefined || booking.deposit === null) {
      errors.push('Deposit is required');
    } else if (booking.deposit < 0) {
      errors.push('Deposit must be greater than or equal to 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that check-out date is after check-in date
   * 
   * @param checkIn - Check-in date
   * @param checkOut - Check-out date
   * @returns ValidationResult
   */
  validateDates(checkIn: Date, checkOut: Date): ValidationResult {
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
    
    if (checkOutTime <= checkInTime) {
      return {
        isValid: false,
        errors: ['Check-out date must be after check-in date']
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Check for double booking
   * Uses the booking repository to find overlapping ACTIVE bookings
   * 
   * Overlap formula (from requirements 12.3):
   * Two bookings overlap when:
   * (existing.check_in_date < new.check_out_date) AND (existing.check_out_date > new.check_in_date)
   * AND booking_status = 'ACTIVE'
   * 
   * @param roomId - The room to check
   * @param checkIn - New booking check-in date
   * @param checkOut - New booking check-out date
   * @param client - Optional database client for transaction support
   * @returns Promise<ValidationResult>
   */
  async checkDoubleBooking(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    client?: PoolClient
  ): Promise<ValidationResult> {
    const overlappingBookings = await bookingRepository.findOverlappingBookings(
      roomId,
      checkIn,
      checkOut,
      client
    );

    if (overlappingBookings.length > 0) {
      return {
        isValid: false,
        errors: [`Room is already booked for the selected dates`]
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }
}

export default new ValidationService();
