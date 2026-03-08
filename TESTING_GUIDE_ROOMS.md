# 🧪 Rooms Management Feature - Testing Guide

## เตรียมการทดสอบ

### 1. เตรียมฐานข้อมูล

ก่อนทดสอบ ต้องมีข้อมูลห้องพักในฐานข้อมูล:

```bash
# เชื่อมต่อกับ Supabase และรัน seed script
psql "your-supabase-connection-string" -f database/seed_rooms_test_data.sql
```

หรือใช้ Supabase SQL Editor:
1. เปิด Supabase Dashboard
2. ไปที่ SQL Editor
3. Copy-paste เนื้อหาจากไฟล์ `database/seed_rooms_test_data.sql`
4. กด Run

ข้อมูลทดสอบที่จะถูกเพิ่ม:
- ห้อง 101-105 (ชั้น 1)
- ห้อง 201-205 (ชั้น 2)
- สถานะต่างๆ: ว่าง, มีผู้เข้าพัก, จอง, ทำความสะอาด
- ประเภทห้อง: Standard, Deluxe, Suite

### 2. ตรวจสอบ Backend Configuration

ตรวจสอบไฟล์ `backend/.env`:
```env
DATABASE_URL=your-supabase-connection-string
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

### 3. ตรวจสอบ Frontend Configuration

ตรวจสอบไฟล์ `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

## 🚀 เริ่มการทดสอบ

### Step 1: เริ่ม Backend Server

```bash
cd backend
npm run dev
```

**ผลลัพธ์ที่คาดหวัง:**
```
[nodemon] starting `ts-node src/server.ts`
Database connected successfully
Server is running on port 3000
```

**ทดสอบ Backend API:**
```bash
# ทดสอบ health check
curl http://localhost:3000/api/health

# ทดสอบ GET rooms
curl http://localhost:3000/api/rooms
```

### Step 2: เริ่ม Frontend Server

เปิด terminal ใหม่:
```bash
cd frontend
npm start
```

**ผลลัพธ์ที่คาดหวัง:**
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Browser application bundle generation complete.
```

### Step 3: เปิดเบราว์เซอร์

เปิด: **http://localhost:4200/**

---

## ✅ Test Cases

### Test Case 1: ดูรายการห้องพัก
**วิธีทดสอบ:**
1. เปิดหน้า Rooms Management
2. ตรวจสอบว่าแสดงรายการห้องพักทั้งหมด

**ผลลัพธ์ที่คาดหวัง:**
- ✅ แสดงตารางห้องพักพร้อมข้อมูล
- ✅ แสดงหมายเลขห้อง (101, 102, 103, ...)
- ✅ แสดงประเภทห้อง (Standard, Deluxe, Suite)
- ✅ แสดงสถานะห้องพักด้วยสีที่ถูกต้อง:
  - ว่าง = สีเขียว
  - มีผู้เข้าพัก = สีแดง
  - จอง = สีส้ม/เหลือง
  - ทำความสะอาด = สีฟ้า

### Test Case 2: เปลี่ยนสถานะห้องพัก
**วิธีทดสอบ:**
1. เลือกห้องที่มีสถานะ "ว่าง"
2. คลิกที่ dropdown สถานะ
3. เลือก "ทำความสะอาด"

**ผลลัพธ์ที่คาดหวัง:**
- ✅ สถานะห้องเปลี่ยนเป็น "ทำความสะอาด"
- ✅ สีของ badge เปลี่ยนเป็นสีฟ้า
- ✅ แสดง toast notification "อัพเดทสถานะห้องพักสำเร็จ" (สีเขียว)
- ✅ Toast หายไปหลัง 3 วินาที

### Test Case 3: เปลี่ยนสถานะหลายห้อง
**วิธีทดสอบ:**
1. เปลี่ยนสถานะห้อง 101 เป็น "มีผู้เข้าพัก"
2. เปลี่ยนสถานะห้อง 102 เป็น "ว่าง"
3. เปลี่ยนสถานะห้อง 103 เป็น "ทำความสะอาด"

**ผลลัพธ์ที่คาดหวัง:**
- ✅ ทุกห้องอัพเดทสถานะสำเร็จ
- ✅ แสดง toast notification ทุกครั้งที่อัพเดท
- ✅ สีของ badge เปลี่ยนตามสถานะใหม่

### Test Case 4: ทดสอบ Loading State
**วิธีทดสอบ:**
1. Refresh หน้าเว็บ (F5)
2. สังเกต loading spinner

**ผลลัพธ์ที่คาดหวัง:**
- ✅ แสดง loading spinner ขณะโหลดข้อมูล
- ✅ Loading spinner หายไปเมื่อโหลดเสร็จ
- ✅ แสดงข้อมูลห้องพักทั้งหมด

### Test Case 5: ทดสอบ Error Handling (Backend ปิด)
**วิธีทดสอบ:**
1. ปิด backend server (Ctrl+C)
2. Refresh หน้าเว็บ (F5)

**ผลลัพธ์ที่คาดหวัง:**
- ✅ แสดง error alert "ไม่สามารถโหลดข้อมูลห้องพักได้"
- ✅ Alert มีสีแดง
- ✅ มีปุ่ม X สำหรับปิด alert

### Test Case 6: ทดสอบ Responsive Design
**วิธีทดสอบ:**
1. เปิด Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. ทดสอบหลายขนาดหน้าจอ:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**ผลลัพธ์ที่คาดหวัง:**
- ✅ ตารางแสดงผลได้ดีในทุกขนาดหน้าจอ
- ✅ ปุ่มและ dropdown ใช้งานได้บนมือถือ
- ✅ Navigation bar ปรับตัวตามขนาดหน้าจอ

### Test Case 7: ทดสอบ Modal (Placeholder)
**วิธีทดสอบ:**
1. คลิกปุ่ม "เพิ่มห้องใหม่"
2. คลิกปุ่ม "แก้ไข" ที่ห้องใดห้องหนึ่ง
3. คลิกปุ่ม "ลบ" ที่ห้องใดห้องหนึ่ง

**ผลลัพธ์ที่คาดหวัง:**
- ✅ Modal เปิดขึ้นมา
- ✅ แสดงข้อความ "ฟีเจอร์นี้จะพร้อมใช้งานในเร็วๆ นี้"
- ✅ คลิกปุ่ม "ปิด" หรือ "ยกเลิก" เพื่อปิด modal
- ✅ คลิกพื้นหลังมืด (backdrop) เพื่อปิด modal

---

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### ปัญหา 1: Backend ไม่สามารถเชื่อมต่อฐานข้อมูล
**อาการ:**
```
Database connection attempt 1 failed: ECONNREFUSED
```

**วิธีแก้:**
1. ตรวจสอบ `backend/.env` ว่ามี `DATABASE_URL` ถูกต้อง
2. ตรวจสอบว่า Supabase project ยังทำงานอยู่
3. ตรวจสอบ internet connection

### ปัญหา 2: Frontend ไม่สามารถเรียก API
**อาการ:**
- Console แสดง CORS error
- หรือ Network error

**วิธีแก้:**
1. ตรวจสอบว่า backend รันอยู่ที่ port 3000
2. ตรวจสอบ `backend/.env` ว่ามี `CORS_ORIGIN=http://localhost:4200`
3. ตรวจสอบ `frontend/src/environments/environment.ts` ว่า `apiUrl` ถูกต้อง

