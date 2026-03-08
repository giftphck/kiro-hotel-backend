# Implementation Plan: Hotel Front Desk Management System

## Overview

This implementation plan breaks down the Hotel Front Desk Management System into discrete coding tasks. The system uses Angular with Material UI for the frontend, Node.js with Express.js for the backend, and PostgreSQL for the database. Implementation follows an incremental approach, building core functionality first, then adding features progressively.

## Tasks

- [x] 1. Database setup and schema creation
  - [x] 1.1 Set up PostgreSQL database on Supabase
    - Create Supabase project and obtain connection credentials
    - Configure SSL/TLS connection settings
    - Store connection string as environment variable
    - _Requirements: 26.1, 26.2, 26.3, 26.6_

  - [x] 1.2 Create database schema with all tables
    - Create rooms table with room_id, room_number, room_status, room_type fields
    - Create customers table with customer_id, name, phone_number, thai_id_card fields
    - Create bookings table with all required fields and foreign keys
    - Create guests table with guest_id, booking_id, guest_name, id_card_number fields
    - Create room_prices table with price_id, room_id, date, and three price type fields
    - Add CHECK constraints for status enums and positive values
    - Add UNIQUE constraints (room_number, thai_id_card, room_id+date)
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

  - [x] 1.3 Create database indexes for performance
    - Create indexes on rooms(room_status), rooms(room_number)
    - Create indexes on customers(phone_number), customers(thai_id_card)
    - Create indexes on bookings(room_id), bookings(customer_id), bookings(check_in_date, check_out_date)
    - Create indexes on bookings(booking_status), bookings(check_out_date) WHERE booking_status = 'ACTIVE'
    - Create indexes on guests(booking_id)
    - Create indexes on room_prices(room_id, date)
    - _Requirements: 23.6_

  - [x] 1.4 Set up foreign key relationships
    - Add foreign key from bookings.room_id to rooms.room_id with ON DELETE RESTRICT
    - Add foreign key from bookings.customer_id to customers.customer_id with ON DELETE RESTRICT
    - Add foreign key from guests.booking_id to bookings.booking_id with ON DELETE CASCADE
    - Add foreign key from room_prices.room_id to rooms.room_id with ON DELETE CASCADE
    - _Requirements: 20.6, 20.7, 20.8, 20.9, 20.10_


- [x] 2. Backend project setup and core infrastructure
  - [x] 2.1 Initialize Node.js backend project
    - Create backend directory structure with src/ folder
    - Initialize package.json with npm init
    - Install core dependencies: express, typescript, @types/node, @types/express
    - Install database dependencies: pg (node-postgres)
    - Install development dependencies: ts-node, nodemon, @types/pg
    - Set up TypeScript configuration (tsconfig.json)
    - _Requirements: 22.1, 22.2, 22.4_

  - [x] 2.2 Create layered architecture structure
    - Create directories: routes/, controllers/, services/, repositories/, models/, middleware/, config/, schedulers/
    - Create app.ts for Express app setup
    - Create server.ts for starting the server
    - _Requirements: 29.1_

  - [x] 2.3 Set up database connection and pooling
    - Create config/database.config.ts with PostgreSQL connection pool configuration
    - Implement connection pooling using pg.Pool
    - Add connection error handling and retry logic
    - Export database pool instance for use in repositories
    - _Requirements: 23.2, 23.3_

  - [x] 2.4 Create TypeScript models and interfaces
    - Create models/room.model.ts with Room interface and RoomStatus enum
    - Create models/booking.model.ts with Booking, BookingType, BookingStatus enums, and CreateBookingDto
    - Create models/customer.model.ts with Customer interface
    - Create models/guest.model.ts with Guest and CreateGuestDto interfaces
    - Create models/room-price.model.ts with RoomPrice interface
    - Create models/report.model.ts with RevenueReport and RevenueDetail interfaces
    - _Requirements: 22.4_

  - [x] 2.5 Set up Express middleware and error handling
    - Create middleware/error-handler.ts for global error handling
    - Create middleware/logger.ts for request logging
    - Configure Express to use JSON body parser
    - Configure CORS middleware to allow frontend access
    - Set up error response format with code, message, details, timestamp
    - _Requirements: 22.8, 27.4, 27.7_

  - [x] 2.6 Create health check endpoint
    - Create routes/health.routes.ts
    - Create GET /api/health endpoint that returns backend status
    - Test database connection in health check
    - _Requirements: 27.6_


- [x] 3. Backend repository layer implementation
  - [ ] 3.1 Create room repository
    - Create repositories/room.repository.ts
    - Implement getAllRooms() method with parameterized query
    - Implement getRoomById(roomId) method
    - Implement updateRoomStatus(roomId, status) method
    - Implement getRoomStatusForDateRange(roomId, startDate, endDate) method
    - Use parameterized queries to prevent SQL injection
    - _Requirements: 23.4_

  - [ ] 3.2 Create customer repository
    - Create repositories/customer.repository.ts
    - Implement createCustomer(customer) method
    - Implement findCustomerByThaiId(thaiIdCard) method
    - Implement getCustomerById(customerId) method
    - Implement updateCustomer(customerId, customer) method
    - Use parameterized queries to prevent SQL injection
    - _Requirements: 23.4_

  - [ ] 3.3 Create booking repository
    - Create repositories/booking.repository.ts
    - Implement createBooking(booking) method with transaction support
    - Implement getBookingById(bookingId) method with JOIN to populate room and customer
    - Implement getBookings(filters) method with optional filtering
    - Implement updateBookingStatus(bookingId, status) method
    - Implement getTodayCheckIns(date) method
    - Implement getTodayCheckOuts(date) method
    - Implement findOverlappingBookings(roomId, checkIn, checkOut) method
    - Use parameterized queries to prevent SQL injection
    - _Requirements: 23.4, 23.5_

  - [ ] 3.4 Create guest repository
    - Create repositories/guest.repository.ts
    - Implement createGuest(guest) method
    - Implement getGuestsByBookingId(bookingId) method
    - Implement updateGuest(guestId, guest) method
    - Implement deleteGuest(guestId) method
    - Use parameterized queries to prevent SQL injection
    - _Requirements: 23.4_

  - [ ] 3.5 Create room price repository
    - Create repositories/room-price.repository.ts
    - Implement createRoomPrice(roomPrice) method
    - Implement getRoomPriceByRoomAndDate(roomId, date) method
    - Implement getRoomPrices(filters) method
    - Implement updateRoomPrice(priceId, roomPrice) method
    - Implement deleteRoomPrice(priceId) method
    - Use parameterized queries to prevent SQL injection
    - _Requirements: 23.4_


