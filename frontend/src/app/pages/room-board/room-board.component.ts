import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { Booking, BookingStatus, BookingType, CreateBookingDto } from '../../models/booking.model';
import { Room, RoomStatus } from '../../models/room.model';
import { PaymentHistory, PaymentType, PaymentStatus } from '../../models/payment-history.model';

interface RoomBoardCell {
  roomId: string;
  roomNumber: string;
  date: Date;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  booking?: Booking;
}

@Component({
  selector: 'app-room-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-board.component.html',
  styleUrl: './room-board.component.scss'
})
export class RoomBoardComponent implements OnInit {
  private bookingService = inject(BookingService);
  private roomService = inject(RoomService);

  // Signals
  rooms = signal<Room[]>([]);
  bookings = signal<Booking[]>([]);
  loading = signal(false);
  
  // Search/Filter
  searchRoomNumber = signal<string>('');
  
  // Date range
  startDate = signal<Date>(new Date());
  dateRange = signal<Date[]>([]);
  
  // Add Booking Modal
  showAddModal = signal(false);
  showDetailsModal = signal(false);
  showAddPaymentModal = signal(false);
  showRefundModal = signal(false);
  selectedCell = signal<RoomBoardCell | null>(null);
  selectedBooking = signal<Booking | null>(null);
  paymentHistory = signal<PaymentHistory[]>([]);
  paymentAmount = signal<number>(0);
  refundAmount = signal<number>(0);
  bookingForm = signal<CreateBookingDto & { calculatedPrice?: number }>({
    roomId: '',
    customer: {
      name: '',
      phoneNumber: '',
      thaiIdCard: ''
    },
    bookingType: BookingType.DAILY,
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    priceType: 'DAILY',
    unitPrice: 500,
    totalPrice: 500,
    calculatedPrice: 500,
    deposit: 0,
    remark: ''
  });
  formErrors = signal<string[]>([]);
  submitting = signal(false);
  
  // Toast
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  
  // Enums for template
  bookingTypes = Object.values(BookingType);
  
  // Computed
  filteredRooms = computed(() => {
    const search = this.searchRoomNumber().toLowerCase();
    if (!search) return this.rooms();
    
    return this.rooms().filter(room => 
      room.roomNumber.toLowerCase().includes(search)
    );
  });

  boardData = computed(() => {
    const data: RoomBoardCell[][] = [];
    const roomsList = this.filteredRooms();
    const bookingsList = this.bookings();
    const dates = this.dateRange();
    
    roomsList.forEach(room => {
      const row: RoomBoardCell[] = [];
      dates.forEach(date => {
        const cell = this.getCellStatus(room, date, bookingsList);
        row.push(cell);
      });
      data.push(row);
    });
    
    return data;
  });

  todayCheckIns = computed(() => {
    return this.bookings().filter(b => {
      const checkIn = new Date(b.checkInDate);
      const today = new Date();
      checkIn.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime() && b.bookingStatus === BookingStatus.ACTIVE;
    });
  });

  todayCheckOuts = computed(() => {
    return this.bookings().filter(b => {
      const checkOut = new Date(b.checkOutDate);
      const today = new Date();
      checkOut.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return checkOut.getTime() === today.getTime() && b.bookingStatus === BookingStatus.ACTIVE;
    });
  });

  // Calculate total paid from payment history with status filtering and refund handling
  totalPaidFromHistory = computed(() => {
    return this.paymentHistory()
      .filter(payment => payment.status === PaymentStatus.SUCCESS)
      .reduce((sum, payment) => {
        const amount = Number(payment.amount);
        return payment.paymentType === PaymentType.REFUND 
          ? sum - amount  // Subtract refunds (stored as positive)
          : sum + amount; // Add other payments
      }, 0);
  });

