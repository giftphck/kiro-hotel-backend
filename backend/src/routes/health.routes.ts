import { Router, Request, Response } from 'express';
import { testConnection } from '../config/database.config';
import { asyncHandler } from '../middleware/error-handler';

const router = Router();

router.get('/health', asyncHandler(async (_req: Request, res: Response) => {
  const dbConnected = await testConnection();
  
  const healthStatus = {
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  
  const statusCode = dbConnected ? 200 : 503;
  res.status(statusCode).json(healthStatus);
}));

export default router;