- [ ] 4. Backend service layer with business logic
  - [x] 4.1 Create booking validation service
    - Create services/validation.service.ts
    - Implement validateBooking(booking) method that checks all required fields
    - Implement validateDates(checkIn, checkOut) method that ensures checkOut > checkIn
    - Implement checkDoubleBooking(roomId, checkIn, checkOut) method using repository
    - Return ValidationResult with success/failure and error details
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 4.2 Write property test for date range overlap detection
    - **Property 11: Date Range Overlap Detection**
    - **Validates: Requirements 12.3**
    - Use fast-check library to generate random date ranges
    - Test that overlap detection correctly identifies overlapping ranges
    - Run with minimum 100 iterations

  - [ ] 4.3 Create booking service with complete booking flow
    - Create services/booking.service.ts
    - Implement createBooking(createBookingDto) method
    - Inside createBooking: validate booking data using validation service
    - Inside createBooking: check for double booking and reject if found
    - Inside createBooking: create or find customer record
    - Inside createBooking: create booking record with ACTIVE status
    - Inside createBooking: determine room status (RESERVED if future, OCCUPIED if today/past)
    - Inside createBooking: update room status
    - Inside createBooking: create guest records if provided
    - Use database transaction for atomicity
    - Return complete booking with populated customer and guests
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6, 12.1, 12.2_

  - [ ] 4.4 Write property test for double booking prevention
    - **Property 12: Double Booking Prevention**
    - **Validates: Requirements 12.1, 12.2**
    - Use fast-check to generate booking attempts with overlapping dates
    - Test that overlapping bookings are rejected
    - Run with minimum 100 iterations

  - [x] 4.5 Create room service
    - Create services/room.service.ts
    - Implement getRooms() method
    - Implement getRoomById(roomId) method
    - Implement updateRoomStatus(roomId, status) method with validation
    - Implement getRoomStatusForDateRange(roomId, startDate, endDate) method
    - _Requirements: 15.1, 15.3_

  - [ ] 4.6 Create report service with revenue calculations
    - Create services/report.service.ts
    - Implement getDailyRevenue(date) method
    - Implement getMonthlyRevenue(year, month) method
    - Implement getYearlyRevenue(year) method
    - Calculate totalRevenue as sum of deposits from CHECKED_OUT bookings in period
    - Calculate roomsSold as count of unique room IDs from CHECKED_OUT bookings in period
    - Calculate bookingCount as total count of CHECKED_OUT bookings in period
    - _Requirements: 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [ ] 4.7 Write property test for revenue calculation
    - **Property 21: Revenue Calculation**
    - **Validates: Requirements 17.5**
    - Use fast-check to generate arrays of bookings with random deposits and statuses
    - Test that revenue equals sum of deposits from CHECKED_OUT bookings only
    - Run with minimum 100 iterations


- [ ] 5. Backend API endpoints - Rooms
  - [x] 5.1 Create rooms controller and routes
    - Create controllers/rooms.controller.ts
    - Create routes/rooms.routes.ts
    - Implement GET /api/rooms endpoint to get all rooms
    - Implement GET /api/rooms/:id endpoint to get room by ID
    - Implement GET /api/rooms/:id/status endpoint with query params for date range
    - Implement PUT /api/rooms/:id/status endpoint to update room status
    - Handle errors and return appropriate HTTP status codes (200, 404, 400, 500)
    - Return JSON responses with proper error format
    - _Requirements: 22.5, 22.6, 22.7, 22.8_

  - [ ] 5.2 Write unit tests for rooms endpoints
    - Test GET /api/rooms returns array of rooms
    - Test GET /api/rooms/:id returns 404 for non-existent room
    - Test PUT /api/rooms/:id/status validates status values
    - Test error handling for invalid requests

- [ ] 6. Backend API endpoints - Customers
  - [ ] 6.1 Create customers controller and routes
    - Create controllers/customers.controller.ts
    - Create routes/customers.routes.ts
    - Implement GET /api/customers endpoint to get all customers
    - Implement GET /api/customers/:id endpoint to get customer by ID
    - Implement POST /api/customers endpoint to create customer
    - Implement PUT /api/customers/:id endpoint to update customer
    - Validate required fields (name, phone_number, thai_id_card)
    - Handle unique constraint violations for thai_id_card
    - Return appropriate HTTP status codes
    - _Requirements: 22.5, 22.6, 22.7, 22.8_

