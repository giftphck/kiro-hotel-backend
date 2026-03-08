# Requirements Document

## Introduction

ระบบ Hotel Front Desk Management System เป็นระบบจัดการแผนกต้อนรับของโรงแรมสำหรับผู้ดูแลระบบ (Admin) ใช้ภายในโรงแรมเท่านั้น ระบบช่วยจัดการห้องพัก การจอง การเช็คอิน-เช็คเอาท์ ราคาห้อง และรายงานทางการเงิน

## Glossary

- **System**: Hotel Front Desk Management System
- **Admin**: ผู้ดูแลระบบที่ทำงานที่แผนกต้อนรับโรงแรม
- **Room**: ห้องพักในโรงแรม
- **Booking**: การจองห้องพักที่มีข้อมูลลูกค้า วันที่เข้าพัก-ออก และรายละเอียดการจอง
- **Guest**: ผู้เข้าพักที่อยู่ใน Booking หนึ่งๆ สามารถมีได้หลายคน
- **Customer**: ลูกค้าที่ทำการจอง
- **Room_Board**: หน้าจอแสดงสถานะห้องทั้งหมดในรูปแบบ Grid
- **Room_Status**: สถานะของห้อง ได้แก่ AVAILABLE, OCCUPIED, RESERVED, CLEANING
- **Booking_Status**: สถานะของการจอง ได้แก่ ACTIVE, CHECKED_OUT, CANCELLED
- **Booking_Type**: ประเภทการจอง ได้แก่ 3_HOUR, DAILY, MONTHLY
- **Check_In_Date**: วันที่เริ่มเข้าพัก
- **Check_Out_Date**: วันที่ออกจากห้องพัก
- **Standard_Checkout_Time**: เวลาเช็คเอาท์มาตรฐาน คือ 12:00 น.
- **Room_Price**: ราคาห้องพักตามวันที่และประเภทการจอง
- **Revenue_Report**: รายงานรายได้ของโรงแรม
- **Scheduler**: กระบวนการอัตโนมัติที่ทำงานตามเวลาที่กำหนด
- **Double_Booking**: การจองห้องเดียวกันซ้อนกันในช่วงเวลาเดียวกัน
- **Sidebar**: แถบเมนูด้านซ้ายของหน้าจอที่แสดงเมนูหลักและข้อมูล Admin
- **Top_Bar**: แถบด้านบนของหน้าจอที่แสดง navigation links และ user profile
- **Modal_Dialog**: หน้าต่างป๊อปอัพที่แสดงข้อมูลหรือฟอร์มทับหน้าจอหลัก
- **Date_Picker**: คอมโพเนนต์สำหรับเลือกวันที่จากปฏิทิน
- **Date_Range_Picker**: คอมโพเนนต์สำหรับเลือกช่วงวันที่ (วันเริ่มต้นและวันสิ้นสุด)
- **Notification_Icon**: ไอคอนแสดงการแจ้งเตือนต่างๆ
- **Room_Cell**: ช่องในตาราง Room_Board ที่แสดงสถานะของห้องในวันหนึ่งๆ
- **Status_Color**: สีที่ใช้แสดงสถานะห้อง (เขียว=AVAILABLE, แดง/ส้ม=OCCUPIED, เหลือง=RESERVED/CLEANING)
- **Check_In_Time**: เวลาเช็คอินมาตรฐาน คือ 14:00 น.
- **Check_Out_Time**: เวลาเช็คเอาท์มาตรฐาน คือ 12:00 น.
- **Today_Section**: พื้นที่แสดงรายการห้องที่มีกิจกรรมในวันนี้ (check-in หรือ check-out)
- **Room_Icon**: ไอคอนที่แสดงในช่องห้องเพื่อระบุประเภทการจองหรือสถานะพิเศษ
- **Frontend**: ส่วนของระบบที่แสดงผลและรับข้อมูลจากผู้ใช้ ใช้ Angular framework
- **Backend**: ส่วนของระบบที่ประมวลผลและจัดการข้อมูล ใช้ Node.js และ Express.js
- **REST_API**: Application Programming Interface ที่ใช้ HTTP methods สำหรับการสื่อสารระหว่าง Frontend และ Backend
- **Database**: ฐานข้อมูล PostgreSQL ที่เก็บข้อมูลทั้งหมดของระบบ
- **Angular**: JavaScript framework สำหรับสร้าง Single Page Application
- **Angular_Material**: UI component library สำหรับ Angular
- **External_Cron_Service**: บริการภายนอกที่เรียก API endpoint เพื่อทริกเกอร์งานอัตโนมัติตามเวลาที่กำหนด (เช่น cron-job.org)
- **Express_js**: Web application framework สำหรับ Node.js
- **PostgreSQL**: Relational database management system
- **Vercel**: Platform สำหรับ deploy Frontend application (Free tier)
- **Render**: Platform สำหรับ deploy Backend application (Free tier)
- **Supabase**: Platform สำหรับ host PostgreSQL database (Free tier)
- **SPA**: Single Page Application ที่โหลดหน้าเดียวและอัปเดตเนื้อหาแบบ dynamic
- **HTTP_Methods**: GET, POST, PUT, DELETE methods ที่ใช้ใน REST API
- **API_Endpoint**: URL path ที่ Backend เปิดให้ Frontend เรียกใช้งาน

