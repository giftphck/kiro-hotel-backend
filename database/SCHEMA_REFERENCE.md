# Database Schema Reference

Quick reference guide for the Hotel Front Desk Management System database schema.

## Entity Relationship Diagram (Text Format)

```
┌─────────────────┐
│     ROOMS       │
│─────────────────│
│ room_id (PK)    │◄──────────┐
│ room_number     │            │
│ room_status     │            │ ON DELETE RESTRICT
│ room_type       │            │
│ created_at      │            │
│ updated_at      │            │
└─────────────────┘            │
        ▲                      │
        │ ON DELETE CASCADE    │
        │                      │
┌───────┴─────────┐      ┌─────┴───────────┐
│  ROOM_PRICES    │      │    BOOKINGS     │
│─────────────────│      │─────────────────│
│ price_id (PK)   │      │ booking_id (PK) │◄──────────┐
│ room_id (FK)    │      │ room_id (FK)    │            │
│ date            │      │ customer_id(FK) │            │
│ 3hr_price       │      │ booking_type    │            │ ON DELETE CASCADE
│ daily_price     │      │ check_in_date   │            │
│ monthly_price   │      │ check_out_date  │            │
│ created_at      │      │ num_of_guests   │            │
│ updated_at      │      │ deposit         │            │
└─────────────────┘      │ remark          │            │
                         │ booking_status  │            │
                         │ created_at      │            │
                         │ updated_at      │            │
                         └─────────────────┘            │
                                ▲                       │
                                │ ON DELETE RESTRICT    │
                                │                       │
                         ┌──────┴──────────┐      ┌─────┴───────┐
                         │   CUSTOMERS     │      │   GUESTS    │
                         │─────────────────│      │─────────────│
                         │ customer_id(PK) │      │ guest_id(PK)│
                         │ name            │      │ booking_id  │
                         │ phone_number    │      │ guest_name  │
                         │ thai_id_card    │      │ id_card_num │
                         │ created_at      │      │ created_at  │
                         │ updated_at      │      └─────────────┘
                         └─────────────────┘
```

## Tables

### 1. ROOMS

Stores hotel room information and current status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| room_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique room identifier |
| room_number | VARCHAR(10) | NOT NULL, UNIQUE | Room number (e.g., "101", "202") |
| room_status | VARCHAR(20) | NOT NULL, CHECK | Current status: AVAILABLE, OCCUPIED, RESERVED, CLEANING |
| room_type | VARCHAR(50) | | Room type (e.g., "Standard", "Deluxe", "Suite") |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_rooms_status` on room_status
- `idx_rooms_number` on room_number

---

### 2. CUSTOMERS

Stores customer contact and identification information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| customer_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique customer identifier |
| name | VARCHAR(255) | NOT NULL | Customer full name |
| phone_number | VARCHAR(20) | NOT NULL | Contact phone number |
| thai_id_card | VARCHAR(13) | NOT NULL, UNIQUE | Thai national ID card number |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_customers_phone` on phone_number
- `idx_customers_id_card` on thai_id_card

---

### 3. BOOKINGS

Stores booking records with dates, type, and status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| booking_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique booking identifier |
| room_id | UUID | NOT NULL, FOREIGN KEY → rooms(room_id) | Reference to booked room |
| customer_id | UUID | NOT NULL, FOREIGN KEY → customers(customer_id) | Reference to customer |
| booking_type | VARCHAR(20) | NOT NULL, CHECK | Type: 3_HOUR, DAILY, MONTHLY |
| check_in_date | DATE | NOT NULL | Check-in date |
| check_out_date | DATE | NOT NULL | Check-out date |
| number_of_guests | INTEGER | NOT NULL, CHECK > 0 | Number of guests |
| deposit | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Deposit amount |
| remark | TEXT | | Additional notes |
| booking_status | VARCHAR(20) | NOT NULL, CHECK | Status: ACTIVE, CHECKED_OUT, CANCELLED |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Constraints:**
- CHECK: check_out_date > check_in_date

**Indexes:**
- `idx_bookings_room` on room_id
- `idx_bookings_customer` on customer_id
- `idx_bookings_dates` on (check_in_date, check_out_date)
- `idx_bookings_status` on booking_status
- `idx_bookings_checkout_date` on check_out_date WHERE booking_status = 'ACTIVE'

**Foreign Keys:**
- room_id → rooms(room_id) ON DELETE RESTRICT
- customer_id → customers(customer_id) ON DELETE RESTRICT