- [ ] 7. Backend API endpoints - Bookings
  - [ ] 7.1 Create bookings controller and routes
    - Create controllers/bookings.controller.ts
    - Create routes/bookings.routes.ts
    - Implement GET /api/bookings endpoint with optional filters
    - Implement GET /api/bookings/:id endpoint to get booking by ID with populated data
    - Implement POST /api/bookings endpoint to create booking
    - Implement PUT /api/bookings/:id endpoint to update booking
    - Implement DELETE /api/bookings/:id endpoint to cancel booking (set status to CANCELLED)
    - Implement GET /api/bookings/today/checkin endpoint
    - Implement GET /api/bookings/today/checkout endpoint
    - Implement POST /api/bookings/validate endpoint for double booking check
    - Validate all required fields in POST request
    - Return 409 Conflict for double booking attempts with error details
    - Return 400 Bad Request for invalid data with field-level errors
    - _Requirements: 22.5, 22.6, 22.7, 22.8, 10.1, 10.2, 10.7, 12.2_

  - [ ] 7.2 Write unit tests for bookings endpoints
    - Test POST /api/bookings creates booking with valid data
    - Test POST /api/bookings returns 409 for double booking
    - Test POST /api/bookings returns 400 for invalid dates
    - Test GET /api/bookings/today/checkin returns correct bookings
    - Test GET /api/bookings/today/checkout returns correct bookings


- [ ] 8. Backend API endpoints - Guests and Room Prices
  - [ ] 8.1 Create guests controller and routes
    - Create controllers/guests.controller.ts
    - Create routes/guests.routes.ts
    - Implement GET /api/guests/booking/:bookingId endpoint
    - Implement POST /api/guests endpoint to add guest to booking
    - Implement PUT /api/guests/:id endpoint to update guest
    - Implement DELETE /api/guests/:id endpoint to remove guest
    - Validate required fields (guest_name, id_card_number)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 8.2 Create room prices controller and routes
    - Create controllers/room-prices.controller.ts
    - Create routes/room-prices.routes.ts
    - Implement GET /api/room-prices endpoint with optional filters
    - Implement GET /api/room-prices/room/:roomId/date/:date endpoint
    - Implement POST /api/room-prices endpoint to create price
    - Implement PUT /api/room-prices/:id endpoint to update price
    - Implement DELETE /api/room-prices/:id endpoint to delete price
    - Handle unique constraint violations for room_id + date combination
    - _Requirements: 16.3, 16.4, 16.5_

  - [x] 8.3 Create reports controller and routes
    - Create controllers/reports.controller.ts
    - Create routes/reports.routes.ts
    - Implement GET /api/reports/revenue/daily?date=YYYY-MM-DD endpoint
    - Implement GET /api/reports/revenue/monthly?year=YYYY&month=MM endpoint
    - Implement GET /api/reports/revenue/yearly?year=YYYY endpoint
    - Validate query parameters
    - Return RevenueReport with totalRevenue, roomsSold, bookingCount
    - _Requirements: 17.2, 17.3, 17.4_

- [ ] 9. Automated scheduler implementation with external cron service
  - [ ] 9.1 Create scheduler endpoint with API key authentication
    - Create routes/scheduler.routes.ts
    - Create controllers/scheduler.controller.ts
    - Implement POST /api/scheduler/trigger-checkout endpoint
    - Add API key authentication middleware
    - Validate API key from environment variable (SCHEDULER_API_KEY)
    - Return 401 Unauthorized if API key is invalid or missing
    - _Requirements: 24.1, 24.2, 24.8, 24.9_

  - [ ] 9.2 Implement automated check-out logic
    - In scheduler controller, implement triggerCheckout() method
    - Query all bookings where check_out_date = current date AND booking_status = ACTIVE
    - For each booking: update booking_status to CHECKED_OUT
    - For each booking: update associated room_status to CLEANING
    - Use database transaction for each booking update
    - Log all executions with timestamp and results
    - Handle errors gracefully and continue with remaining bookings
    - Return success response with execution summary
    - _Requirements: 14.2, 14.3, 14.4, 24.4, 24.5, 24.6_

  - [ ] 9.3 Write unit tests for scheduler endpoint
    - Test triggerCheckout updates correct bookings
    - Test room status changes to CLEANING after check-out
    - Test API key authentication (valid, invalid, missing)
    - Test error handling and continues with remaining bookings
    - Test response format

  - [ ] 9.4 Configure external cron service
    - Sign up for free cron service (e.g., cron-job.org)
    - Create cron job to call POST /api/scheduler/trigger-checkout
    - Set schedule to daily at 12:00 PM (noon)
    - Add SCHEDULER_API_KEY to request headers
    - Configure notification on failure (optional)
    - Test manual trigger to verify setup
    - _Requirements: 24.3, 24.7, 24.10_


