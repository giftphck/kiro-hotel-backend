# Design Document: Hotel Front Desk Management System

## Overview

The Hotel Front Desk Management System is a comprehensive web-based application designed for hotel administrators to manage room inventory, bookings, check-ins/check-outs, pricing, and financial reporting. The system provides a visual room board interface with real-time status updates, automated check-out processing, and multi-language support (Thai/English).

### Key Features

- Visual room board with grid layout showing room status across multiple dates
- Booking management with double-booking prevention
- Automated check-out scheduler running daily at noon
- Dynamic room pricing by date and booking type (3-hour, daily, monthly)
- Revenue reporting (daily, monthly, yearly)
- Multi-language UI (primarily Thai with English support)
- Responsive design for desktop and mobile devices

### Technology Stack

- **Frontend**: Angular 15+ with Angular Material UI, TypeScript, RxJS
- **Backend**: Node.js with Express.js, TypeScript/JavaScript
- **Database**: PostgreSQL hosted on Supabase (Free tier)
- **Deployment**: Vercel (frontend - Free tier), Render (backend - Free tier), Supabase (database - Free tier)
- **Scheduler**: External cron service (e.g., cron-job.org - Free tier) calling protected API endpoint

## Architecture

### System Architecture

The system follows a three-tier architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (SPA)                        │
│                    Angular + Material UI                     │
│                   Deployed on Vercel (Free)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST API
                         │ JSON
┌────────────────────────▼────────────────────────────────────┐
│                      Backend (API)                           │
│                  Node.js + Express.js                        │
│                  Deployed on Render (Free)                   │
│              ┌──────────────────────────┐                    │
│              │  Scheduler Endpoint      │◄──────────┐        │
│              │  POST /api/scheduler/    │           │        │
│              │  trigger-checkout        │           │        │
│              │  (API Key Protected)     │           │        │
│              └──────────────────────────┘           │        │
└────────────────────────┬────────────────────────────┼────────┘
                         │ PostgreSQL Protocol        │
                         │ SSL/TLS                    │
┌────────────────────────▼────────────────────────────┼────────┐
│                   Database (PostgreSQL)             │        │
│                Hosted on Supabase (Free)            │        │
└─────────────────────────────────────────────────────┼────────┘
                                                      │
                                              HTTPS POST
                                              Daily 12:00 PM
                                                      │
┌─────────────────────────────────────────────────────┼────────┐
│              External Cron Service (Free)           │        │
│              (e.g., cron-job.org)                   │────────┘
│              Triggers checkout daily at noon                 │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