---

### 4. GUESTS

Stores individual guest information for each booking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| guest_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique guest identifier |
| booking_id | UUID | NOT NULL, FOREIGN KEY → bookings(booking_id) | Reference to booking |
| guest_name | VARCHAR(255) | NOT NULL | Guest full name |
| id_card_number | VARCHAR(13) | NOT NULL | Guest ID card number |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes:**
- `idx_guests_booking` on booking_id

**Foreign Keys:**
- booking_id → bookings(booking_id) ON DELETE CASCADE

---

### 5. ROOM_PRICES

Stores date-specific pricing for rooms by booking type.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| price_id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique price record identifier |
| room_id | UUID | NOT NULL, FOREIGN KEY → rooms(room_id) | Reference to room |
| date | DATE | NOT NULL | Date for this pricing |
| three_hour_price | DECIMAL(10,2) | CHECK >= 0 | Price for 3-hour booking |
| daily_price | DECIMAL(10,2) | CHECK >= 0 | Price for daily booking |
| monthly_price | DECIMAL(10,2) | CHECK >= 0 | Price for monthly booking |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Constraints:**
- UNIQUE(room_id, date) - One price record per room per date

**Indexes:**
- `idx_room_prices_room_date` on (room_id, date)

**Foreign Keys:**
- room_id → rooms(room_id) ON DELETE CASCADE

---

## Enumerations

### Room Status
- `AVAILABLE` - Room is ready for booking
- `OCCUPIED` - Room is currently occupied by guests
- `RESERVED` - Room is reserved for future check-in
- `CLEANING` - Room is being cleaned after check-out

### Booking Type
- `3_HOUR` - Short-term 3-hour booking
- `DAILY` - Daily booking
- `MONTHLY` - Monthly booking

### Booking Status
- `ACTIVE` - Booking is active (reserved or currently occupied)
- `CHECKED_OUT` - Guest has checked out
- `CANCELLED` - Booking was cancelled

---

## Common Queries

### Get all available rooms
```sql
SELECT * FROM rooms WHERE room_status = 'AVAILABLE' ORDER BY room_number;
```

### Get today's check-ins
```sql
SELECT b.*, r.room_number, c.name as customer_name
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
JOIN customers c ON b.customer_id = c.customer_id
WHERE b.check_in_date = CURRENT_DATE 
  AND b.booking_status = 'ACTIVE'
ORDER BY r.room_number;
```

### Get today's check-outs
```sql
SELECT b.*, r.room_number, c.name as customer_name
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
JOIN customers c ON b.customer_id = c.customer_id
WHERE b.check_out_date = CURRENT_DATE 
  AND b.booking_status = 'ACTIVE'
ORDER BY r.room_number;
```

### Check for overlapping bookings
```sql
SELECT * FROM bookings
WHERE room_id = $1
  AND booking_status = 'ACTIVE'
  AND check_in_date < $3  -- new check_out_date
  AND check_out_date > $2  -- new check_in_date
```

### Get room price for specific date
```sql
SELECT * FROM room_prices
WHERE room_id = $1 AND date = $2;
```

### Calculate daily revenue
```sql
SELECT 
  SUM(deposit) as total_revenue,
  COUNT(DISTINCT room_id) as rooms_sold,
  COUNT(*) as booking_count
FROM bookings
WHERE booking_status = 'CHECKED_OUT'
  AND check_out_date = $1;
```

---

## Data Integrity Rules

1. **Room Deletion**: Cannot delete a room if it has active bookings (RESTRICT)
2. **Customer Deletion**: Cannot delete a customer if they have bookings (RESTRICT)
3. **Booking Deletion**: Automatically deletes associated guests (CASCADE)
4. **Room Deletion**: Automatically deletes associated prices (CASCADE)
5. **Date Validation**: Check-out date must be after check-in date
6. **Positive Values**: Number of guests, deposit, and prices must be >= 0
7. **Unique Constraints**: Room numbers, Thai ID cards, and room-date price combinations must be unique

---

## Performance Considerations

- All foreign key columns are indexed for fast joins
- Composite index on (check_in_date, check_out_date) for date range queries
- Partial index on check_out_date for active bookings (scheduler queries)
- Room status and booking status are indexed for filtering

---

## Maintenance

### Update timestamps
Consider adding triggers to automatically update `updated_at` fields:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables with updated_at column
```

### Archiving old bookings
Consider archiving checked-out bookings older than 1 year to maintain performance.