## Requirements

### Requirement 1: Sidebar Navigation

**User Story:** ในฐานะ Admin ฉันต้องการ Sidebar ที่แสดงเมนูหลักและข้อมูลของฉัน เพื่อให้สามารถนำทางไปยังหน้าต่างๆ ได้สะดวก

#### Acceptance Criteria

1. THE System SHALL display the Sidebar on the left side of the screen with light blue gradient background
2. THE System SHALL display the hotel logo at the top of the Sidebar
3. THE System SHALL include menu items in the Sidebar: Dashboard, Room Board, Room Price, Reports, Settings
4. THE System SHALL highlight the currently active menu item in the Sidebar
5. THE System SHALL display Admin profile information at the bottom of the Sidebar including name and avatar
6. THE System SHALL display a Logout button in the Admin profile section
7. THE System SHALL apply soft shadow effect to the Sidebar
8. THE System SHALL apply rounded corners to all Sidebar elements

### Requirement 2: Top Bar Navigation

**User Story:** ในฐานะ Admin ฉันต้องการ Top Bar ที่แสดง quick links และข้อมูลผู้ใช้ เพื่อให้เข้าถึงฟังก์ชันสำคัญได้รวดเร็ว

#### Acceptance Criteria

1. THE System SHALL display the Top_Bar at the top of the screen
2. THE System SHALL display a blue "จองห้องพัก" (Bookings) button in the Top_Bar on the right side
3. THE System SHALL display a "รายงาน" (Reports) link in the Top_Bar
4. THE System SHALL display a Settings icon (gear/cog) in the Top_Bar
5. THE System SHALL display the Notification_Icon (bell) in the Top_Bar
6. THE System SHALL display the user profile avatar with dropdown menu in the Top_Bar
7. WHEN Admin clicks the "จองห้องพัก" button, THE System SHALL display the Add Booking Modal_Dialog
8. WHEN Admin clicks the Notification_Icon, THE System SHALL display a list of notifications
9. WHEN Admin clicks the user profile avatar, THE System SHALL display a dropdown menu with user options
10. THE System SHALL apply blue background color to the "จองห้องพัก" button with white text

### Requirement 3: Design System and Visual Style

**User Story:** ในฐานะ Admin ฉันต้องการ UI ที่มีสไตล์สวยงามและสอดคล้องกัน เพื่อให้ใช้งานได้อย่างสบายตา

#### Acceptance Criteria

1. THE System SHALL render the user interface using Angular framework
2. THE System SHALL use Angular Material as the UI component library
3. THE System SHALL apply minimal and clean design style to all UI components
4. THE System SHALL use soft, friendly colors throughout the interface: light blue, green, orange, yellow
5. THE System SHALL render all cards with 3D visual effects using soft shadows
6. THE System SHALL apply rounded corners to all UI components including buttons, cards, modals, and input fields
7. THE System SHALL use soft gradient backgrounds where appropriate
8. THE System SHALL maintain consistent spacing and padding across all components

### Requirement 4: Room Board Grid Layout

**User Story:** ในฐานะ Admin ฉันต้องการเห็นภาพรวมของห้องทั้งหมดในรูปแบบตาราง เพื่อให้ทราบสถานะห้องในแต่ละวันได้อย่างชัดเจน

#### Acceptance Criteria

1. THE System SHALL display the Room_Board in a grid layout where rows represent rooms and columns represent dates
2. THE System SHALL display the page title "ห้องพัก" (Room Board) at the top of the main content area
3. THE System SHALL display a Date_Range_Picker component showing start date and end date
4. THE System SHALL display a blue "ค้นหา" (Search) button next to the Date_Range_Picker
5. WHEN Admin selects a date range using the Date_Range_Picker, THE System SHALL update the grid to show dates within the selected range
6. THE System SHALL display at least 7 consecutive dates as columns in the grid by default
7. THE System SHALL display room numbers in the leftmost column of the grid (e.g., "ห้อง 101", "ห้อง 102")
8. THE System SHALL render each Room_Cell with rounded corners and appropriate Status_Color
9. THE System SHALL apply white background to the main content area
10. THE System SHALL apply soft shadow effects to the grid container
11. THE System SHALL display date headers in Thai format (e.g., "8 เมษ.", "9 เมษ.", "10 เมษ.")