- [ ] 10. Frontend project setup and core structure
  - [x] 10.1 Initialize Angular project
    - Create Angular project using Angular CLI (ng new)
    - Install Angular Material: ng add @angular/material
    - Install additional dependencies: rxjs, date-fns (for date handling)
    - Configure Angular Material theme with custom colors (light blue, green, orange, yellow)
    - Set up global styles for rounded corners, soft shadows, gradient backgrounds
    - _Requirements: 21.1, 21.2, 3.1, 3.2, 3.4, 3.5, 3.6, 3.7_

  - [ ] 10.2 Create project structure with modules
    - Create core module (ng g module core)
    - Create shared module (ng g module shared)
    - Create layout module (ng g module layout)
    - Create feature modules: room-board, bookings, room-prices, reports, settings
    - Set up routing module with lazy loading for feature modules
    - _Requirements: 28.1, 28.2, 28.3, 28.7, 28.8_

  - [ ] 10.3 Create TypeScript models
    - Create models/room.model.ts with Room interface and RoomStatus enum
    - Create models/booking.model.ts with Booking, BookingType, BookingStatus, CreateBookingDto
    - Create models/customer.model.ts with Customer interface
    - Create models/guest.model.ts with Guest and CreateGuestDto
    - Create models/room-price.model.ts with RoomPrice interface
    - Create models/report.model.ts with RevenueReport interface
    - _Requirements: 28.5_

  - [ ] 10.4 Create core services
    - Create core/services/api.service.ts with base HTTP methods and error handling
    - Create core/services/room.service.ts with methods matching backend API
    - Create core/services/booking.service.ts with methods matching backend API
    - Create core/services/customer.service.ts with methods matching backend API
    - Create core/services/guest.service.ts with methods matching backend API
    - Create core/services/room-price.service.ts with methods matching backend API
    - Create core/services/report.service.ts with methods matching backend API
    - Use Angular HttpClient for all HTTP requests
    - Use RxJS operators for data transformation
    - Store backend API URL in environment configuration
    - _Requirements: 21.6, 21.8, 28.4, 28.9_

  - [ ] 10.5 Create HTTP error interceptor
    - Create core/interceptors/http-error.interceptor.ts
    - Intercept HTTP errors and transform to user-friendly messages in Thai
    - Handle network errors, timeout errors, and API errors
    - Display error notifications using Angular Material Snackbar
    - _Requirements: 21.6_

  - [ ] 10.6 Create shared Material module
    - Create shared/material.module.ts
    - Import and export commonly used Material modules: MatButtonModule, MatCardModule, MatDialogModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSidenavModule, MatToolbarModule, MatTableModule, MatSnackBarModule
    - _Requirements: 28.6_


