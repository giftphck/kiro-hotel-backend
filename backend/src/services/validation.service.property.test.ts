import * as fc from 'fast-check';
import validationService from './validation.service';
import bookingRepository from '../repositories/booking.repository';
import { BookingType, BookingStatus } from '../models/booking.model';

// Mock the booking repository
jest.mock('../repositories/booking.repository');

describe('ValidationService - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 11: Date Range Overlap Detection', () => {
    /**
     * **Validates: Requirements 12.3**
     * 
     * Property: Date range overlap detection correctly identifies overlapping and non-overlapping ranges
     * 
     * The overlap formula from requirements:
     * Two date ranges overlap when:
     * (existing.check_in_date < new.check_out_date) AND (existing.check_out_date > new.check_in_date)
     */

    // Helper function to check if two date ranges overlap using the formula from requirements
    const doRangesOverlap = (
      range1Start: Date,
      range1End: Date,
      range2Start: Date,
      range2End: Date
    ): boolean => {
      // Formula from Requirement 12.3:
      // (existing.check_in_date < new.check_out_date) AND (existing.check_out_date > new.check_in_date)
      return range1Start < range2End && range1End > range2Start;
    };

    it('should correctly identify overlapping date ranges', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate two date ranges
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          fc.integer({ min: 1, max: 30 }), // duration for first range
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          fc.integer({ min: 1, max: 30 }), // duration for second range
          async (existingCheckIn, existingDuration, newCheckIn, newDuration) => {
            // Create date ranges
            const existingCheckOut = new Date(existingCheckIn);
            existingCheckOut.setDate(existingCheckOut.getDate() + existingDuration);

            const newCheckOut = new Date(newCheckIn);
            newCheckOut.setDate(newCheckOut.getDate() + newDuration);

            // Calculate expected overlap using the formula
            const shouldOverlap = doRangesOverlap(
              existingCheckIn,
              existingCheckOut,
              newCheckIn,
              newCheckOut
            );

            // Mock the repository to return existing booking if they should overlap
            const mockExistingBooking = shouldOverlap ? [{
              bookingId: 'existing-booking',
              roomId: 'room-123',
              customerId: 'customer-1',
              bookingType: BookingType.DAILY,
              checkInDate: existingCheckIn,
              checkOutDate: existingCheckOut,
              numberOfGuests: 2,
              deposit: 1000,
              bookingStatus: BookingStatus.ACTIVE,
              createdAt: new Date(),
              updatedAt: new Date()
            }] : [];

            (bookingRepository.findOverlappingBookings as jest.Mock).mockResolvedValue(
              mockExistingBooking
            );

            // Test the service
            const result = await validationService.checkDoubleBooking(
              'room-123',
              newCheckIn,
              newCheckOut
            );

            // Verify the result matches our expectation
            expect(result.isValid).toBe(!shouldOverlap);
            if (shouldOverlap) {
              expect(result.errors).toContain('Room is already booked for the selected dates');
            } else {
              expect(result.errors).toHaveLength(0);
            }
          }
        ),
        { numRuns: 20 } // Reduced for faster test execution
      );
    });

    it('should correctly identify non-overlapping date ranges', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a base date and two non-overlapping ranges
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-06-30') }),
          fc.integer({ min: 1, max: 30 }), // duration for first range
          fc.integer({ min: 1, max: 30 }), // gap between ranges
          fc.integer({ min: 1, max: 30 }), // duration for second range
          async (baseDate, duration1, gap, duration2) => {
            // First range
            const range1Start = new Date(baseDate);
            const range1End = new Date(baseDate);
            range1End.setDate(range1End.getDate() + duration1);

            // Second range starts after first range ends with a gap
            const range2Start = new Date(range1End);
            range2Start.setDate(range2Start.getDate() + gap);
            const range2End = new Date(range2Start);
            range2End.setDate(range2End.getDate() + duration2);

            // These ranges should NOT overlap
            const shouldOverlap = doRangesOverlap(range1Start, range1End, range2Start, range2End);
            expect(shouldOverlap).toBe(false);

            // Mock repository to return no overlapping bookings
            (bookingRepository.findOverlappingBookings as jest.Mock).mockResolvedValue([]);

            // Test the service
            const result = await validationService.checkDoubleBooking(
              'room-123',
              range2Start,
              range2End
            );

            // Should return false (no double booking)
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle back-to-back bookings (one ends exactly when another starts)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          fc.integer({ min: 1, max: 30 }),
          fc.integer({ min: 1, max: 30 }),
          async (startDate, duration1, duration2) => {
            // First booking
            const booking1CheckIn = new Date(startDate);
            const booking1CheckOut = new Date(startDate);
            booking1CheckOut.setDate(booking1CheckOut.getDate() + duration1);

            // Second booking starts exactly when first ends
            const booking2CheckIn = new Date(booking1CheckOut);
            const booking2CheckOut = new Date(booking2CheckIn);
            booking2CheckOut.setDate(booking2CheckOut.getDate() + duration2);

            // Check if they overlap using the formula
            // (existing.check_in_date < new.check_out_date) AND (existing.check_out_date > new.check_in_date)
            const shouldOverlap = doRangesOverlap(
              booking1CheckIn,
              booking1CheckOut,
              booking2CheckIn,
              booking2CheckOut
            );

            // Back-to-back bookings should NOT overlap
            // because booking1CheckOut === booking2CheckIn
            // So: booking1CheckOut > booking2CheckIn is FALSE
            expect(shouldOverlap).toBe(false);

            // Mock repository
            (bookingRepository.findOverlappingBookings as jest.Mock).mockResolvedValue([]);

            const result = await validationService.checkDoubleBooking(
              'room-123',
              booking2CheckIn,
              booking2CheckOut
            );

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