### Requirement 5: Room Status Color Scheme and Labels

**User Story:** ในฐานะ Admin ฉันต้องการเห็นสีและข้อความภาษาไทยที่แตกต่างกันสำหรับแต่ละสถานะห้อง เพื่อให้สามารถแยกแยะสถานะได้ทันที

#### Acceptance Criteria

1. WHEN Room_Status is AVAILABLE, THE System SHALL display the Room_Cell with green color (#81C784 or similar pastel green) and text "ว่าง"
2. WHEN Room_Status is OCCUPIED, THE System SHALL display the Room_Cell with red-orange color (#E57373 or similar pastel red-orange) and text "เข้าพัก"
3. WHEN Room_Status is RESERVED, THE System SHALL display the Room_Cell with yellow-orange color (#FFB74D or similar) and text "จองแล้ว"
4. WHEN Room_Status is CLEANING, THE System SHALL display the Room_Cell with yellow color (#FFD54F or similar pastel yellow), text "Cleaning", and include a cleaning icon
5. THE System SHALL use blue accent color (#64B5F6 or similar) for buttons and active states
6. THE System SHALL use light blue background (#E3F2FD or similar) for the Sidebar
7. THE System SHALL maintain consistent color usage across all UI components
8. THE System SHALL support both Thai and English labels for room statuses

### Requirement 6: Room Cell Content Display

**User Story:** ในฐานะ Admin ฉันต้องการเห็นข้อมูลสำคัญในแต่ละช่องของตาราง เพื่อให้ทราบรายละเอียดการจองได้โดยไม่ต้องคลิก

#### Acceptance Criteria

1. WHEN a Room_Cell represents an AVAILABLE room, THE System SHALL display the status text "ว่าง" or "Available" with Status_Color
2. WHEN a Room_Cell represents an OCCUPIED or RESERVED room, THE System SHALL display guest name inside the cell
3. WHEN a Room_Cell represents a CLEANING room, THE System SHALL display the text "Cleaning" and a cleaning icon inside the cell
4. WHEN a Room_Cell contains a booking, THE System SHALL display appropriate Room_Icon (person icon, bed icon, etc.) to indicate booking type or occupancy
5. THE System SHALL apply white text color to text displayed on colored Room_Cell backgrounds
6. THE System SHALL center-align content within each Room_Cell
7. THE System SHALL apply consistent padding to all Room_Cell content
8. THE System SHALL display icons in blue color (#64B5F6) when shown on light backgrounds

### Requirement 6.1: Check-Out Today Section

**User Story:** ในฐานะ Admin ฉันต้องการเห็นรายการห้องที่ต้อง check-out วันนี้ เพื่อให้สามารถเตรียมการรับห้องและทำความสะอาดได้ทันเวลา

#### Acceptance Criteria

1. THE System SHALL display a "Check-out วันนี้" (Check-out Today) section on the left side of the Room_Board page
2. THE System SHALL position the Check-out Today section above the Check-in Today section
3. THE System SHALL query all Bookings where Check_Out_Date equals the current date AND Booking_Status equals ACTIVE
4. THE System SHALL display each qualifying room as a card showing room number, guest name, and check-out time
5. THE System SHALL display Check_Out_Time (12:00) with a clock icon next to each room entry
6. THE System SHALL render the section as a white card with rounded corners and soft shadow
7. THE System SHALL update the section automatically when bookings change
8. THE System SHALL display room numbers in the format "ห้อง XXX" (e.g., "ห้อง 101", "ห้อง 204")
9. WHEN there are no check-outs today, THE System SHALL display an empty state message in the section

### Requirement 6.2: Check-In Today Section

**User Story:** ในฐานะ Admin ฉันต้องการเห็นรายการห้องที่มี check-in วันนี้ เพื่อให้สามารถเตรียมห้องและต้อนรับลูกค้าได้ทันเวลา

#### Acceptance Criteria

1. THE System SHALL display a "Check-in วันนี้" (Check-in Today) section on the left side of the Room_Board page
2. THE System SHALL position the Check-in Today section below the Check-out Today section
3. THE System SHALL query all Bookings where Check_In_Date equals the current date AND Booking_Status equals ACTIVE
4. THE System SHALL display each qualifying room as a card showing room number, guest name, and check-in time
5. THE System SHALL display Check_In_Time (14:00) with a clock icon next to each room entry
6. THE System SHALL render the section as a white card with rounded corners and soft shadow
7. THE System SHALL update the section automatically when bookings change
8. THE System SHALL display room numbers in the format "ห้อง XXX" (e.g., "ห้อง 103", "ห้อง 305")
9. WHEN there are no check-ins today, THE System SHALL display an empty state message in the section

### Requirement 7: Add Booking Modal Dialog

**User Story:** ในฐานะ Admin ฉันต้องการฟอร์มสร้างการจองที่ใช้งานง่าย เพื่อให้สามารถบันทึกข้อมูลการจองได้รวดเร็ว

#### Acceptance Criteria

1. WHEN Admin clicks on a Room_Cell with AVAILABLE status, THE System SHALL display the Add Booking Modal_Dialog
2. THE System SHALL render the Modal_Dialog as a white card with soft shadow and rounded corners
3. THE System SHALL display the Modal_Dialog centered on the screen with a semi-transparent backdrop
4. THE System SHALL include a Check-In Date_Picker field in the Modal_Dialog
5. THE System SHALL include a Check-Out Date_Picker field in the Modal_Dialog
6. THE System SHALL include a Guest Name text input field in the Modal_Dialog
7. THE System SHALL include a blue "Confirm Booking" button at the bottom of the Modal_Dialog
8. WHEN Admin clicks outside the Modal_Dialog or presses the Escape key, THE System SHALL close the Modal_Dialog
9. THE System SHALL pre-fill the Check-In date with the selected date from the clicked Room_Cell
10. THE System SHALL apply consistent spacing and padding to all form fields in the Modal_Dialog

### Requirement 8: Booking Details Modal Dialog

**User Story:** ในฐานะ Admin ฉันต้องการดูรายละเอียดการจองแบบเต็ม เพื่อให้ทราบข้อมูลลูกค้าและการเข้าพักอย่างครบถ้วน

#### Acceptance Criteria

1. WHEN Admin clicks on a Room_Cell with OCCUPIED or RESERVED status, THE System SHALL display the Booking Details Modal_Dialog
2. THE System SHALL render the Modal_Dialog as a white card with soft shadow and rounded corners
3. THE System SHALL display the following information in the Modal_Dialog: Room number, Guest name, Phone number, ID card number, Check-Out date, Days remaining, and Remark
4. THE System SHALL calculate and display days remaining as the difference between Check_Out_Date and current date
5. THE System SHALL include a blue "Close" button at the bottom of the Modal_Dialog
6. WHEN Admin clicks the Close button or outside the Modal_Dialog, THE System SHALL close the Modal_Dialog
7. THE System SHALL format all information with clear labels and readable typography
8. THE System SHALL apply consistent spacing between information fields

### Requirement 9: Date Picker Component

**User Story:** ในฐานะ Admin ฉันต้องการเลือกวันที่จากปฏิทิน เพื่อให้สามารถระบุวันที่ได้อย่างถูกต้องและสะดวก

#### Acceptance Criteria

1. THE System SHALL provide Date_Picker components using Angular Material Datepicker
2. WHEN Admin clicks on a Date_Picker field, THE System SHALL display a calendar popup
3. THE System SHALL highlight the currently selected date in the calendar
4. THE System SHALL allow Admin to navigate between months and years in the calendar
5. WHEN Admin selects a date from the calendar, THE System SHALL populate the date field and close the calendar popup
6. THE System SHALL format displayed dates in a readable format (e.g., "5 Mar 2026")
7. THE System SHALL validate that Check_Out_Date is after Check_In_Date in booking forms
8. THE System SHALL apply rounded corners and soft shadows to the calendar popup

### Requirement 9.1: Date Range Picker Component

**User Story:** ในฐานะ Admin ฉันต้องการเลือกช่วงวันที่จากปฏิทิน เพื่อให้สามารถดูข้อมูลห้องพักในช่วงเวลาที่ต้องการได้

#### Acceptance Criteria

1. THE System SHALL provide Date_Range_Picker component using Angular Material Datepicker with range selection
2. THE System SHALL display start date and end date fields in the Date_Range_Picker
3. WHEN Admin clicks on the Date_Range_Picker, THE System SHALL display a calendar popup with range selection capability
4. THE System SHALL highlight the selected date range in the calendar
5. WHEN Admin selects a start date and end date, THE System SHALL populate both date fields
6. THE System SHALL format displayed dates in Thai format (e.g., "08 เมษายน 2026" ถึง "14 เมษายน 2026")
7. THE System SHALL validate that the end date is after or equal to the start date
8. THE System SHALL apply rounded corners and soft shadows to the calendar popup

### Requirement 9.2: Detailed Room View Table

**User Story:** ในฐานะ Admin ฉันต้องการเห็นตารางรายละเอียดห้องพักด้านล่าง Room Board เพื่อให้สามารถดูข้อมูลห้องเพิ่มเติมได้

#### Acceptance Criteria

1. THE System SHALL display a detailed room view table below the main Room_Board grid
2. THE System SHALL display the table title "ตั้งเวลาที่ [selected date]" (e.g., "ตั้งเวลาที่ 8 เมษายน 2026")
3. THE System SHALL render the table with the same grid layout as the main Room_Board
4. THE System SHALL display room numbers in the leftmost column (e.g., "ห้อง 101", "ห้อง 102", "ห้อง 112", "ห้อง 113")
5. THE System SHALL display multiple date columns showing room status for each date
6. THE System SHALL apply the same Status_Color scheme as the main Room_Board grid
7. THE System SHALL display Room_Icon (person, bed icons) in cells with bookings
8. THE System SHALL render the table as a white card with rounded corners and soft shadow
9. THE System SHALL synchronize the displayed date range with the main Room_Board grid
10. THE System SHALL allow Admin to scroll horizontally if there are many date columns

### Requirement 10: Booking Creation

**User Story:** ในฐานะ Admin ฉันต้องการสร้างการจองห้องพัก เพื่อบันทึกข้อมูลลูกค้าและรายละเอียดการเข้าพัก

#### Acceptance Criteria

1. WHEN Admin submits the Add Booking Modal_Dialog with valid data, THE System SHALL create a new Booking record
2. THE System SHALL require the following fields: Customer name, phone number, Thai ID card, Booking_Type, Check_In_Date, Check_Out_Date, number of guests, deposit amount, and remark
3. THE System SHALL provide Booking_Type options: 3_HOUR, DAILY, MONTHLY
4. WHEN a Booking is created, THE System SHALL set Booking_Status to ACTIVE
5. WHEN a Booking is created, THE System SHALL update Room_Status to RESERVED if Check_In_Date is in the future, or OCCUPIED if Check_In_Date is today
6. WHEN a Booking is successfully created, THE System SHALL close the Modal_Dialog and refresh the Room_Board grid
7. IF the booking creation fails, THEN THE System SHALL display an error message in the Modal_Dialog without closing it

### Requirement 11: Guest Management

**User Story:** ในฐานะ Admin ฉันต้องการเพิ่มข้อมูลผู้เข้าพักหลายคนในการจองเดียว เพื่อบันทึกข้อมูลผู้เข้าพักทุกคน

#### Acceptance Criteria

1. THE System SHALL allow Admin to add multiple Guest records to a single Booking
2. THE System SHALL require Guest name and ID card number for each Guest
3. THE System SHALL associate each Guest with exactly one Booking
4. THE System SHALL display all guests associated with a Booking in the Booking Details Modal_Dialog

### Requirement 12: Double Booking Prevention

**User Story:** ในฐานะ Admin ฉันต้องการป้องกันการจองห้องซ้ำ เพื่อหลีกเลี่ยงปัญหาห้องไม่พอ

#### Acceptance Criteria

1. WHEN Admin attempts to create a Booking, THE System SHALL check for existing bookings on the same Room with overlapping dates
2. IF a Room has an existing Booking where the date ranges overlap, THEN THE System SHALL reject the new Booking and display an error message in the Modal_Dialog
3. THE System SHALL consider date ranges as overlapping when the new Check_In_Date is before the existing Check_Out_Date AND the new Check_Out_Date is after the existing Check_In_Date

### Requirement 13: Check-In and Check-Out Time Standards

**User Story:** ในฐานะ Admin ฉันต้องการกำหนดเวลาเช็คอินและเช็คเอาท์มาตรฐาน เพื่อให้มีเวลาเตรียมห้องสำหรับลูกค้าคนต่อไป

#### Acceptance Criteria

1. THE System SHALL set Check_In_Time to 14:00 (2:00 PM)
2. THE System SHALL set Check_Out_Time to 12:00 (12:00 PM)
3. WHEN calculating check-in schedules, THE System SHALL use Check_In_Time as the reference time
4. WHEN calculating check-out schedules, THE System SHALL use Check_Out_Time as the reference time
5. THE System SHALL display check-in time with clock icon in the Check-in Today section
6. THE System SHALL display check-out time with clock icon in the Check-out Today section

### Requirement 14: Automated Check-Out Scheduler

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบเปลี่ยนสถานะห้องอัตโนมัติเมื่อถึงเวลาเช็คเอาท์ เพื่อลดภาระงานด้านการจัดการ

#### Acceptance Criteria

1. THE System SHALL execute the Scheduler daily at 12:00 noon
2. WHEN the Scheduler runs, THE System SHALL query all Bookings where Check_Out_Date equals the current date AND Booking_Status equals ACTIVE
3. WHEN the Scheduler identifies qualifying Bookings, THE System SHALL update Booking_Status to CHECKED_OUT
4. WHEN the Scheduler updates a Booking to CHECKED_OUT, THE System SHALL update the associated Room_Status to CLEANING

### Requirement 15: Post Check-Out Room Management

**User Story:** ในฐานะ Admin ฉันต้องการเปลี่ยนสถานะห้องหลังทำความสะอาดเสร็จ เพื่อให้ห้องพร้อมรับลูกค้าคนต่อไป

#### Acceptance Criteria

1. WHEN a Room has Room_Status of CLEANING, THE System SHALL allow Admin to manually change Room_Status to AVAILABLE
2. WHEN Admin clicks on a Room_Cell with CLEANING status, THE System SHALL display an option to mark the room as clean
3. WHEN Admin confirms marking the room as clean, THE System SHALL update Room_Status to AVAILABLE
4. THE System SHALL update the Room_Board grid immediately after the status change

### Requirement 16: Room Price Management

**User Story:** ในฐานะ Admin ฉันต้องการกำหนดราคาห้องตามวันที่และประเภทการจอง เพื่อรองรับราคาที่แตกต่างกันในแต่ละช่วงเวลา

#### Acceptance Criteria

1. THE System SHALL provide a Room Price management page accessible from the Sidebar menu
2. THE System SHALL allow Admin to set Room_Price for each Room on specific dates
3. THE System SHALL store three price types for each Room_Price record: 3_HOUR price, DAILY price, and MONTHLY price
4. THE System SHALL allow Admin to create, update, and delete Room_Price records
5. THE System SHALL display current Room_Price for each Room when creating a Booking
6. THE System SHALL apply the same design style to the Room Price page as other pages (rounded corners, soft shadows, consistent colors)

### Requirement 17: Revenue Reporting

**User Story:** ในฐานะ Admin ฉันต้องการดูรายงานรายได้ เพื่อติดตามผลประกอบการของโรงแรม

#### Acceptance Criteria

1. THE System SHALL provide a Reports page accessible from both the Sidebar menu and Top_Bar
2. THE System SHALL generate daily revenue reports showing total revenue, number of rooms sold, and booking count for the selected date
3. THE System SHALL generate monthly revenue reports showing total revenue, number of rooms sold, and booking count for the selected month
4. THE System SHALL generate yearly revenue reports showing total revenue, number of rooms sold, and booking count for the selected year
5. THE System SHALL calculate total revenue by summing deposit amounts from all Bookings within the selected time period
6. THE System SHALL count rooms sold as the number of unique rooms with CHECKED_OUT bookings within the selected time period
7. THE System SHALL count bookings as the total number of Bookings with CHECKED_OUT status within the selected time period
8. THE System SHALL display reports using charts and tables with the same design style as other pages

### Requirement 18: Icon System

**User Story:** ในฐานะ Admin ฉันต้องการเห็นไอคอนที่ช่วยสื่อความหมาย เพื่อให้เข้าใจสถานะและฟังก์ชันต่างๆ ได้ง่ายขึ้น

#### Acceptance Criteria

1. THE System SHALL use Angular Material Icons throughout the interface
2. THE System SHALL display a cleaning icon (e.g., mop or broom icon) in Room_Cell with CLEANING status
3. THE System SHALL display a notification bell icon in the Top_Bar
4. THE System SHALL display a user avatar icon in the Top_Bar and Sidebar
5. THE System SHALL display appropriate icons for each menu item in the Sidebar (dashboard, room board, price tag, report, settings)
6. THE System SHALL display a hotel/building icon as the logo at the top of the Sidebar
7. THE System SHALL display a logout icon next to the Logout button
8. THE System SHALL use consistent icon sizes and colors throughout the interface

### Requirement 19: Responsive Design

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบแสดงผลได้ดีบนหน้าจอขนาดต่างๆ เพื่อให้สามารถใช้งานได้สะดวกบนอุปกรณ์ต่างๆ

#### Acceptance Criteria

1. THE System SHALL render the interface responsively using Angular Flex Layout or CSS Grid
2. WHEN the screen width is less than 768px, THE System SHALL collapse the Sidebar into a hamburger menu
3. WHEN the screen width is less than 768px, THE System SHALL adjust the Room_Board grid to show fewer date columns
4. THE System SHALL maintain readability and usability across screen sizes from 320px to 1920px width
5. THE System SHALL ensure all interactive elements remain accessible on touch devices
6. THE System SHALL maintain consistent spacing and padding ratios across different screen sizes

### Requirement 19.1: Multi-Language Support

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบรองรับทั้งภาษาไทยและภาษาอังกฤษ เพื่อให้สามารถใช้งานได้สะดวกและเข้าใจง่าย

#### Acceptance Criteria

1. THE System SHALL display the user interface primarily in Thai language
2. THE System SHALL support mixed Thai-English labels where appropriate (e.g., "Available", "Cleaning")
3. THE System SHALL display menu items in Thai: "แดชบอร์ด" (Dashboard), "ห้องพัก" (Room Board), "ราคาห้อง" (Room Price), "รายงาน" (Reports), "ตั้งค่า" (Settings)
4. THE System SHALL display room status labels in Thai: "ว่าง" (Available), "เข้าพัก" (Occupied), "จองแล้ว" (Reserved)
5. THE System SHALL display button labels in Thai: "จองห้องพัก" (Bookings), "ค้นหา" (Search), "ออกจากระบบ" (Logout)
6. THE System SHALL display section titles in Thai: "Check-out วันนี้", "Check-in วันนี้", "ห้องพัก"
7. THE System SHALL format dates in Thai format (e.g., "8 เมษายน 2026", "8 เมษ.")
8. THE System SHALL maintain consistent language usage across all pages and components

### Requirement 20: Database Schema

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบเก็บข้อมูลอย่างถูกต้องและสมบูรณ์ เพื่อให้สามารถใช้งานได้อย่างมีประสิทธิภาพ

#### Acceptance Criteria

1. THE System SHALL maintain a rooms table with fields: room_id, room_number, room_status, room_type
2. THE System SHALL maintain a customers table with fields: customer_id, name, phone_number, thai_id_card
3. THE System SHALL maintain a bookings table with fields: booking_id, room_id, customer_id, booking_type, check_in_date, check_out_date, number_of_guests, deposit, remark, booking_status, created_at
4. THE System SHALL maintain a guests table with fields: guest_id, booking_id, guest_name, id_card_number
5. THE System SHALL maintain a room_prices table with fields: price_id, room_id, date, three_hour_price, daily_price, monthly_price
6. THE System SHALL enforce foreign key relationships between tables
7. THE System SHALL set room_id in bookings table as a foreign key referencing rooms table
8. THE System SHALL set customer_id in bookings table as a foreign key referencing customers table
9. THE System SHALL set booking_id in guests table as a foreign key referencing bookings table
10. THE System SHALL set room_id in room_prices table as a foreign key referencing rooms table

### Requirement 21: Frontend Technology Stack

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบใช้เทคโนโลยีที่ทันสมัยและเหมาะสม เพื่อให้ได้ประสบการณ์การใช้งานที่ดี

#### Acceptance Criteria

1. THE System SHALL implement the Frontend using Angular framework
2. THE System SHALL use Angular Material UI as the component library for all UI components
3. THE System SHALL build the Frontend as a Single Page Application (SPA)
4. THE System SHALL use TypeScript as the primary programming language for Frontend development
5. THE System SHALL use Angular Router for client-side navigation
6. THE System SHALL use Angular HttpClient for making HTTP requests to the Backend
7. THE System SHALL use Angular Reactive Forms for form handling and validation
8. THE System SHALL use RxJS for reactive programming and state management

### Requirement 22: Backend Technology Stack

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบมี Backend ที่มีประสิทธิภาพ เพื่อประมวลผลข้อมูลได้รวดเร็วและปลอดภัย

#### Acceptance Criteria

1. THE System SHALL implement the Backend using Node.js runtime environment
2. THE System SHALL use Express.js framework for building the REST API
3. THE System SHALL expose API_Endpoint using HTTP_Methods: GET, POST, PUT, DELETE
4. THE System SHALL use JavaScript or TypeScript as the programming language for Backend development
5. THE System SHALL implement RESTful API design principles for all API_Endpoint
6. THE System SHALL return JSON format for all API responses
7. THE System SHALL accept JSON format for all API request bodies
8. THE System SHALL implement proper error handling and return appropriate HTTP status codes

### Requirement 23: Database Technology Stack

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบใช้ฐานข้อมูลที่เชื่อถือได้ เพื่อเก็บข้อมูลอย่างปลอดภัยและสามารถ query ได้อย่างมีประสิทธิภาพ

#### Acceptance Criteria

1. THE System SHALL use PostgreSQL as the Database management system
2. THE System SHALL connect to the Database using a PostgreSQL client library (e.g., pg, node-postgres)
3. THE System SHALL implement connection pooling for efficient database connections
4. THE System SHALL use parameterized queries to prevent SQL injection attacks
5. THE System SHALL implement database transactions for operations that modify multiple tables
6. THE System SHALL create appropriate indexes on frequently queried columns
7. THE System SHALL enforce data integrity using foreign key constraints and check constraints

### Requirement 24: Automated Scheduler Implementation

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบมีกลไกทำงานอัตโนมัติตามเวลา เพื่อลดภาระงานที่ต้องทำซ้ำๆ ทุกวัน

#### Acceptance Criteria

1. THE System SHALL implement a protected API endpoint POST /api/scheduler/trigger-checkout for executing automated checkout
2. THE System SHALL protect the endpoint with an API key authentication
3. THE System SHALL configure an external cron service (e.g., cron-job.org) to call the endpoint daily at 12:00 noon
4. THE System SHALL execute the auto check-out process when the endpoint is triggered
5. THE System SHALL log all scheduler executions with timestamp and results
6. IF the scheduler execution fails, THEN THE System SHALL log the error details and return appropriate error response
7. THE System SHALL allow manual triggering of the endpoint for testing purposes (with valid API key)
8. THE System SHALL validate the API key before executing any scheduler logic
9. THE System SHALL return 401 Unauthorized if API key is invalid or missing
10. THE System SHALL document the external cron service setup in deployment documentation

### Requirement 25: Frontend Deployment

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบ Frontend ถูก deploy บน platform ที่เชื่อถือได้ เพื่อให้เข้าถึงได้ง่ายและรวดเร็ว

#### Acceptance Criteria

1. THE System SHALL deploy the Frontend application on Vercel platform
2. THE System SHALL build the Angular application for production before deployment
3. THE System SHALL configure Vercel to serve the SPA with proper routing support
4. THE System SHALL enable HTTPS for all Frontend connections
5. THE System SHALL configure environment variables in Vercel for Backend API URL
6. THE System SHALL implement automatic deployment when code is pushed to the main branch
7. THE System SHALL provide a public URL for accessing the Frontend application

### Requirement 26: Database Deployment

**User Story:** ในฐานะ Admin ฉันต้องการให้ฐานข้อมูลถูก host บน platform ที่มีความเสถียร เพื่อให้ข้อมูลปลอดภัยและเข้าถึงได้ตลอดเวลา

#### Acceptance Criteria

1. THE System SHALL host the PostgreSQL Database on Supabase platform
2. THE System SHALL configure database connection credentials securely
3. THE System SHALL enable SSL/TLS for all database connections
4. THE System SHALL implement database backup strategy on Supabase
5. THE System SHALL configure appropriate database access permissions
6. THE System SHALL store database connection string as environment variable in the Backend
7. THE System SHALL restrict database access to authorized Backend services only

### Requirement 27: Backend Deployment

**User Story:** ในฐานะ Admin ฉันต้องการให้ระบบ Backend ถูก deploy อย่างเหมาะสม เพื่อให้ API ทำงานได้อย่างต่อเนื่องและมีประสิทธิภาพ

#### Acceptance Criteria

1. THE System SHALL deploy the Backend application on Render platform (Free tier)
2. THE System SHALL configure environment variables for database connection and API settings in Render
3. THE System SHALL enable HTTPS for all API_Endpoint (automatic on Render)
4. THE System SHALL implement CORS (Cross-Origin Resource Sharing) to allow Frontend access from Vercel domain
5. THE System SHALL configure the Backend to run the Node Cron Scheduler continuously on Render
6. THE System SHALL implement health check endpoint for monitoring Backend status (required for Render free tier)
7. THE System SHALL log all API requests and errors for debugging purposes
8. THE System SHALL configure Render to automatically deploy when code is pushed to the main branch

### Requirement 28: Project Structure - Frontend

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้โครงสร้างโปรเจค Frontend มีการจัดระเบียบที่ดี เพื่อให้พัฒนาและบำรุงรักษาได้ง่าย

#### Acceptance Criteria

1. THE System SHALL organize Frontend code using Angular CLI standard project structure
2. THE System SHALL separate code into modules: core module, shared module, and feature modules
3. THE System SHALL place reusable components in the shared module
4. THE System SHALL place services in appropriate service directories within each module
5. THE System SHALL place models and interfaces in a models directory
6. THE System SHALL place Angular Material imports in a dedicated material module
7. THE System SHALL organize feature modules by functionality: room-board, bookings, reports, room-prices, settings
8. THE System SHALL place routing configuration in separate routing modules
9. THE System SHALL store environment-specific configuration in environment files

### Requirement 29: Project Structure - Backend

**User Story:** ในฐานะนักพัฒนา ฉันต้องการให้โครงสร้างโปรเจค Backend มีการจัดระเบียบที่ดี เพื่อให้พัฒนาและบำรุงรักษาได้ง่าย

#### Acceptance Criteria

1. THE System SHALL organize Backend code using a layered architecture pattern
2. THE S

