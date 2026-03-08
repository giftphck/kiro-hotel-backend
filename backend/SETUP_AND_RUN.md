# Backend Setup and Run Guide

This guide will help you set up and run the backend server locally.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js (v18 or higher) installed
- ✅ npm installed
- ✅ Supabase database created and migrations run (from Task 1)

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages:
- express, pg, cors, dotenv (runtime)
- typescript, ts-node, nodemon (development)
- jest, supertest (testing)

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your database credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:4200

# Scheduler API Key
SCHEDULER_API_KEY=your-secure-api-key-here
```

**Important**: Replace `[YOUR-PASSWORD]` and `[PROJECT-REF]` with your actual Supabase credentials from Task 1.

## Step 3: Verify Database Connection

Before starting the server, make sure your database is set up:

1. Check that you've run all 3 migration files in Supabase SQL Editor:
   - `database/migrations/001_create_schema.sql`
   - `database/migrations/002_create_indexes.sql`
   - `database/migrations/003_create_foreign_keys.sql`

2. Verify tables exist by running this in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see 6 tables: bookings, customers, guests, room_prices, room_status_history, rooms

## Step 4: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
Database connection established successfully
Server is running on port 3000
Environment: development
Health check: http://localhost:3000/api/health
```

## Step 5: Verify Server is Running

### Test 1: Root Endpoint
Open your browser or use curl:
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "message": "Hotel Front Desk Management System API",
  "version": "1.0.0",
  "status": "running"
}
```

### Test 2: Health Check Endpoint
```bash
curl http://localhost:3000/api/health
```

Expected response (if database is connected):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "uptime": 5.123,
  "database": "connected",
  "environment": "development"
}
```

If database is NOT connected, you'll see:
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  ...
}
```

## Troubleshooting

### Error: "Cannot find module 'express'"
**Solution**: Run `npm install` in the backend directory

### Error: "Database connection failed"
**Solution**: 
1. Check your DATABASE_URL in .env is correct
2. Verify your Supabase project is running
3. Check that sslmode=require is in the connection string
4. Test connection in Supabase SQL Editor

### Error: "Port 3000 is already in use"
**Solution**: 
1. Change PORT in .env to another port (e.g., 3001)
2. Or stop the process using port 3000

### Error: "relation does not exist"
**Solution**: Run the database migrations in Supabase SQL Editor (see Step 3)

## Next Steps

Once the server is running successfully:
1. ✅ Verify health endpoint returns "healthy" status
2. ✅ Verify database connection is "connected"
3. ✅ Check server logs for any errors

You're now ready to proceed with Feature 2 (Basic CRUD implementation)!

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm test` - Run tests

## Server Endpoints (Current)

- `GET /` - Root endpoint (API info)
- `GET /api/health` - Health check endpoint

More endpoints will be added in subsequent tasks.
