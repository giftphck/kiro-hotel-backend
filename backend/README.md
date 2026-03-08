# Hotel Front Desk Management System - Backend

Backend API for the Hotel Front Desk Management System built with Node.js, Express, TypeScript, and PostgreSQL.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: pg (node-postgres)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # TypeScript interfaces and types
│   ├── repositories/    # Database access layer
│   ├── routes/          # API route definitions
│   ├── schedulers/      # Automated tasks
│   ├── services/        # Business logic
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── dist/                # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase account)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
SCHEDULER_API_KEY=your-secure-api-key-here
```

### Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Production

Run the compiled application:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## API Endpoints

### Health Check
- `GET /api/health` - Check backend and database status

### Rooms (Coming in Task 5)
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `PUT /api/rooms/:id/status` - Update room status

### Bookings (Coming in Task 7)
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/today/checkin` - Get today's check-ins
- `GET /api/bookings/today/checkout` - Get today's check-outs

### Reports (Coming in Task 8)
- `GET /api/reports/revenue/daily` - Get daily revenue report
- `GET /api/reports/revenue/monthly` - Get monthly revenue report
- `GET /api/reports/revenue/yearly` - Get yearly revenue report

### Scheduler (Coming in Task 9)
- `POST /api/scheduler/trigger-checkout` - Trigger automated checkout (API key protected)

## Database Schema

The database schema is defined in `../database/migrations/`. Key tables:

- `rooms` - Room inventory
- `customers` - Customer information
- `bookings` - Booking records
- `guests` - Guest information
- `room_prices` - Dynamic pricing
- `room_status_history` - Status change tracking

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message in Thai",
    "details": {},
    "timestamp": "2026-04-08T12:00:00.000Z"
  }
}
```

## Deployment

### Render (Free Tier)

1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

See deployment documentation for detailed instructions.

## Architecture

The backend follows a layered architecture pattern:

1. **Routes Layer**: API endpoint definitions
2. **Controllers Layer**: Request/response handling
3. **Services Layer**: Business logic
4. **Repositories Layer**: Database access
5. **Models Layer**: Data types and interfaces

## License

ISC