  // Calculate remaining deposit (deposit paid - refunds)
  remainingDeposit = computed(() => {
    const payments = this.paymentHistory().filter(p => p.status === PaymentStatus.SUCCESS);
    const depositPaid = payments
      .filter(p => p.paymentType === PaymentType.DEPOSIT)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const refunded = payments
      .filter(p => p.paymentType === PaymentType.REFUND)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return depositPaid - refunded;
  });

  // Check if refund is possible
  canRefund = computed(() => this.remainingDeposit() > 0);

  // Calculate remaining balance to be paid
  remainingBalance = computed(() => {
    const booking = this.selectedBooking();
    if (!booking) return 0;
    const totalPrice = Number(booking.totalPrice);
    const paid = this.totalPaidFromHistory();
    return Math.max(0, totalPrice - paid);
  });

  // Maximum additional payment allowed
  maxAdditionalPayment = computed(() => this.remainingBalance());

  // Filter and sort payments for display
  displayedPayments = computed(() => {
    return this.paymentHistory()
      .filter(payment => payment.status === PaymentStatus.SUCCESS)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Check if there's any refund in payment history
  hasRefund = computed(() => {
    return this.paymentHistory().some(payment => payment.paymentType === 'REFUND');
  });

  ngOnInit() {
    this.generateDateRange();
    this.loadData();
  }

  generateDateRange() {
    const start = new Date(this.startDate());
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    this.dateRange.set(dates);
  }

  loadData() {
    this.loading.set(true);
    
    // Load rooms
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
      },
      error: (err) => console.error('Error loading rooms:', err)
    });
    
