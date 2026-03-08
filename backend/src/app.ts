import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/logger';
import healthRoutes from './routes/health.routes';
import roomsRoutes from './routes/rooms.routes';
import customersRoutes from './routes/customers.routes';
import bookingsRoutes from './routes/bookings.routes';
import reportsRoutes from './routes/reports.routes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Trust proxy (required for Render deployment)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Disable caching for development
app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reports', reportsRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Hotel Front Desk Management System API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