### ปัญหา 3: ไม่มีข้อมูลห้องพักแสดง
**อาการ:**
- ตารางว่างเปล่า
- แสดงข้อความ "ไม่มีข้อมูลห้องพัก"

**วิธีแก้:**
1. รัน seed script: `database/seed_rooms_test_data.sql`
2. ตรวจสอบว่าข้อมูลถูกเพิ่มในฐานข้อมูล:
   ```sql
   SELECT * FROM rooms;
   ```

### ปัญหา 4: Toast notification ไม่แสดง
**อาการ:**
- อัพเดทสถานะสำเร็จแต่ไม่มี toast

**วิธีแก้:**
1. เปิด Console (F12) ดู error
2. ตรวจสอบว่า Bootstrap JS ถูก load:
   ```javascript
   // ใน Console
   typeof bootstrap !== 'undefined'
   ```

---

## 📊 Checklist สำหรับการทดสอบ

### Backend
- [ ] Backend server รันได้ที่ port 3000
- [ ] เชื่อมต่อฐานข้อมูลสำเร็จ
- [ ] GET /api/rooms ส่งข้อมูลกลับมา
- [ ] PUT /api/rooms/:id/status อัพเดทสถานะได้

### Frontend
- [ ] Frontend server รันได้ที่ port 4200
- [ ] แสดงรายการห้องพักทั้งหมด
- [ ] เปลี่ยนสถานะห้องพักได้
- [ ] แสดง toast notification
- [ ] Loading state ทำงานถูกต้อง
- [ ] Error handling ทำงานถูกต้อง
- [ ] Responsive design ทำงานดีในทุกขนาดหน้าจอ
- [ ] Modal เปิด-ปิดได้ถูกต้อง

### UI/UX
- [ ] สีของ status badge ถูกต้อง
- [ ] ปุ่มทั้งหมดทำงานได้
- [ ] Dropdown ทำงานได้
- [ ] Thai language แสดงผลถูกต้อง
- [ ] ไม่มี console error

---

## 📸 Screenshots ที่ควรถ่าย

เมื่อทดสอบเสร็จ ควรถ่ายภาพหน้าจอเหล่านี้:
1. หน้ารายการห้องพักทั้งหมด
2. Toast notification เมื่ออัพเดทสถานะสำเร็จ
3. Modal เพิ่มห้องใหม่
4. Modal แก้ไขห้อง
5. Modal ยืนยันการลบ
6. Error alert เมื่อ backend ปิด
7. Loading spinner
8. Responsive view บนมือถือ

---

## ✅ เมื่อทดสอบเสร็จ

หลังจากทดสอบทุก test case แล้ว:

1. **บันทึกผลการทดสอบ** - ระบุว่า test case ไหนผ่าน/ไม่ผ่าน
2. **รายงานปัญหา** (ถ้ามี) - ระบุรายละเอียดและวิธีทำซ้ำ
3. **ยืนยันว่าพร้อมไปต่อ** - ถ้าทุกอย่างทำงานได้ดี

จากนั้นเราจะไปทำ **Feature 2: Customers Management** ต่อครับ!

---

## 🎯 Expected Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| List Rooms | ✅ Working | Shows all rooms from database |
| Update Status | ✅ Working | Changes room status via dropdown |
| Toast Notifications | ✅ Working | Shows success/error messages |
| Loading State | ✅ Working | Spinner while loading data |
| Error Handling | ✅ Working | Shows error alert when API fails |
| Responsive Design | ✅ Working | Works on all screen sizes |
| Add Room | 🚧 Placeholder | Modal UI ready, form not implemented |
| Edit Room | 🚧 Placeholder | Modal UI ready, form not implemented |
| Delete Room | 🚧 Placeholder | Modal UI ready, delete not implemented |

**Legend:**
- ✅ Working = Fully functional
- 🚧 Placeholder = UI ready but not connected to backend