    // Load bookings
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loading.set(false);
      }
    });
  }

  getCellStatus(room: Room, date: Date, bookings: Booking[]): RoomBoardCell {
    const cellDate = new Date(date);
    cellDate.setHours(0, 0, 0, 0);
    
    // Find booking for this room and date
    const booking = bookings.find(b => {
      if (b.roomId !== room.roomId || b.bookingStatus !== BookingStatus.ACTIVE) return false;
      
      const checkIn = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return cellDate.getTime() >= checkIn.getTime() && cellDate.getTime() < checkOut.getTime();
    });
    
    let status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' = 'AVAILABLE';
    
    if (booking) {
      const checkIn = new Date(booking.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (cellDate.getTime() === checkIn.getTime() && checkIn.getTime() <= today.getTime()) {
        status = 'OCCUPIED';
      } else {
        status = 'RESERVED';
      }
    } else if (room.roomStatus === RoomStatus.CLEANING) {
      status = 'CLEANING';
    }
    
    return {
      roomId: room.roomId,
      roomNumber: room.roomNumber,
      date: cellDate,
      status,
      booking
    };
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'AVAILABLE': 'bg-success text-white',
      'OCCUPIED': 'bg-danger text-white',
      'RESERVED': 'bg-primary text-white',
      'CLEANING': 'bg-warning text-dark'
    };
    return classes[status] || 'bg-secondary';
  }

  getCellStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'AVAILABLE': 'ว่าง',
      'OCCUPIED': 'เข้าพัก',
      'RESERVED': 'จองแล้ว',
      'CLEANING': 'ทำความสะอาด'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  previousWeek() {
    const current = new Date(this.startDate());
    current.setDate(current.getDate() - 7);
    this.startDate.set(current);
    this.generateDateRange();
  }

  nextWeek() {
    const current = new Date(this.startDate());
    current.setDate(current.getDate() + 7);
    this.startDate.set(current);
    this.generateDateRange();
  }

  today() {
    this.startDate.set(new Date());
    this.generateDateRange();
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedDate = new Date(input.value);
    this.startDate.set(selectedDate);
    this.generateDateRange();
  }

  // Cell Click Handler
  onCellClick(cell: RoomBoardCell) {
    if (cell.status === 'AVAILABLE') {
      // Open add booking modal for available cells
      this.openAddBookingModal(cell);
    } else if (cell.booking && (cell.status === 'OCCUPIED' || cell.status === 'RESERVED')) {
      // Open details modal for occupied/reserved cells
      this.openDetailsModal(cell.booking);
    }
  }

  openAddBookingModal(cell: RoomBoardCell) {
    this.selectedCell.set(cell);
    
    // Pre-fill form with cell data
    const checkInDate = new Date(cell.date);
    checkInDate.setHours(14, 0, 0, 0); // Default check-in at 14:00
    
    const checkOutDate = new Date(cell.date);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    checkOutDate.setHours(12, 0, 0, 0); // Default check-out at 12:00 next day
    
    // Calculate initial price
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const units = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // days
    const initialPrice = 500 * units;
    
    this.bookingForm.set({
      roomId: cell.roomId,
      customer: {
        name: '',
        phoneNumber: '',
        thaiIdCard: ''
      },
      bookingType: BookingType.DAILY,
      checkInDate: this.formatDateForInput(checkInDate),
      checkOutDate: this.formatDateForInput(checkOutDate),
      numberOfGuests: 1,
      priceType: 'DAILY',
      unitPrice: 500,
      totalPrice: initialPrice,
      calculatedPrice: initialPrice,
      deposit: 0,
      remark: ''
    });
    
    this.formErrors.set([]);
    this.showAddModal.set(true);
  }

  openDetailsModal(booking: Booking) {
    this.selectedBooking.set(booking);
    this.showDetailsModal.set(true);
    
    // Load payment history
    this.bookingService.getPaymentHistory(booking.bookingId).subscribe({
      next: (payments) => {
        this.paymentHistory.set(payments);
      },
      error: (err) => console.error('Error loading payment history:', err)
    });
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedBooking.set(null);
    this.paymentHistory.set([]);
  }

  openAddPaymentModal(booking: Booking) {
    this.selectedBooking.set(booking);
    this.paymentAmount.set(0);
    this.showDetailsModal.set(false); // Close details modal first
    this.showAddPaymentModal.set(true);
  }

  closeAddPaymentModal() {
    this.showAddPaymentModal.set(false);
    this.paymentAmount.set(0);
    this.showDetailsModal.set(true); // Re-open details modal
  }

  openRefundModal(booking: Booking) {
    this.selectedBooking.set(booking);
    this.refundAmount.set(0);
    this.showDetailsModal.set(false); // Close details modal first
    this.showRefundModal.set(true);
  }

  closeRefundModal() {
    this.showRefundModal.set(false);
    this.refundAmount.set(0);
    this.showDetailsModal.set(true); // Re-open details modal
  }

  submitRefund() {
    const booking = this.selectedBooking();
    if (!booking) return;

    const amount = this.refundAmount();
    const currentTotalPaid = this.totalPaidFromHistory();
    
    if (amount <= 0 || amount > currentTotalPaid) {
      this.displayToast('จำนวนเงินไม่ถูกต้อง', 'error');
      return;
    }

    // Send negative amount to indicate refund
    this.bookingService.updateBooking(booking.bookingId, { deposit: -amount }).subscribe({
      next: () => {
        // Reload all data
        this.loadData();
        
        // Reload payment history and booking details
        this.bookingService.getBookingById(booking.bookingId).subscribe({
          next: (updatedBooking) => {
            this.selectedBooking.set(updatedBooking);
            
            // Reload payment history
            this.bookingService.getPaymentHistory(booking.bookingId).subscribe({
              next: (payments) => {
                this.paymentHistory.set(payments);
                this.closeRefundModal();
                this.displayToast(`คืนเงิน ${amount} บาท สำเร็จ`, 'success');
              },
              error: (err) => console.error('Error loading payment history:', err)
            });
          },
          error: (err) => console.error('Error loading booking:', err)
        });
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'ไม่สามารถคืนเงินได้';
        this.displayToast(errorMsg, 'error');
      }
    });
  }

  submitAddPayment() {
      const booking = this.selectedBooking();
      if (!booking) return;

      const amount = this.paymentAmount();

      // Validate amount is positive
      if (amount <= 0) {
        this.displayToast('Payment amount must be greater than 0', 'error');
        return;
      }

      // Validate amount doesn't exceed remaining balance
      const maxAllowed = this.maxAdditionalPayment();
      if (amount > maxAllowed) {
        this.displayToast(
          `Payment amount cannot exceed remaining balance of ${maxAllowed} baht`, 
          'error'
        );
        return;
      }

      // Send payment amount directly, not newDeposit
      this.bookingService.updateBooking(booking.bookingId, { deposit: amount }).subscribe({
        next: () => {
          // Reload all data
          this.loadData();

          // Reload payment history and booking details
          this.bookingService.getBookingById(booking.bookingId).subscribe({
            next: (updatedBooking) => {
              this.selectedBooking.set(updatedBooking);

              // Reload payment history
              this.bookingService.getPaymentHistory(booking.bookingId).subscribe({
                next: (payments) => {
                  this.paymentHistory.set(payments);
                  this.closeAddPaymentModal();
                  this.displayToast(`รับเงินเพิ่ม ${amount} บาท สำเร็จ`, 'success');
                },
                error: (err) => console.error('Error loading payment history:', err)
              });
            },
            error: (err) => console.error('Error loading booking:', err)
          });
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'ไม่สามารถบันทึกการรับเงินได้';
          this.displayToast(errorMsg, 'error');
        }
      });
    }


  closeAddModal() {
    this.showAddModal.set(false);
    this.selectedCell.set(null);
  }

  // Cancel Booking
  cancelBooking(bookingId: string) {
    if (!confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
      return;
    }

    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        this.loadData();
        this.closeDetailsModal();
        this.displayToast('ยกเลิกการจองสำเร็จ', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'ไม่สามารถยกเลิกการจองได้';
        this.displayToast(errorMsg, 'error');
      }
    });
  }

  // Check Out Booking
  checkOutBooking(bookingId: string) {
    if (!confirm('ยืนยันการ Check Out?')) {
      return;
    }

    this.bookingService.updateBookingStatus(bookingId, BookingStatus.CHECKED_OUT).subscribe({
      next: () => {
        this.loadData();
        this.closeDetailsModal();
        this.displayToast('Check Out สำเร็จ', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'ไม่สามารถ Check Out ได้';
        this.displayToast(errorMsg, 'error');
      }
    });
  }

  // Mark as Paid
  markAsPaid(bookingId: string) {
    if (!confirm('ยืนยันว่าลูกค้าจ่ายเงินครบแล้ว?')) {
      return;
    }

    const booking = this.selectedBooking();
    if (!booking) return;

    // Update deposit to match total price (paid in full)
    const updatedDeposit = booking.totalPrice;
    
    // Call API to update deposit
    // Note: You'll need to add this endpoint to your backend
    this.bookingService.updateBooking(bookingId, { deposit: updatedDeposit }).subscribe({
      next: () => {
        this.loadData();
        this.closeDetailsModal();
        this.displayToast('บันทึกการชำระเงินสำเร็จ', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'ไม่สามารถบันทึกการชำระเงินได้';
        this.displayToast(errorMsg, 'error');
      }
    });
  }

  submitAddBooking() {
    const errors = this.validateForm();
    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.submitting.set(true);
    
    // Send bookingData with calculatedPrice
    const bookingData = this.bookingForm();
    
    this.bookingService.createBooking(bookingData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAddModal();
        this.loadData();
        this.displayToast('สร้างการจองสำเร็จ', 'success');
      },
      error: (err) => {
        this.submitting.set(false);
        const errorMsg = err.error?.message || 'ไม่สามารถสร้างการจองได้';
        this.formErrors.set([errorMsg]);
      }
    });
  }

  // Validation
  validateForm(): string[] {
    const errors: string[] = [];
    const form = this.bookingForm();

    if (!form.roomId) {
      errors.push('กรุณาเลือกห้อง');
    }

    if (!form.customer.name || form.customer.name.trim() === '') {
      errors.push('กรุณากรอกชื่อลูกค้า');
    }

    // Phone number is optional, but if provided must be valid
    if (form.customer.phoneNumber && form.customer.phoneNumber.trim() !== '') {
      if (!/^[0-9]{9,10}$/.test(form.customer.phoneNumber)) {
        errors.push('เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก');
      }
    }

    // Thai ID card is optional, but if provided must be valid
    if (form.customer.thaiIdCard && form.customer.thaiIdCard.trim() !== '') {
      if (!/^[0-9]{13}$/.test(form.customer.thaiIdCard)) {
        errors.push('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
      }
    }

    if (!form.checkInDate) {
      errors.push('กรุณาเลือกวันเช็คอิน');
    }

    if (!form.checkOutDate) {
      errors.push('กรุณาเลือกวันเช็คเอาท์');
    }

    if (form.checkInDate && form.checkOutDate) {
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      if (checkOut <= checkIn) {
        errors.push('วันเช็คเอาท์ต้องมากกว่าวันเช็คอิน');
      }
    }

    if (form.numberOfGuests < 1) {
      errors.push('จำนวนผู้เข้าพักต้องมากกว่า 0');
    }

    if (form.unitPrice < 0) {
      errors.push('ราคาต่อหน่วยต้องไม่ติดลบ');
    }

    if (form.totalPrice < 0) {
      errors.push('ราคารวมต้องไม่ติดลบ');
    }

    if (form.deposit < 0) {
      errors.push('เงินมัดจำต้องไม่ติดลบ');
    }

    return errors;
  }

  // Helper methods
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  getBookingTypeLabel(type: BookingType): string {
    const labels: Record<BookingType, string> = {
      [BookingType.THREE_HOUR]: '3 ชั่วโมง',
      [BookingType.DAILY]: 'รายวัน',
      [BookingType.MONTHLY]: 'รายเดือน'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      [BookingStatus.ACTIVE]: 'ใช้งาน',
      [BookingStatus.CHECKED_OUT]: 'เช็คเอาท์แล้ว',
      [BookingStatus.CANCELLED]: 'ยกเลิก'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: BookingStatus): string {
    const classes: Record<BookingStatus, string> = {
      [BookingStatus.ACTIVE]: 'badge bg-success',
      [BookingStatus.CHECKED_OUT]: 'badge bg-secondary',
      [BookingStatus.CANCELLED]: 'badge bg-danger'
    };
    return classes[status] || 'badge bg-secondary';
  }

  formatDateForDisplay(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentTypeLabel(type: PaymentType): string {
    const labels = {
      'DEPOSIT': 'มัดจำ',
      'PAYMENT': 'ชำระเงิน',
      'PARTIAL': 'ชำระบางส่วน',
      'FULL': 'ชำระครบ',
      'INITIAL_PAYMENT': 'ชำระเริ่มต้น',
      'REFUND': 'คืนเงิน'
    };
    return labels[type] || type;
  }

  // Calculate total price when dates or price type changes
  onDateOrPriceChange() {
    const form = this.bookingForm();
    if (!form.checkInDate || !form.checkOutDate) return;

    const checkIn = new Date(form.checkInDate);
    const checkOut = new Date(form.checkOutDate);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    
    let units = 0;
    if (form.bookingType === BookingType.THREE_HOUR) {
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 3)); // 3 hours
    } else if (form.bookingType === BookingType.DAILY) {
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // days
    } else if (form.bookingType === BookingType.MONTHLY) {
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)); // months
    }

    const calculatedPrice = form.unitPrice * units;
    // Update only calculatedPrice (for display), keep totalPrice as user edited
    this.bookingForm.update(f => ({ ...f, calculatedPrice }));
  }

  // Toast
  displayToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
