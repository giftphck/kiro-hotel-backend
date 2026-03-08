import { Request, Response } from 'express';
import bookingService from '../services/booking.service';
import { BookingStatus } from '../models/booking.model';

export class BookingsController {
  /**
   * GET /api/bookings
   * Get all bookings with optional filters
   */
  async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const { roomId, customerId, bookingStatus, startDate, endDate } = req.query;

      const filters: any = {};
      if (roomId) filters.roomId = roomId as string;
      if (customerId) filters.customerId = customerId as string;
      if (bookingStatus) filters.bookingStatus = bookingStatus as BookingStatus;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const bookings = await bookingService.getBookings(filters);
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/bookings/:id
   * Get booking by ID
   */
  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      res.json(booking);
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        res.status(404).json({ error: 'Booking not found' });
      } else {
        console.error('Error fetching booking:', error);
        res.status(500).json({
          error: 'Failed to fetch booking',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * POST /api/bookings
   * Create a new booking
   */
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingDto = req.body;

      // Validate required fields
      if (!bookingDto.roomId || !bookingDto.customer || !bookingDto.checkInDate || 
          !bookingDto.checkOutDate || !bookingDto.numberOfGuests) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'roomId, customer, checkInDate, checkOutDate, and numberOfGuests are required'
        });
        return;
      }

      const booking = await bookingService.createBooking(bookingDto);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Double booking')) {
          res.status(409).json({
            error: 'Double booking',
            message: error.message
          });
        } else if (error.message.includes('validation') || error.message.includes('Invalid')) {
          res.status(400).json({
            error: 'Validation error',
            message: error.message
          });
        } else {
          console.error('Error creating booking:', error);
          res.status(500).json({
            error: 'Failed to create booking',
            message: error.message
          });
        }
      } else {
        res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }

  /**
   * PUT /api/bookings/:id
   * Update booking (status or deposit)
   */
  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { bookingStatus, deposit } = req.body;

      // At least one field must be provided
      if (!bookingStatus && deposit === undefined) {
        res.status(400).json({
          error: 'Missing required field',
          message: 'At least one of bookingStatus or deposit is required'
        });
        return;
      }

      // Update booking status if provided
      if (bookingStatus) {
        const booking = await bookingService.updateBookingStatus(id, bookingStatus);
        res.json(booking);
        return;
      }

      // Update deposit if provided
      if (deposit !== undefined) {
        const booking = await bookingService.updateBookingDeposit(id, deposit);
        res.json(booking);
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        res.status(404).json({ error: 'Booking not found' });
      } else {
        console.error('Error updating booking:', error);
        res.status(500).json({
          error: 'Failed to update booking',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * DELETE /api/bookings/:id
   * Cancel booking (set status to CANCELLED)
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.cancelBooking(id);
      res.json(booking);
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        res.status(404).json({ error: 'Booking not found' });
      } else {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
          error: 'Failed to cancel booking',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * GET /api/bookings/today/checkin
   * Get today's check-ins
   */
  async getTodayCheckIns(_req: Request, res: Response): Promise<void> {
    try {
      const bookings = await bookingService.getTodayCheckIns();
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching today check-ins:', error);
      res.status(500).json({
        error: 'Failed to fetch today check-ins',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/bookings/today/checkout
   * Get today's check-outs
   */
  async getTodayCheckOuts(_req: Request, res: Response): Promise<void> {
    try {
      const bookings = await bookingService.getTodayCheckOuts();
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching today check-outs:', error);
      res.status(500).json({
        error: 'Failed to fetch today check-outs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  /**
   * GET /api/bookings/:id/payments
   * Get payment history for a booking
   */
  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payments = await bookingService.getPaymentHistory(id);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({
        error: 'Failed to fetch payment history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new BookingsController();
