# 🔧 แก้ไขปัญหา Database Schema

## ปัญหาที่พบ

```
Error: column "room_id" does not exist
```

ปัญหานี้เกิดจาก:
1. ตาราง `rooms` ยังไม่ถูกสร้างในฐานข้อมูล Supabase
2. หรือ migration script ยังไม่ถูกรัน

## วิธีแก้ไข

### ขั้นตอนที่ 1: เข้า Supabase SQL Editor

1. เปิด [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (เมนูด้านซ้าย)

### ขั้นตอนที่ 2: รัน Verification Script

Copy script นี้และรันใน SQL Editor:

```sql
-- Verify and Fix Database Schema
-- Run this script to check if tables exist and create them if needed

-- Check if rooms table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rooms') THEN
        RAISE NOTICE 'Table "rooms" does not exist. Creating it now...';
        
        -- Create rooms table
        CREATE TABLE rooms (
          room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_number VARCHAR(10) NOT NULL UNIQUE,
          room_status VARCHAR(20) NOT NULL CHECK (room_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
          room_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Table "rooms" created successfully!';
    ELSE
        RAISE NOTICE 'Table "rooms" already exists.';
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'rooms'
ORDER BY ordinal_position;

-- Check if there's any data
SELECT COUNT(*) as room_count FROM rooms;

-- If no data, insert sample rooms
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM rooms) = 0 THEN
        RAISE NOTICE 'No rooms found. Inserting sample data...';
        
        INSERT INTO rooms (room_number, room_status, room_type) VALUES
          ('101', 'AVAILABLE', 'Standard'),
          ('102', 'OCCUPIED', 'Standard'),
          ('103', 'RESERVED', 'Deluxe'),
          ('104', 'CLEANING', 'Standard'),
          ('105', 'AVAILABLE', 'Deluxe'),
          ('201', 'AVAILABLE', 'Suite'),
          ('202', 'OCCUPIED', 'Suite'),
          ('203', 'AVAILABLE', 'Standard'),
          ('204', 'RESERVED', 'Deluxe'),
          ('205', 'AVAILABLE', 'Standard');
        
        RAISE NOTICE 'Sample data inserted successfully!';
    ELSE
        RAISE NOTICE 'Rooms table already has data.';
    END IF;
END $$;

-- Show all rooms
SELECT 
    room_number as "Room Number",
    room_status as "Status",
    room_type as "Type",
    created_at as "Created At"
FROM rooms
ORDER BY room_number;
```

หรือใช้ไฟล์: `database/verify_and_fix_schema.sql`

### ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์

หลังจากรัน script คุณควรเห็น:

1. **ถ้าตารางยังไม่มี:**
   ```
   NOTICE: Table "rooms" does not exist. Creating it now...
   NOTICE: Table "rooms" created successfully!
   NOTICE: No rooms found. Inserting sample data...
   NOTICE: Sample data inserted successfully!
   ```

2. **ถ้าตารางมีอยู่แล้ว:**
   ```
   NOTICE: Table "rooms" already exists.
   NOTICE: Rooms table already has data.
   ```

3. **ตารางแสดงข้อมูลห้องพัก:**
   ```
   Room Number | Status    | Type     | Created At
   -----------|-----------|----------|------------------
   101        | AVAILABLE | Standard | 2026-03-07 ...
   102        | OCCUPIED  | Standard | 2026-03-07 ...
   ...
   ```

### ขั้นตอนที่ 4: Restart Backend Server

หลังจากแก้ไขฐานข้อมูลแล้ว:

```bash
# กด Ctrl+C เพื่อหยุด backend
# จากนั้นเริ่มใหม่
cd backend
npm run dev
```

### ขั้นตอนที่ 5: ทดสอบอีกครั้ง

1. Refresh หน้าเว็บ: http://localhost:4200/
2. ควรเห็นรายการห้องพักแสดงขึ้นมา

---

## ทางเลือกอื่น: รัน Migration Script ทั้งหมด

ถ้าคุณต้องการสร้างตารางทั้งหมดพร้อมกัน:

### 1. รัน Migration Script หลัก

ใน Supabase SQL Editor รัน:

```sql
-- จากไฟล์ database/migrations/001_create_schema.sql
-- Copy-paste เนื้อหาทั้งหมดจากไฟล์นั้น
```

### 2. รัน Index Script

```sql
-- จากไฟล์ database/migrations/002_create_indexes.sql
```

### 3. รัน Foreign Key Script

```sql
-- จากไฟล์ database/migrations/003_create_foreign_keys.sql
```

### 4. รัน Seed Data

```sql
-- จากไฟล์ database/seed_rooms_test_data.sql
```

---

## ตรวจสอบว่าแก้ไขสำเร็จ

### ทดสอบด้วย SQL Query

```sql
-- ตรวจสอบว่าตารางมีอยู่
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rooms';

-- ตรวจสอบ structure
\d rooms

-- ตรวจสอบข้อมูล
SELECT * FROM rooms;
```

### ทดสอบด้วย Backend API

```bash
# ทดสอบ GET rooms
curl http://localhost:3000/api/rooms
```

ควรได้ response:
```json
[
  {
    "roomId": "...",
    "roomNumber": "101",
    "roomStatus": "AVAILABLE",
    "roomType": "Standard",
    "createdAt": "...",
    "updatedAt": "..."
  },
  ...
]
```

---

## ถ้ายังมีปัญหา

### ตรวจสอบ Connection String

ใน `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres
```

### ตรวจสอบว่าเชื่อมต่อได้

```bash
# ใน backend terminal
npm run dev
```

ควรเห็น:
```
Database connected successfully
Server is running on port 3000
```

### ตรวจสอบ Console Log

เปิด browser console (F12) และดู Network tab:
- Request ไป `/api/rooms` ควรได้ status 200
- Response ควรเป็น array ของห้องพัก

---

## สรุป

ปัญหาเกิดจากตาราง `rooms` ยังไม่ถูกสร้างในฐานข้อมูล Supabase

**วิธีแก้:**
1. รัน `database/verify_and_fix_schema.sql` ใน Supabase SQL Editor
2. Restart backend server
3. Refresh หน้าเว็บ

หลังจากนี้ระบบควรทำงานได้ปกติ! 🎉