The Angular frontend is organized using feature modules:

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── api.service.ts
│   │   └── interceptors/
│   │       └── http-error.interceptor.ts
│   ├── shared/                  # Reusable components, directives, pipes
│   │   ├── components/
│   │   │   ├── date-picker/
│   │   │   ├── date-range-picker/
│   │   │   └── modal-dialog/
│   │   ├── material.module.ts
│   │   └── shared.module.ts
│   ├── features/
│   │   ├── room-board/          # Room board grid and today sections
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── room-board.module.ts
│   │   ├── bookings/            # Booking creation and management
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── bookings.module.ts
│   │   ├── room-prices/         # Room price management
│   │   ├── reports/             # Revenue reporting
│   │   └── settings/            # System settings
│   ├── layout/                  # Layout components
│   │   ├── sidebar/
│   │   ├── top-bar/
│   │   └── layout.module.ts
│   └── models/                  # TypeScript interfaces and types
│       ├── room.model.ts
│       ├── booking.model.ts
│       └── customer.model.ts
```

### Backend Architecture

The backend follows a layered architecture pattern:

```
src/
├── routes/                      # API endpoint definitions
│   ├── rooms.routes.ts
│   ├── bookings.routes.ts
│   ├── customers.routes.ts
│   ├── room-prices.routes.ts
│   └── reports.routes.ts
├── controllers/                 # Request handlers
│   ├── rooms.controller.ts
│   ├── bookings.controller.ts
│   └── reports.controller.ts
├── services/                    # Business logic
│   ├── booking.service.ts
│   ├── room.service.ts
│   ├── validation.service.ts
│   └── scheduler.service.ts
├── repositories/                # Database access layer
│   ├── room.repository.ts
│   ├── booking.repository.ts
│   └── customer.repository.ts
├── models/                      # Data models and types
│   ├── room.model.ts
│   └── booking.model.ts
├── middleware/                  # Express middleware
│   ├── error-handler.ts
│   └── logger.ts
├── config/                      # Configuration
│   ├── database.config.ts
│   └── scheduler.config.ts
├── schedulers/                  # Cron jobs
│   └── checkout.scheduler.ts
└── app.ts                       # Express app setup
```

## Components and Interfaces

### Frontend Components

#### 1. Layout Components

**SidebarComponent**
- Displays navigation menu with icons
- Shows admin profile at bottom
- Highlights active menu item
- Provides logout functionality
- Styling: Light blue gradient background, soft shadows, rounded corners

**TopBarComponent**
- Displays quick action buttons (จองห้องพัก, รายงาน)
- Shows notification icon with badge
- Displays user profile dropdown
- Settings icon access

#### 2. Room Board Components

**RoomBoardGridComponent**
- Renders grid layout with rooms as rows, dates as columns
- Displays room cells with appropriate status colors
- Handles cell click events to open modals
- Supports date range selection
- Implements horizontal scrolling for many dates

**RoomCellComponent**
- Displays room status with color coding:
  - Green (#81C784): Available (ว่าง)
  - Red-orange (#E57373): Occupied (เข้าพัก)
  - Yellow-orange (#FFB74D): Reserved (จองแล้ว)
  - Yellow (#FFD54F): Cleaning
- Shows guest name for occupied/reserved rooms
- Displays icons for booking type
- Rounded corners and consistent padding

**CheckOutTodayComponent**
- Lists rooms with check-out scheduled for current date
- Displays room number, guest name, check-out time (12:00)
- Updates automatically when bookings change
- Shows empty state when no check-outs

**CheckInTodayComponent**
- Lists rooms with check-in scheduled for current date
- Displays room number, guest name, check-in time (14:00)
- Updates automatically when bookings change
- Shows empty state when no check-ins

**DetailedRoomViewTableComponent**
- Displays extended room grid below main board
- Synchronized date range with main grid
- Same styling and color scheme as main grid

#### 3. Booking Components

**AddBookingModalComponent**
- Form for creating new bookings
- Fields: customer name, phone, Thai ID, booking type, check-in/out dates, guests, deposit, remark
- Date pickers with validation (check-out after check-in)
- Pre-fills check-in date from clicked cell
- Validates against double bookings
- Closes on backdrop click or Escape key

**BookingDetailsModalComponent**
- Displays complete booking information
- Shows: room number, guest name, phone, ID, check-out date, days remaining, remark
- Calculates days remaining dynamically
- Close button and backdrop click to dismiss

#### 4. Shared Components

**DatePickerComponent**
- Angular Material Datepicker wrapper
- Calendar popup with month/year navigation
- Highlights selected date
- Formats dates in readable format
- Rounded corners and soft shadows

**DateRangePickerComponent**
- Extends DatePickerComponent for range selection
- Start and end date fields
- Validates end date after start date
- Thai date format support
- Range highlighting in calendar

#### 5. Room Price Components

**RoomPriceManagementComponent**
- Grid/table for managing room prices
- CRUD operations for price records
- Three price types per record: 3-hour, daily, monthly
- Date-specific pricing
- Consistent design with other pages

#### 6. Reports Components

**RevenueReportComponent**
- Date range selector (daily, monthly, yearly)
- Charts displaying revenue trends
- Tables with detailed breakdowns
- Metrics: total revenue, rooms sold, booking count
- Export functionality (optional)

### Backend API Endpoints

#### Rooms API

```typescript
GET    /api/rooms                    // Get all rooms
GET    /api/rooms/:id                // Get room by ID
GET    /api/rooms/:id/status         // Get room status for date range
PUT    /api/rooms/:id/status         // Update room status
```

#### Bookings API

```typescript
GET    /api/bookings                 // Get all bookings (with filters)
GET    /api/bookings/:id             // Get booking by ID
POST   /api/bookings                 // Create new booking
PUT    /api/bookings/:id             // Update booking
DELETE /api/bookings/:id             // Cancel booking
GET    /api/bookings/today/checkin   // Get today's check-ins
GET    /api/bookings/today/checkout  // Get today's check-outs
POST   /api/bookings/validate        // Validate booking (check double booking)
```

#### Customers API

```typescript
GET    /api/customers                // Get all customers
GET    /api/customers/:id            // Get customer by ID
POST   /api/customers                // Create customer
PUT    /api/customers/:id            // Update customer
```

#### Guests API

```typescript
GET    /api/guests/booking/:bookingId  // Get guests for booking
POST   /api/guests                      // Add guest to booking
PUT    /api/guests/:id                  // Update guest
DELETE /api/guests/:id                  // Remove guest
```

#### Room Prices API

```typescript
GET    /api/room-prices              // Get all room prices (with filters)
GET    /api/room-prices/room/:roomId/date/:date  // Get price for room on date
POST   /api/room-prices              // Create room price
PUT    /api/room-prices/:id          // Update room price
DELETE /api/room-prices/:id          // Delete room price
```

#### Reports API

```typescript
GET    /api/reports/revenue/daily?date=YYYY-MM-DD
GET    /api/reports/revenue/monthly?year=YYYY&month=MM
GET    /api/reports/revenue/yearly?year=YYYY
```

#### Scheduler API

```typescript
POST   /api/scheduler/trigger-checkout  // Trigger automated checkout (API key protected)
GET    /api/health                       // Backend health status
```

### Service Interfaces

#### Frontend Services

**RoomService**
```typescript
interface RoomService {
  getRooms(): Observable<Room[]>;
  getRoomStatus(roomId: string, startDate: Date, endDate: Date): Observable<RoomStatus[]>;
  updateRoomStatus(roomId: string, status: RoomStatus): Observable<void>;
}
```

**BookingService**
```typescript
interface BookingService {
  getBookings(filters?: BookingFilters): Observable<Booking[]>;
  getBookingById(id: string): Observable<Booking>;
  createBooking(booking: CreateBookingDto): Observable<Booking>;
  updateBooking(id: string, booking: UpdateBookingDto): Observable<Booking>;
  cancelBooking(id: string): Observable<void>;
  getTodayCheckIns(): Observable<Booking[]>;
  getTodayCheckOuts(): Observable<Booking[]>;
  validateBooking(booking: CreateBookingDto): Observable<ValidationResult>;
}
```

**ReportService**
```typescript
interface ReportService {
  getDailyRevenue(date: Date): Observable<RevenueReport>;
  getMonthlyRevenue(year: number, month: number): Observable<RevenueReport>;
  getYearlyRevenue(year: number): Observable<RevenueReport>;
}
```

#### Backend Services

**BookingValidationService**
```typescript
interface BookingValidationService {
  validateBooking(booking: CreateBookingDto): Promise<ValidationResult>;
  checkDoubleBooking(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean>;
  validateDates(checkIn: Date, checkOut: Date): boolean;
}
```

**SchedulerService**
```typescript
interface SchedulerService {
  startScheduler(): void;
  stopScheduler(): void;
  executeCheckOut(): Promise<void>;
  manualTrigger(): Promise<void>;
}
```

## Data Models

### Database Schema

#### rooms table
```sql
CREATE TABLE rooms (
  room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_status VARCHAR(20) NOT NULL CHECK (room_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
  room_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_status ON rooms(room_status);
CREATE INDEX idx_rooms_number ON rooms(room_number);
```

#### customers table
```sql
CREATE TABLE customers (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  thai_id_card VARCHAR(13) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_id_card ON customers(thai_id_card);
```

#### bookings table
```sql
CREATE TABLE bookings (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
  booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('3_HOUR', 'DAILY', 'MONTHLY')),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  deposit DECIMAL(10, 2) NOT NULL CHECK (deposit >= 0),
  remark TEXT,
  booking_status VARCHAR(20) NOT NULL CHECK (booking_status IN ('ACTIVE', 'CHECKED_OUT', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
);

CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_checkout_date ON bookings(check_out_date) WHERE booking_status = 'ACTIVE';
```

#### guests table
```sql
CREATE TABLE guests (
  guest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  id_card_number VARCHAR(13) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guests_booking ON guests(booking_id);
```

#### room_prices table
```sql
CREATE TABLE room_prices (
  price_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  three_hour_price DECIMAL(10, 2) CHECK (three_hour_price >= 0),
  daily_price DECIMAL(10, 2) CHECK (daily_price >= 0),
  monthly_price DECIMAL(10, 2) CHECK (monthly_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, date)
);

CREATE INDEX idx_room_prices_room_date ON room_prices(room_id, date);
```

### TypeScript Models

#### Room Model
```typescript
export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING'
}

export interface Room {
  roomId: string;
  roomNumber: string;
  roomStatus: RoomStatus;
  roomType?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Booking Model
```typescript
export enum BookingType {
  THREE_HOUR = '3_HOUR',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY'
}

export enum BookingStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  bookingId: string;
  roomId: string;
  customerId: string;
  bookingType: BookingType;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  deposit: number;
  remark?: string;
  bookingStatus: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  room?: Room;
  customer?: Customer;
  guests?: Guest[];
}

export interface CreateBookingDto {
  roomId: string;
  customerName: string;
  phoneNumber: string;
  thaiIdCard: string;
  bookingType: BookingType;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  deposit: number;
  remark?: string;
  guests?: CreateGuestDto[];
}
```

#### Customer Model
```typescript
export interface Customer {
  customerId: string;
  name: string;
  phoneNumber: string;
  thaiIdCard: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Guest Model
```typescript
export interface Guest {
  guestId: string;
  bookingId: string;
  guestName: string;
  idCardNumber: string;
  createdAt: Date;
}

export interface CreateGuestDto {
  guestName: string;
  idCardNumber: string;
}
```

#### Room Price Model
```typescript
export interface RoomPrice {
  priceId: string;
  roomId: string;
  date: Date;
  threeHourPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Report Models
```typescript
export interface RevenueReport {
  period: string;  // e.g., "2026-04-08", "2026-04", "2026"
  totalRevenue: number;
  roomsSold: number;
  bookingCount: number;
  details?: RevenueDetail[];
}

export interface RevenueDetail {
  date: Date;
  revenue: number;
  bookings: number;
}
```

### Data Flow Diagrams

#### Booking Creation Flow
```
User clicks available cell
         ↓
AddBookingModal opens with pre-filled date
         ↓
User fills form and submits
         ↓
Frontend validates form
         ↓
BookingService.createBooking() called
         ↓
HTTP POST /api/bookings
         ↓
Backend validates data
         ↓
Check for double booking
         ↓
Create/find customer record
         ↓
Create booking record
         ↓
Update room status (RESERVED or OCCUPIED)
         ↓
Create guest records
         ↓
Return booking with populated data
         ↓
Frontend closes modal and refreshes grid
```

#### Automated Check-Out Flow
```
Cron scheduler triggers at 12:00 PM
         ↓
Query bookings: check_out_date = today AND status = ACTIVE
         ↓
For each booking:
  ├─ Update booking_status to CHECKED_OUT
  └─ Update room_status to CLEANING
         ↓
Log execution results
         ↓
Frontend polls or receives updates
         ↓
Room board grid refreshes
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following areas where properties can be consolidated:

- Room status display properties (5.1-5.4, 6.1-6.4) can be combined into comprehensive properties about status-to-display mapping
- Check-in/check-out today section queries (6.1.3, 6.2.3) follow the same pattern and can be generalized
- Booking creation and validation properties (10.1-10.7, 12.1-12.3) overlap and can be consolidated
- Revenue calculation properties (17.2-17.7) share common calculation logic that can be unified
- Guest management properties (11.1-11.4) can be combined into comprehensive guest association properties

### Property 1: Room Status Display Mapping

For any room cell with a given room status, the displayed color, text, and icons should correctly correspond to that status according to the defined mapping: AVAILABLE → green/"ว่าง", OCCUPIED → red-orange/"เข้าพัก"/guest name, RESERVED → yellow-orange/"จองแล้ว"/guest name, CLEANING → yellow/"Cleaning"/cleaning icon.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4**

### Property 2: Active Menu Highlighting

For any navigation state in the application, the sidebar menu item corresponding to the current route should be highlighted, and all other menu items should not be highlighted.

**Validates: Requirements 1.4**

### Property 3: Modal Opening on Cell Click

For any room cell click event, the system should open the Add Booking Modal if the room status is AVAILABLE, or open the Booking Details Modal if the room status is OCCUPIED or RESERVED, or open the room cleaning options if the status is CLEANING.

**Validates: Requirements 7.1, 8.1, 15.2**

### Property 4: Date Range Grid Update

For any valid date range selection (where end date ≥ start date), updating the date range picker should cause the room board grid to display exactly those dates as columns.

**Validates: Requirements 4.5, 9.1.5**

### Property 5: Check-In Date Pre-fill

For any available room cell with an associated date, clicking that cell to open the Add Booking Modal should pre-fill the check-in date field with that cell's date.

**Validates: Requirements 7.9**

### Property 6: Today's Check-Out Query

For any given current date, querying for today's check-outs should return exactly those bookings where check_out_date equals the current date AND booking_status equals ACTIVE, and no other bookings.

**Validates: Requirements 6.1.3, 14.2**

### Property 7: Today's Check-In Query

For any given current date, querying for today's check-ins should return exactly those bookings where check_in_date equals the current date AND booking_status equals ACTIVE, and no other bookings.

**Validates: Requirements 6.2.3**

### Property 8: Booking Creation with Valid Data

For any valid booking data (all required fields present, check-out date after check-in date, no overlapping bookings), submitting the booking should create a new booking record with status ACTIVE and close the modal.

**Validates: Requirements 10.1, 10.2, 10.4, 10.6**

### Property 9: Room Status Update on Booking Creation

For any newly created booking, the associated room's status should be updated to RESERVED if the check-in date is in the future, or OCCUPIED if the check-in date is today or in the past.

**Validates: Requirements 10.5**

### Property 10: Booking Creation Failure Handling

For any invalid booking data (missing required fields, invalid dates, or overlapping bookings), attempting to create the booking should fail, display an error message, and keep the modal open without creating a booking record.

**Validates: Requirements 10.7, 12.2**

### Property 11: Date Range Overlap Detection

For any two date ranges (existing booking and new booking attempt), the system should correctly identify them as overlapping if and only if the new check-in date is before the existing check-out date AND the new check-out date is after the existing check-in date.

**Validates: Requirements 12.3**

### Property 12: Double Booking Prevention

For any booking creation attempt on a room, if there exists any active booking on that room with an overlapping date range, the new booking should be rejected.

**Validates: Requirements 12.1, 12.2**

### Property 13: Guest Association

For any guest record, it should be associated with exactly one booking, and for any booking, all associated guests should be retrievable and displayable.

**Validates: Requirements 11.3, 11.4**

### Property 14: Multiple Guests Per Booking

For any booking, the system should allow adding multiple guest records, each with a required name and ID card number.

**Validates: Requirements 11.1, 11.2**

### Property 15: Automated Check-Out Status Update

For any booking where check_out_date equals the current date and booking_status equals ACTIVE, when the scheduler executes, the booking_status should be updated to CHECKED_OUT.

**Validates: Requirements 14.3**

### Property 16: Room Cleaning Status After Check-Out

For any booking that is updated to CHECKED_OUT status, the associated room's status should be updated to CLEANING.

**Validates: Requirements 14.4**

### Property 17: Cleaning to Available Transition

For any room with status CLEANING, an admin should be able to manually update the status to AVAILABLE, and this change should immediately reflect in the room board grid.

**Validates: Requirements 15.1, 15.3, 15.4**

### Property 18: Room Price Storage

For any room price record, it should store exactly three price types (3_HOUR, DAILY, MONTHLY) for a specific room on a specific date, with a unique constraint on the room-date combination.

**Validates: Requirements 16.3**

### Property 19: Room Price CRUD Operations

For any room price record, the system should support creating new records, updating existing records, and deleting records.

**Validates: Requirements 16.4**

### Property 20: Price Display on Booking Creation

For any room and date combination during booking creation, if a room price exists for that date, it should be displayed to the admin.

**Validates: Requirements 16.5**

### Property 21: Revenue Calculation

For any time period (day, month, or year), the total revenue should equal the sum of deposit amounts from all bookings with CHECKED_OUT status within that period.

**Validates: Requirements 17.2, 17.3, 17.4, 17.5**

### Property 22: Rooms Sold Calculation

For any time period (day, month, or year), the number of rooms sold should equal the count of unique room IDs from bookings with CHECKED_OUT status within that period.

**Validates: Requirements 17.2, 17.3, 17.4, 17.6**

### Property 23: Booking Count Calculation

For any time period (day, month, or year), the booking count should equal the total number of bookings with CHECKED_OUT status within that period.

**Validates: Requirements 17.2, 17.3, 17.4, 17.7**

### Property 24: Date Validation in Forms

For any booking form submission, the check-out date must be after the check-in date, otherwise the form should be invalid.

**Validates: Requirements 9.7**

### Property 25: Date Range Validation

For any date range picker, the end date must be after or equal to the start date, otherwise the selection should be invalid.

**Validates: Requirements 9.1.7**

### Property 26: Responsive Sidebar Collapse

For any screen width less than 768px, the sidebar should collapse into a hamburger menu, and for any screen width greater than or equal to 768px, the sidebar should be fully displayed.

**Validates: Requirements 19.2**

### Property 27: Responsive Grid Column Adjustment

For any screen width less than 768px, the room board grid should display fewer date columns than on larger screens to maintain usability.

**Validates: Requirements 19.3**

## Error Handling

### Frontend Error Handling

#### Network Errors
- All HTTP requests should be wrapped in error handlers
- Display user-friendly error messages in Thai
- Retry logic for transient failures (with exponential backoff)
- Offline detection and appropriate messaging

#### Validation Errors
- Client-side validation before API calls
- Display field-level validation errors inline
- Prevent form submission when validation fails
- Clear error messages in Thai language

#### Modal Error Handling
- Display errors within modals without closing them
- Allow users to correct errors and resubmit
- Provide clear error messages for:
  - Double booking attempts
  - Invalid date ranges
  - Missing required fields
  - Network failures

#### State Management Errors
- Handle race conditions in concurrent updates
- Implement optimistic UI updates with rollback on failure
- Maintain consistency between local state and server state

### Backend Error Handling

#### Request Validation
- Validate all incoming request data
- Return 400 Bad Request with detailed error messages
- Use middleware for consistent validation across endpoints

#### Database Errors
- Wrap all database operations in try-catch blocks
- Handle constraint violations gracefully:
  - Foreign key violations
  - Unique constraint violations
  - Check constraint violations
- Return appropriate HTTP status codes:
  - 409 Conflict for double booking
  - 404 Not Found for missing resources
  - 500 Internal Server Error for unexpected errors

#### Transaction Management
- Use database transactions for multi-table operations
- Implement rollback on any operation failure
- Ensure atomicity for booking creation (customer + booking + guests)

#### Scheduler Error Handling
- Log all scheduler execution attempts
- Continue running on individual booking update failures
- Send alerts for repeated failures
- Implement retry logic for transient database errors

#### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;           // e.g., "DOUBLE_BOOKING", "INVALID_DATE"
    message: string;        // User-friendly message in Thai
    details?: any;          // Additional error context
    timestamp: string;      // ISO 8601 timestamp
  }
}
```

### Error Scenarios and Handling

| Scenario | Frontend Handling | Backend Handling |
|----------|------------------|------------------|
| Double booking attempt | Display error in modal, keep modal open | Return 409 with error details |
| Invalid date range | Prevent form submission, show inline error | Return 400 with validation errors |
| Network timeout | Show retry option, cache form data | N/A |
| Database connection failure | Show generic error, suggest retry | Log error, return 503 |
| Scheduler failure | N/A | Log error, continue with next execution |
| Missing required field | Show inline validation error | Return 400 with field errors |
| Room not found | Show error message, close modal | Return 404 |
| Concurrent booking updates | Refresh data, show conflict message | Use optimistic locking or transactions |

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both approaches are complementary and necessary

### Unit Testing

Unit tests should focus on:

1. **Specific Examples**
   - Booking creation with valid data
   - Room status transitions (AVAILABLE → RESERVED → OCCUPIED → CLEANING → AVAILABLE)
   - Revenue calculation for known data sets
   - Date range overlap detection with specific dates

2. **Edge Cases**
   - Empty check-in/check-out lists
   - Single-day bookings (check-in and check-out on same day)
   - Bookings spanning month/year boundaries
   - Maximum number of guests
   - Zero deposit bookings

3. **Error Conditions**
   - Missing required fields
   - Invalid date ranges (check-out before check-in)
   - Double booking attempts
   - Invalid room status transitions
   - Database constraint violations

4. **Integration Points**
   - API endpoint responses
   - Database query results
   - Scheduler execution
   - Modal open/close behavior

### Property-Based Testing

Property tests should be configured with:
- **Minimum 100 iterations per test** (due to randomization)
- **Tagged with feature and property reference**: `Feature: hotel-front-desk-management, Property {number}: {property_text}`

#### Property Test Library Selection

- **Frontend (TypeScript/Angular)**: Use `fast-check` library
- **Backend (Node.js/TypeScript)**: Use `fast-check` library

#### Property Test Examples

**Property 11: Date Range Overlap Detection**
```typescript
// Feature: hotel-front-desk-management, Property 11: Date Range Overlap Detection
import * as fc from 'fast-check';

describe('Date Range Overlap Detection', () => {
  it('should correctly identify overlapping date ranges', () => {
    fc.assert(
      fc.property(
        fc.date(), // existing check-in
        fc.date(), // existing check-out
        fc.date(), // new check-in
        fc.date(), // new check-out
        (existingIn, existingOut, newIn, newOut) => {
          // Ensure valid ranges
          if (existingOut <= existingIn || newOut <= newIn) return true;
          
          const overlaps = isOverlapping(
            { checkIn: newIn, checkOut: newOut },
            { checkIn: existingIn, checkOut: existingOut }
          );
          
          const expectedOverlap = newIn < existingOut && newOut > existingIn;
          return overlaps === expectedOverlap;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 21: Revenue Calculation**
```typescript
// Feature: hotel-front-desk-management, Property 21: Revenue Calculation
import * as fc from 'fast-check';

describe('Revenue Calculation', () => {
  it('should sum deposits from all checked-out bookings in period', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          deposit: fc.float({ min: 0, max: 10000 }),
          status: fc.constantFrom('ACTIVE', 'CHECKED_OUT', 'CANCELLED'),
          checkOutDate: fc.date()
        })),
        fc.date(), // period start
        fc.date(), // period end
        (bookings, periodStart, periodEnd) => {
          if (periodEnd <= periodStart) return true;
          
          const expectedRevenue = bookings
            .filter(b => 
              b.status === 'CHECKED_OUT' &&
              b.checkOutDate >= periodStart &&
              b.checkOutDate <= periodEnd
            )
            .reduce((sum, b) => sum + b.deposit, 0);
          
          const actualRevenue = calculateRevenue(bookings, periodStart, periodEnd);
          return Math.abs(actualRevenue - expectedRevenue) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 12: Double Booking Prevention**
```typescript
// Feature: hotel-front-desk-management, Property 12: Double Booking Prevention
import * as fc from 'fast-check';

describe('Double Booking Prevention', () => {
  it('should reject bookings with overlapping date ranges on same room', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // room ID
        fc.date(), // existing check-in
        fc.date(), // existing check-out
        fc.date(), // new check-in
        fc.date(), // new check-out
        async (roomId, existingIn, existingOut, newIn, newOut) => {
          // Ensure valid ranges
          if (existingOut <= existingIn || newOut <= newIn) return true;
          
          // Create existing booking
          await createBooking({ roomId, checkIn: existingIn, checkOut: existingOut });
          
          // Attempt new booking
          const result = await attemptBooking({ roomId, checkIn: newIn, checkOut: newOut });
          
          const shouldOverlap = newIn < existingOut && newOut > existingIn;
          return shouldOverlap ? result.rejected : result.accepted;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Frontend Testing

#### Component Testing
- Use Angular Testing Library or Jasmine/Karma
- Test component rendering with different inputs
- Test user interactions (clicks, form submissions)
- Test modal open/close behavior
- Mock HTTP services

#### Service Testing
- Test API service methods
- Mock HttpClient responses
- Test error handling
- Test data transformation

#### E2E Testing
- Use Cypress or Playwright
- Test complete user workflows:
  - Create booking flow
  - View booking details flow
  - Update room status flow
  - Generate revenue report flow
- Test responsive behavior at different screen sizes

### Backend Testing

#### API Endpoint Testing
- Use Supertest with Express
- Test all HTTP methods (GET, POST, PUT, DELETE)
- Test request validation
- Test error responses
- Test authentication/authorization (if implemented)

#### Service Layer Testing
- Test business logic in isolation
- Mock repository layer
- Test validation logic
- Test error handling

#### Repository Layer Testing
- Use test database or in-memory database
- Test CRUD operations
- Test query filters
- Test transaction handling
- Test constraint violations

#### Scheduler Testing
- Mock cron execution
- Test check-out logic with various booking scenarios
- Test error handling and logging
- Test manual trigger functionality

### Database Testing

#### Schema Testing
- Verify table structures match specifications
- Test foreign key constraints
- Test unique constraints
- Test check constraints
- Test indexes exist and are used

#### Migration Testing
- Test database migrations run successfully
- Test rollback functionality
- Test data integrity after migrations

### Integration Testing

#### API Integration
- Test frontend-backend communication
- Test data flow through all layers
- Test concurrent requests
- Test transaction boundaries

#### Scheduler Integration
- Test scheduler execution with real database
- Test booking status updates
- Test room status updates
- Test error scenarios

### Performance Testing

#### Load Testing
- Test API endpoints under load
- Test database query performance
- Test concurrent booking creation
- Identify bottlenecks

#### Stress Testing
- Test system behavior at capacity
- Test graceful degradation
- Test recovery from failures

### Test Coverage Goals

- **Unit test coverage**: Minimum 80% code coverage
- **Property test coverage**: All identified properties must have tests
- **Integration test coverage**: All critical user workflows
- **E2E test coverage**: All major features

### Continuous Integration

- Run all tests on every commit
- Run property tests with full iterations (100+) in CI
- Fail builds on test failures
- Generate and track coverage reports
- Run E2E tests on staging environment before production deployment

