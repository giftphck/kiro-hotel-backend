import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { Booking, CreateBookingDto, BookingType, BookingStatus } from '../../models/booking.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private roomService = inject(RoomService);

  // Signals
  bookings = signal<Booking[]>([]);
  rooms = signal<Room[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Search/Filter
  searchTerm = signal('');
  filterStatus = signal<string>('ALL');
  filterCheckInDate = signal<string>('');
  filterCheckOutDate = signal<string>('');
  
  // Modal states
  showAddModal = signal(false);
  showDetailsModal = signal(false);
  selectedBooking = signal<Booking | null>(null);
  
  // Form data
  bookingForm = signal<CreateBookingDto>({
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
    unitPrice: 0,
    totalPrice: 0,
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
  bookingStatuses = Object.values(BookingStatus);

  // Computed
  availableRooms = computed(() => {
    return this.rooms().filter(room => room.roomStatus === 'AVAILABLE');
  });

  filteredBookings = computed(() => {
    let filtered = this.bookings();
    
    // Filter by search term (room number or customer name)
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(booking => 
        booking.roomNumber?.toLowerCase().includes(search) ||
        booking.customerName?.toLowerCase().includes(search)
      );
    }
    
    // Filter by status
    if (this.filterStatus() !== 'ALL') {
      filtered = filtered.filter(booking => booking.bookingStatus === this.filterStatus());
    }
    
    // Filter by check-in date
    if (this.filterCheckInDate()) {
      const filterDate = new Date(this.filterCheckInDate());
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(booking => {
        const bookingCheckIn = new Date(booking.checkInDate);
        bookingCheckIn.setHours(0, 0, 0, 0);
        return bookingCheckIn.getTime() === filterDate.getTime();
      });
    }
    
    // Filter by check-out date
    if (this.filterCheckOutDate()) {
      const filterDate = new Date(this.filterCheckOutDate());
      filterDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(booking => {
        const bookingCheckOut = new Date(booking.checkOutDate);
        bookingCheckOut.setHours(0, 0, 0, 0);
        return bookingCheckOut.getTime() === filterDate.getTime();
      });
    }
    
    return filtered;
  });

  ngOnInit() {
    this.loadBookings();
    this.loadRooms();
  }

  loadBookings() {
    this.loading.set(true);
    this.error.set(null);
    
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        console.log('Loaded bookings:', bookings); // Debug log
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.error.set('ไม่สามารถโหลดข้อมูลการจองได้');
        this.loading.set(false);
      }
    });
  }

  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
      },
      error: (err) => {
        console.error('Error loading rooms:', err);
      }
    });
  }

  // Add Modal
  openAddModal() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.bookingForm.set({
      roomId: '',
      customer: {
        name: '',
        phoneNumber: '',
        thaiIdCard: ''
      },
      bookingType: BookingType.DAILY,
      checkInDate: this.formatDateForInput(now),
      checkOutDate: this.formatDateForInput(tomorrow),
      numberOfGuests: 1,
      priceType: 'DAILY',
      unitPrice: 500,
      totalPrice: 500,
      deposit: 0,
      remark: ''
    });
    this.formErrors.set([]);
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  submitAddBooking() {
    const errors = this.validateForm();
    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.submitting.set(true);
    this.bookingService.createBooking(this.bookingForm()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAddModal();
        this.loadBookings();
        this.displayToast('สร้างการจองสำเร็จ', 'success');
      },
      error: (err) => {
        this.submitting.set(false);
        const errorMsg = err.error?.message || 'ไม่สามารถสร้างการจองได้';
        this.formErrors.set([errorMsg]);
      }
    });
  }

  // Details Modal
  openDetailsModal(booking: Booking) {
    this.selectedBooking.set(booking);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedBooking.set(null);
  }

  // Cancel Booking
  cancelBooking(bookingId: string) {
    if (!confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
      return;
    }

    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        this.loadBookings();
        this.closeDetailsModal();
        this.displayToast('ยกเลิกการจองสำเร็จ', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'ไม่สามารถยกเลิกการจองได้';
        this.displayToast(errorMsg, 'error');
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

    if (!form.customer.phoneNumber || form.customer.phoneNumber.trim() === '') {
      errors.push('กรุณากรอกเบอร์โทรศัพท์');
    } else if (!/^[0-9]{9,10}$/.test(form.customer.phoneNumber)) {
      errors.push('เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก');
    }

    if (!form.customer.thaiIdCard || form.customer.thaiIdCard.trim() === '') {
      errors.push('กรุณากรอกเลขบัตรประชาชน');
    } else if (!/^[0-9]{13}$/.test(form.customer.thaiIdCard)) {
      errors.push('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
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

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

    const totalPrice = form.unitPrice * units;
    this.bookingForm.update(f => ({ ...f, totalPrice }));
  }

  // Toast
  displayToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  // Clear all filters
  clearFilters() {
    this.searchTerm.set('');
    this.filterStatus.set('ALL');
    this.filterCheckInDate.set('');
    this.filterCheckOutDate.set('');
  }
}
