# Booking Rules and Business Logic

## Double Booking Prevention

### Overlap Check Rules

**Status Filter**: Check overlapping bookings only against bookings with `status = 'ACTIVE'`
- ACTIVE bookings block new bookings
- CHECKED_OUT bookings do not block (room is available after checkout)
- CANCELLED bookings do not block (room is available)

**Overlap Detection Logic**:
Two bookings overlap if their time ranges intersect. Use this SQL condition:

```sql
(existing.check_in_date < new.check_out_date) 
AND (existing.check_out_date > new.check_in_date) 
AND booking_status = 'ACTIVE'
```

**Examples**:

✅ **Allowed - No Overlap**:
- Existing: 10:00 - 13:00
- New: 13:00 - 16:00
- Result: Allowed (no overlap, back-to-back is OK)

❌ **Blocked - Overlap**:
- Existing: 10:00 - 14:00
- New: 12:00 - 15:00
- Result: Blocked (overlaps from 12:00 to 14:00)

✅ **Allowed - Different Status**:
- Existing: 10:00 - 14:00 (CHECKED_OUT)
- New: 11:00 - 15:00
- Result: Allowed (existing booking is not ACTIVE)

## Transaction Handling

### Race Condition Prevention

**Requirement**: Booking creation must run inside a database transaction with row-level locking.

**Implementation**:
```typescript
// Start transaction
const client = await pool.connect();
await client.query('BEGIN');

try {
  // Lock the room's bookings for this time period
  const lockQuery = `
    SELECT * FROM bookings 
    WHERE room_id = $1 
      AND booking_status = 'ACTIVE'
      AND check_in_date < $3
      AND check_out_date > $2
    FOR UPDATE
  `;
  
  const overlapping = await client.query(lockQuery, [roomId, checkInDate, checkOutDate]);
  
  if (overlapping.rows.length > 0) {
    throw new Error('Room is already booked for the selected period');
  }
  
  // Create booking
  // Create customer if needed
  // Create guests
  // Update room status
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

**Why `SELECT ... FOR UPDATE`?**
- Locks the selected rows until the transaction completes
- Prevents other transactions from reading or modifying the same rows
- Ensures no race condition when multiple users book simultaneously

## Timestamp Precision

**Rule**: Use exact timestamp comparison since the system supports hourly bookings (3-hour, daily, monthly).

**Database Type**: `TIMESTAMP` (not DATE)
- Stores: `2024-01-15 14:00:00`
- Precision: Down to the second
- Comparison: Exact timestamp matching

**Example**:
- Booking A: `2024-01-15 10:00:00` to `2024-01-15 13:00:00`
- Booking B: `2024-01-15 13:00:00` to `2024-01-15 16:00:00`
- Result: No overlap (13:00:00 is not < 13:00:00)

## Grace Period

**Rule**: No grace period is required between bookings.

**Rationale**:
- A new booking can start exactly when the previous booking ends
- The frontend/admin can manually add buffer time if needed for cleaning
- System does not enforce automatic gaps

**Example**:
```
Booking A: 10:00 - 13:00
Booking B: 13:00 - 16:00
Result: ✅ Allowed (no overlap)
```

## Room Availability Query

**Function**: Check if a room is available for a given time range before creating a booking.

**API Endpoint**: `GET /api/rooms/:roomId/availability?checkIn=...&checkOut=...`

**Logic**:
```sql
SELECT COUNT(*) FROM bookings
WHERE room_id = $1
  AND booking_status = 'ACTIVE'
  AND check_in_date < $3
  AND check_out_date > $2
```

**Response**:
- `available: true` - No overlapping ACTIVE bookings
- `available: false` - Room is already booked for this period
- `conflictingBookings: []` - List of conflicting booking IDs (optional)

## Booking Status Transitions

```
ACTIVE → CHECKED_OUT (via automated scheduler or manual checkout)
ACTIVE → CANCELLED (via admin cancellation)
```

**Rules**:
- Only ACTIVE bookings block new bookings
- CHECKED_OUT and CANCELLED bookings do not affect availability
- Once CHECKED_OUT or CANCELLED, status cannot be changed back to ACTIVE

## Room Status Updates

When a booking is created:
- If `check_in_date` is in the future → Room status = `RESERVED`
- If `check_in_date` is today or past → Room status = `OCCUPIED`

When a booking is checked out:
- Room status = `CLEANING`

When cleaning is complete:
- Room status = `AVAILABLE`

## Error Messages

**Double Booking**:
```json
{
  "error": {
    "code": "DOUBLE_BOOKING",
    "message": "ห้องถูกจองไปแล้วในช่วงเวลาที่เลือก",
    "message_en": "Room is already booked for the selected period",
    "details": {
      "roomId": "uuid",
      "requestedCheckIn": "2024-01-15T10:00:00Z",
      "requestedCheckOut": "2024-01-15T14:00:00Z",
      "conflictingBookingId": "uuid"
    }
  }
}
```

**Invalid Date Range**:
```json
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "วันที่เช็คเอาท์ต้องมาหลังวันที่เช็คอิน",
    "message_en": "Check-out date must be after check-in date"
  }
}
```

## Implementation Checklist

- [ ] Implement overlap detection in booking repository
- [ ] Implement transaction with row-level locking in booking service
- [ ] Implement room availability check endpoint
- [ ] Add proper error handling for double booking
- [ ] Write property-based tests for overlap detection
- [ ] Write integration tests for concurrent booking attempts
- [ ] Document API endpoints with examples
