import { Router } from 'express';
import bookingsController from '../controllers/bookings.controller';

const router = Router();

// GET /api/bookings/today/checkin - Get today's check-ins (must be before /:id)
router.get('/today/checkin', (req, res) => bookingsController.getTodayCheckIns(req, res));

// GET /api/bookings/today/checkout - Get today's check-outs (must be before /:id)
router.get('/today/checkout', (req, res) => bookingsController.getTodayCheckOuts(req, res));

// GET /api/bookings - Get all bookings with optional filters
router.get('/', (req, res) => bookingsController.getBookings(req, res));

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', (req, res) => bookingsController.getBookingById(req, res));

// GET /api/bookings/:id/payments - Get payment history for a booking
router.get('/:id/payments', (req, res) => bookingsController.getPaymentHistory(req, res));

// POST /api/bookings - Create new booking
router.post('/', (req, res) => bookingsController.createBooking(req, res));

// PUT /api/bookings/:id - Update booking status
router.put('/:id', (req, res) => bookingsController.updateBooking(req, res));

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', (req, res) => bookingsController.cancelBooking(req, res));

export default router;
