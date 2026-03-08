import app from './app';
import { connectWithRetry } from './config/database.config';

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Try to connect to database (but don't fail if it's not available)
    try {
      await connectWithRetry(3, 2000); // Only 3 retries with 2s delay
    } catch (dbError) {
      console.warn('⚠️  Database connection failed - server will start anyway');
      console.warn('⚠️  Health endpoint will show database as disconnected');
      console.warn('⚠️  Please configure DATABASE_URL in .env file');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Root endpoint: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