- [ ] 11. Layout components - Sidebar and Top Bar
  - [x] 11.1 Create Sidebar component
    - Create layout/sidebar/sidebar.component.ts
    - Display hotel logo at top using Material Icon
    - Create menu items array: Dashboard, Room Board (ห้องพัก), Room Price (ราคาห้อง), Reports (รายงาน), Settings (ตั้งค่า)
    - Display menu items with icons using mat-nav-list
    - Highlight active menu item based on current route using routerLinkActive
    - Display admin profile section at bottom with avatar and name
    - Add Logout button with icon in profile section
    - Apply light blue gradient background (#E3F2FD)
    - Apply soft shadow and rounded corners to all elements
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 19.1.3_

  - [x] 11.2 Create Top Bar component
    - Create layout/top-bar/top-bar.component.ts
    - Display blue "จองห้องพัก" button on the right side
    - Display "รายงาน" link
    - Display Settings icon (gear/cog) using Material Icon
    - Display Notification icon (bell) using Material Icon
    - Display user profile avatar with dropdown menu using mat-menu
    - Emit event when "จองห้องพัก" button is clicked
    - Apply consistent styling with blue button (#64B5F6) and white text
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.10_

  - [x] 11.3 Create main layout component
    - Create layout/main-layout/main-layout.component.ts
    - Integrate Sidebar and Top Bar components
    - Use mat-sidenav-container for responsive layout
    - Add router-outlet for displaying feature components
    - Apply white background to main content area
    - _Requirements: 4.9_

  - [x] 11.4 Implement responsive sidebar behavior
    - Add breakpoint observer to detect screen width
    - When screen width < 768px, collapse sidebar into hamburger menu
    - Add hamburger menu icon to Top Bar for mobile
    - Toggle sidebar visibility on hamburger menu click
    - _Requirements: 19.2_


- [ ] 12. Shared components - Date Pickers
  - [ ] 12.1 Create Date Picker component
    - Create shared/components/date-picker/date-picker.component.ts
    - Wrap Angular Material Datepicker (mat-datepicker)
    - Display calendar popup on field click
    - Highlight selected date in calendar
    - Support month and year navigation
    - Format dates in readable format (e.g., "5 Mar 2026")
    - Apply rounded corners and soft shadows to calendar popup
    - Support form control integration with ControlValueAccessor
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.8_

  - [ ] 12.2 Create Date Range Picker component
    - Create shared/components/date-range-picker/date-range-picker.component.ts
    - Use Angular Material Datepicker with range selection (mat-date-range-picker)
    - Display start date and end date fields
    - Highlight selected date range in calendar
    - Format dates in Thai format (e.g., "08 เมษายน 2026 ถึง 14 เมษายน 2026")
    - Validate that end date >= start date
    - Apply rounded corners and soft shadows to calendar popup
    - Emit event when date range changes
    - _Requirements: 9.1.1, 9.1.2, 9.1.3, 9.1.4, 9.1.5, 9.1.6, 9.1.7, 9.1.8_

  - [ ] 12.3 Write unit tests for date pickers
    - Test date picker displays calendar on click
    - Test date range picker validates end date >= start date
    - Test date formatting in Thai format
    - Test form control integration

- [ ] 13. Room Board - Grid and Cell components
  - [ ] 13.1 Create Room Cell component
    - Create room-board/components/room-cell/room-cell.component.ts
    - Accept inputs: roomStatus, guestName, bookingType, date
    - Display status text based on roomStatus: "ว่าง" (AVAILABLE), "เข้าพัก" (OCCUPIED), "จองแล้ว" (RESERVED), "Cleaning" (CLEANING)
    - Apply status colors: green (#81C784) for AVAILABLE, red-orange (#E57373) for OCCUPIED, yellow-orange (#FFB74D) for RESERVED, yellow (#FFD54F) for CLEANING
    - Display guest name for OCCUPIED and RESERVED statuses
    - Display cleaning icon for CLEANING status
    - Display appropriate room icon (person, bed) for bookings
    - Apply white text color on colored backgrounds
    - Apply rounded corners and consistent padding
    - Center-align content
    - Emit click event with room and date data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ] 13.2 Write property test for room status display mapping
    - **Property 1: Room Status Display Mapping**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - Use fast-check to generate all possible room statuses
    - Test that each status maps to correct color, text, and icons
    - Run with minimum 100 iterations

  - [ ] 13.3 Create Room Board Grid component
    - Create room-board/components/room-board-grid/room-board-grid.component.ts
    - Accept inputs: rooms array, startDate, endDate
    - Generate date columns from startDate to endDate (minimum 7 dates)
    - Display room numbers in leftmost column (e.g., "ห้อง 101", "ห้อง 102")
    - Display date headers in Thai format (e.g., "8 เมษ.", "9 เมษ.")
    - Render grid with rooms as rows and dates as columns
    - Use RoomCellComponent for each cell
    - Query booking data for each room-date combination
    - Apply white background, soft shadow to grid container
    - Support horizontal scrolling for many dates
    - Handle cell click events and emit to parent
    - _Requirements: 4.1, 4.2, 4.6, 4.7, 4.8, 4.10, 4.11_


- [ ] 14. Room Board - Today sections
  - [ ] 14.1 Create Check-Out Today component
    - Create room-board/components/checkout-today/checkout-today.component.ts
    - Display section title "Check-out วันนี้"
    - Query bookings where check_out_date = current date AND booking_status = ACTIVE using BookingService
    - Display each room as a card with room number, guest name, check-out time (12:00)
    - Display clock icon next to check-out time
    - Format room numbers as "ห้อง XXX"
    - Render as white card with rounded corners and soft shadow
    - Display empty state message when no check-outs
    - Subscribe to booking changes and update automatically
    - _Requirements: 6.1.1, 6.1.2, 6.1.3, 6.1.4, 6.1.5, 6.1.6, 6.1.7, 6.1.8, 6.1.9_

  - [ ] 14.2 Write property test for today's check-out query
    - **Property 6: Today's Check-Out Query**
    - **Validates: Requirements 6.1.3**
    - Use fast-check to generate arrays of bookings with random dates and statuses
    - Test that query returns only bookings with check_out_date = today AND status = ACTIVE
    - Run with minimum 100 iterations

  - [ ] 14.3 Create Check-In Today component
    - Create room-board/components/checkin-today/checkin-today.component.ts
    - Display section title "Check-in วันนี้"
    - Query bookings where check_in_date = current date AND booking_status = ACTIVE using BookingService
    - Display each room as a card with room number, guest name, check-in time (14:00)
    - Display clock icon next to check-in time
    - Format room numbers as "ห้อง XXX"
    - Render as white card with rounded corners and soft shadow
    - Display empty state message when no check-ins
    - Subscribe to booking changes and update automatically
    - _Requirements: 6.2.1, 6.2.2, 6.2.3, 6.2.4, 6.2.5, 6.2.6, 6.2.7, 6.2.8, 6.2.9_

  - [ ] 14.4 Create Detailed Room View Table component
    - Create room-board/components/detailed-room-view/detailed-room-view.component.ts
    - Display table title "ตั้งเวลาที่ [selected date]" with dynamic date
    - Render table with same grid layout as main Room Board
    - Display room numbers in leftmost column
    - Display multiple date columns with room status
    - Apply same Status_Color scheme as main grid
    - Display Room_Icon in cells with bookings
    - Render as white card with rounded corners and soft shadow
    - Synchronize date range with main Room Board grid
    - Support horizontal scrolling
    - _Requirements: 9.2.1, 9.2.2, 9.2.3, 9.2.4, 9.2.5, 9.2.6, 9.2.7, 9.2.8, 9.2.9, 9.2.10_

- [ ] 15. Room Board - Main page integration
  - [ ] 15.1 Create Room Board page component
    - Create room-board/room-board-page.component.ts
    - Display page title "ห้องพัก" at top
    - Add Date Range Picker component with start and end date
    - Add blue "ค้นหา" (Search) button next to date range picker
    - Display Check-Out Today section on left side
    - Display Check-In Today section below Check-Out Today
    - Display Room Board Grid in main area
    - Display Detailed Room View Table below grid
    - Handle date range changes and update grid
    - Handle cell clicks and open appropriate modal
    - Apply white background to main content area
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ] 15.2 Write property test for date range grid update
    - **Property 4: Date Range Grid Update**
    - **Validates: Requirements 4.5**
    - Use fast-check to generate valid date ranges
    - Test that grid displays exactly the selected date range as columns
    - Run with minimum 100 iterations


- [ ] 16. Booking modals - Add Booking
  - [ ] 16.1 Create Add Booking Modal component
    - Create bookings/components/add-booking-modal/add-booking-modal.component.ts
    - Use Angular Material Dialog (mat-dialog)
    - Render as white card with soft shadow and rounded corners
    - Display centered on screen with semi-transparent backdrop
    - Create reactive form with fields: customer name, phone number, Thai ID card, booking type, check-in date, check-out date, number of guests, deposit, remark
    - Add Date Picker for check-in and check-out dates
    - Add dropdown for booking type: 3_HOUR, DAILY, MONTHLY
    - Add blue "Confirm Booking" button at bottom
    - Pre-fill check-in date with date from clicked cell (passed as dialog data)
    - Validate all required fields
    - Validate check-out date > check-in date
    - Apply consistent spacing and padding to form fields
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.9, 7.10, 10.2_

  - [ ] 16.2 Implement booking creation logic in modal
    - On form submit, call BookingService.createBooking() with form data
    - Handle successful creation: close modal and emit success event
    - Handle validation errors: display error message in modal without closing
    - Handle double booking error (409): display specific error message in Thai
    - Handle network errors: display retry option
    - Show loading spinner during API call
    - _Requirements: 10.1, 10.6, 10.7, 12.2_

  - [ ] 16.3 Write property test for booking creation with valid data
    - **Property 8: Booking Creation with Valid Data**
    - **Validates: Requirements 10.1, 10.2, 10.4, 10.6**
    - Use fast-check to generate valid booking data
    - Test that valid bookings are created successfully
    - Run with minimum 100 iterations

  - [ ] 16.3 Handle modal close events
    - Close modal on backdrop click
    - Close modal on Escape key press
    - Close modal on explicit close button click
    - Emit cancel event when modal closes without saving
    - _Requirements: 7.8_

- [ ] 17. Booking modals - Booking Details
  - [ ] 17.1 Create Booking Details Modal component
    - Create bookings/components/booking-details-modal/booking-details-modal.component.ts
    - Use Angular Material Dialog (mat-dialog)
    - Render as white card with soft shadow and rounded corners
    - Accept booking data as dialog input
    - Display fields: Room number, Guest name, Phone number, ID card number, Check-out date, Days remaining, Remark
    - Calculate days remaining as difference between check_out_date and current date
    - Format all information with clear labels in Thai
    - Apply consistent spacing between fields
    - Add blue "Close" button at bottom
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.7, 8.8_

  - [ ] 17.2 Handle modal close events
    - Close modal on Close button click
    - Close modal on backdrop click
    - Close modal on Escape key press
    - _Requirements: 8.6_


- [ ] 18. Room Board - Modal integration and cell click handling
  - [ ] 18.1 Implement cell click handler in Room Board page
    - In Room Board page component, handle cell click events from grid
    - When cell with AVAILABLE status is clicked: open Add Booking Modal with MatDialog
    - When cell with OCCUPIED or RESERVED status is clicked: fetch booking details and open Booking Details Modal
    - When cell with CLEANING status is clicked: open confirmation dialog to mark room as clean
    - Pass room ID and date to Add Booking Modal as dialog data
    - Pass booking data to Booking Details Modal as dialog data
    - _Requirements: 7.1, 8.1, 15.2_

  - [ ] 18.2 Write property test for modal opening on cell click
    - **Property 3: Modal Opening on Cell Click**
    - **Validates: Requirements 7.1, 8.1, 15.2**
    - Use fast-check to generate different room statuses
    - Test that correct modal opens for each status
    - Run with minimum 100 iterations

  - [ ] 18.3 Implement room cleaning status update
    - Create confirmation dialog for marking room as clean
    - On confirmation, call RoomService.updateRoomStatus() to change status to AVAILABLE
    - Refresh Room Board grid after status update
    - Display success message using MatSnackBar
    - _Requirements: 15.1, 15.3, 15.4_

  - [ ] 18.4 Handle booking creation success
    - Subscribe to Add Booking Modal close event
    - On successful booking creation: refresh Room Board grid
    - Update room status in grid immediately (optimistic update)
    - Display success message in Thai using MatSnackBar
    - _Requirements: 10.6_

- [ ] 19. Room Price Management page
  - [x] 19.1 Create Room Price Management component
    - Create room-prices/room-price-management.component.ts
    - Display page title "ราคาห้อง"
    - Create table/grid for displaying room prices using mat-table
    - Display columns: Room number, Date, 3-hour price, Daily price, Monthly price, Actions
    - Add "Add Price" button to open create form
    - Add edit and delete buttons for each row
    - Apply same design style as other pages (rounded corners, soft shadows, white card)
    - _Requirements: 16.1, 16.5_

  - [x] 19.2 Implement room price CRUD operations
    - Create form for adding/editing room prices
    - Implement create: call RoomPriceService.createRoomPrice()
    - Implement update: call RoomPriceService.updateRoomPrice()
    - Implement delete: call RoomPriceService.deleteRoomPrice() with confirmation
    - Handle unique constraint violations for room + date combination
    - Validate all three price types are non-negative
    - Refresh table after each operation
    - _Requirements: 16.3, 16.4_

  - [x] 19.3 Write unit tests for room price CRUD
    - Test create room price with valid data
    - Test update room price
    - Test delete room price with confirmation
    - Test unique constraint violation handling


- [ ] 20. Reports page with revenue calculations
  - [x] 20.1 Create Revenue Report component
    - Create reports/revenue-report.component.ts
    - Display page title "รายงาน"
    - Add period selector: Daily, Monthly, Yearly (using mat-button-toggle-group)
    - Add date picker for daily reports
    - Add month/year picker for monthly reports
    - Add year picker for yearly reports
    - Display report metrics: Total Revenue, Rooms Sold, Booking Count
    - Use mat-card for each metric with large numbers and labels
    - Apply same design style (rounded corners, soft shadows, consistent colors)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.8_

  - [x] 20.2 Implement revenue report data fetching
    - Call ReportService.getDailyRevenue() for daily reports
    - Call ReportService.getMonthlyRevenue() for monthly reports
    - Call ReportService.getYearlyRevenue() for yearly reports
    - Display loading spinner while fetching data
    - Handle errors and display error messages
    - Format currency values with Thai Baht symbol
    - _Requirements: 17.2, 17.3, 17.4_

  - [x] 20.3 Add charts for revenue visualization
    - Install chart library (e.g., ng2-charts or ngx-charts)
    - Create bar chart for revenue over time
    - Create line chart for booking trends
    - Display charts below metrics cards
    - Apply consistent styling to charts
    - _Requirements: 17.8_

  - [x] 20.4 Write property tests for revenue calculations
    - **Property 21: Revenue Calculation**
    - **Property 22: Rooms Sold Calculation**
    - **Property 23: Booking Count Calculation**
    - **Validates: Requirements 17.5, 17.6, 17.7**
    - Use fast-check to generate booking data with various statuses and dates
    - Test that calculations match expected values
    - Run with minimum 100 iterations each

- [ ] 21. Multi-language support and Thai formatting
  - [x] 21.1 Implement Thai language labels throughout application
    - Update all menu items to Thai: "แดชบอร์ด", "ห้องพัก", "ราคาห้อง", "รายงาน", "ตั้งค่า"
    - Update all button labels to Thai: "จองห้องพัก", "ค้นหา", "ออกจากระบบ"
    - Update all status labels to Thai: "ว่าง", "เข้าพัก", "จองแล้ว"
    - Update all section titles to Thai: "Check-out วันนี้", "Check-in วันนี้"
    - Keep some labels in English where appropriate: "Available", "Cleaning"
    - _Requirements: 19.1.2, 19.1.3, 19.1.4, 19.1.5, 19.1.6_

  - [x] 21.2 Implement Thai date formatting
    - Create date formatting utility function
    - Format dates as "8 เมษายน 2026" for full dates
    - Format dates as "8 เมษ." for short dates
    - Use Thai month names: มกราคม, กุมภาพันธ์, มีนาคม, เมษายน, etc.
    - Apply formatting to all date displays in application
    - _Requirements: 19.1.7, 4.11_

  - [x] 21.3 Ensure consistent language usage
    - Review all components for language consistency
    - Ensure mixed Thai-English labels are used appropriately
    - Test all user-facing text for correct Thai language
    - _Requirements: 19.1.8_


- [ ] 22. Responsive design implementation
  - [x] 22.1 Implement responsive grid behavior
    - Use Angular Flex Layout or CSS Grid for responsive layout
    - When screen width < 768px: reduce number of date columns in Room Board grid
    - Adjust grid cell sizes for different screen sizes
    - Ensure horizontal scrolling works on mobile devices
    - Test grid rendering on screens from 320px to 1920px width
    - _Requirements: 19.1, 19.3, 19.4_

  - [x] 22.2 Implement responsive sidebar (already done in task 11.4)
    - Verify sidebar collapses to hamburger menu on mobile
    - Test sidebar toggle functionality
    - _Requirements: 19.2_

  - [x] 22.3 Ensure touch-friendly interactions
    - Increase touch target sizes for mobile (minimum 44x44px)
    - Test all buttons and interactive elements on touch devices
    - Ensure modals are usable on mobile screens
    - Test date pickers on mobile devices
    - _Requirements: 19.5_

  - [x] 22.4 Maintain consistent spacing across screen sizes
    - Use relative units (rem, em, %) for spacing and padding
    - Test spacing consistency on different screen sizes
    - Ensure readability on all devices
    - _Requirements: 19.6_

- [ ] 23. Icon system implementation
  - [x] 23.1 Integrate Angular Material Icons
    - Import MatIconModule in shared module
    - Add Material Icons font to index.html or styles
    - _Requirements: 18.1_

  - [x] 23.2 Add icons throughout the application
    - Add cleaning icon (mop/broom) to CLEANING status cells
    - Add bell icon to notification area in Top Bar
    - Add user avatar icon to Top Bar and Sidebar
    - Add icons to sidebar menu items: dashboard, room board, price tag, report, settings
    - Add hotel/building icon as logo in Sidebar
    - Add logout icon next to Logout button
    - Add clock icons to check-in/check-out time displays
    - Add person/bed icons to booking cells
    - Ensure consistent icon sizes (24px default)
    - Use blue color (#64B5F6) for icons on light backgrounds
    - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 6.1.5, 6.2.5_

- [ ] 24. Guest management integration
  - [x] 24.1 Add guest input fields to Add Booking Modal
    - Add dynamic form array for multiple guests
    - Each guest has: guest name and ID card number fields
    - Add "Add Guest" button to add more guest entries
    - Add remove button for each guest entry
    - Validate required fields for each guest
    - _Requirements: 11.1, 11.2_

  - [x] 24.2 Display guests in Booking Details Modal
    - Fetch guests for booking using GuestService
    - Display all guests associated with booking
    - Show guest name and ID card number for each guest
    - _Requirements: 11.3, 11.4_

  - [x] 24.3 Write property tests for guest management
    - **Property 13: Guest Association**
    - **Property 14: Multiple Guests Per Booking**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
    - Use fast-check to generate bookings with multiple guests
    - Test that all guests are correctly associated with booking
    - Run with minimum 100 iterations


- [x] 25. Checkpoint - Core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Backend deployment configuration for Render (Free tier)
  - [x] 26.1 Set up environment variables
    - Create .env.example file with all required variables
    - Document: DATABASE_URL, PORT, NODE_ENV, CORS_ORIGIN
    - Create .env file for local development (add to .gitignore)
    - _Requirements: 27.2_

  - [ ] 26.2 Configure CORS for frontend access
    - Configure CORS middleware in Express app
    - Allow requests from Vercel frontend domain
    - Set appropriate CORS headers for cross-origin requests
    - _Requirements: 27.4_

  - [ ] 26.3 Set up HTTPS configuration
    - HTTPS is automatic on Render (no configuration needed)
    - Configure Express to trust proxy headers (app.set('trust proxy', 1))
    - _Requirements: 27.3_

  - [ ] 26.4 Create deployment scripts for Render
    - Add build script to package.json: "tsc" to compile TypeScript to JavaScript
    - Add start script for production: "node dist/server.js"
    - Add dev script for development: "nodemon --exec ts-node src/server.ts"
    - Ensure health check endpoint is implemented (required for Render free tier)
    - _Requirements: 27.1, 27.6_

  - [ ] 26.5 Create render.yaml for Render deployment
    - Create render.yaml in project root
    - Configure service type as "web"
    - Set build command: "npm install && npm run build"
    - Set start command: "npm start"
    - Configure environment variables (DATABASE_URL, NODE_ENV, CORS_ORIGIN)
    - Set health check path to "/api/health"
    - Configure auto-deploy from main branch
    - _Requirements: 27.1, 27.8_

  - [ ] 26.6 Document Render deployment process
    - Create README.md with Render deployment instructions
    - Document how to connect GitHub repository to Render
    - Document environment variables setup in Render dashboard (including SCHEDULER_API_KEY)
    - Document Supabase database connection setup
    - Document external cron service setup (cron-job.org)
    - Include step-by-step guide for configuring cron job with API key
    - Note: Render free tier may sleep after 15 minutes of inactivity (external cron wakes it up)
    - _Requirements: 27.1, 27.5, 27.8, 24.10_

- [ ] 27. Frontend deployment configuration
  - [ ] 27.1 Configure environment files
    - Create environment.ts for development with local backend URL
    - Create environment.prod.ts for production with production backend URL
    - Store backend API URL in environment configuration
    - _Requirements: 25.5, 28.9_

  - [ ] 27.2 Set up Vercel configuration
    - Create vercel.json for SPA routing configuration
    - Configure rewrites to support Angular routing
    - Configure build command: ng build --configuration production
    - Configure output directory: dist/[project-name]
    - _Requirements: 25.1, 25.3_

  - [ ] 27.3 Configure production build
    - Update angular.json for production optimizations
    - Enable AOT compilation
    - Enable build optimizer
    - Configure base href for deployment
    - _Requirements: 25.2_

  - [ ] 27.4 Set up HTTPS and environment variables in Vercel
    - Document how to set environment variables in Vercel dashboard
    - Verify HTTPS is enabled (automatic on Vercel)
    - _Requirements: 25.4, 25.5_

  - [ ] 27.5 Configure automatic deployment
    - Connect Vercel to Git repository
    - Configure automatic deployment on push to main branch
    - Test deployment process
    - _Requirements: 25.6_


- [ ] 28. Integration testing and end-to-end testing
  - [ ] 28.1 Set up backend integration tests
    - Install testing dependencies: jest, supertest, @types/jest
    - Configure jest for TypeScript
    - Create test database configuration
    - _Requirements: Testing Strategy_

  - [ ] 28.2 Write integration tests for booking flow
    - Test complete booking creation flow from API to database
    - Test double booking prevention across all layers
    - Test booking status updates through scheduler
    - Test room status transitions
    - _Requirements: 10.1, 10.5, 12.1, 14.3, 14.4_

  - [ ] 28.3 Write integration tests for revenue reporting
    - Test revenue calculation with real database queries
    - Test daily, monthly, yearly report generation
    - Test with various booking statuses and dates
    - _Requirements: 17.2, 17.3, 17.4_

  - [ ] 28.4 Set up frontend E2E tests
    - Install Cypress or Playwright
    - Configure E2E test environment
    - Set up test data seeding
    - _Requirements: Testing Strategy_

  - [ ] 28.5 Write E2E tests for critical user workflows
    - Test complete booking creation workflow: click cell → fill form → submit → verify grid update
    - Test booking details view workflow: click occupied cell → view details → close
    - Test room status update workflow: click cleaning cell → confirm → verify status change
    - Test revenue report generation workflow: select period → view report
    - Test responsive behavior at different screen sizes
    - _Requirements: Testing Strategy_

- [ ] 29. Performance optimization and final polish
  - [ ] 29.1 Optimize database queries
    - Review all queries for proper index usage
    - Add EXPLAIN ANALYZE to identify slow queries
    - Optimize JOIN queries in booking retrieval
    - Add database query caching where appropriate
    - _Requirements: 23.6_

  - [ ] 29.2 Optimize frontend performance
    - Implement lazy loading for feature modules
    - Use OnPush change detection strategy where possible
    - Optimize RxJS subscriptions (use takeUntil for cleanup)
    - Implement virtual scrolling for large lists
    - Optimize bundle size with tree shaking
    - _Requirements: 21.1_

  - [ ] 29.3 Add loading states and error handling
    - Add loading spinners to all async operations
    - Implement retry logic for failed API calls
    - Add user-friendly error messages in Thai
    - Test offline behavior and error scenarios
    - _Requirements: Error Handling section_

  - [ ] 29.4 Implement optimistic UI updates
    - Update room status immediately on booking creation (before API response)
    - Rollback on API failure
    - Show visual feedback for all user actions
    - _Requirements: Error Handling section_

  - [ ] 29.5 Final UI polish
    - Review all components for consistent styling
    - Verify all rounded corners, shadows, and colors match design
    - Test all animations and transitions
    - Verify Thai language labels throughout
    - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 30. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All property tests are tagged with feature name and property number
- Implementation follows layered architecture: Repository → Service → Controller → Frontend
- Database uses snake_case naming, code uses camelCase
- All user-facing text primarily in Thai with some English labels
- Backend uses Node.js/Express/TypeScript as specified in design document
- Frontend uses Angular with Material UI
- Checkpoints ensure incremental validation and user feedback
- Testing includes both unit tests and property-based tests for comprehensive coverage
- Optional tasks focus on testing; core implementation tasks are required

## Implementation Order

The tasks are ordered to build incrementally:
1. Database foundation (Tasks 1)
2. Backend infrastructure and core logic (Tasks 2-9)
3. Frontend foundation and layout (Tasks 10-11)
4. Shared components (Tasks 12)
5. Room Board feature (Tasks 13-18)
6. Room Price and Reports features (Tasks 19-20)
7. Multi-language and responsive design (Tasks 21-24)
8. Deployment configuration (Tasks 26-27)
9. Testing and optimization (Tasks 28-29)

Each phase builds on previous phases, ensuring working functionality at each checkpoint.
