import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomPriceService } from '../../services/room-price.service';
import { RoomService } from '../../services/room.service';
import { RoomPrice, CreateRoomPriceDto, UpdateRoomPriceDto } from '../../models/room-price.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-room-price-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-price-management.component.html',
  styleUrls: ['./room-price-management.component.scss']
})
export class RoomPriceManagementComponent implements OnInit {
  private roomPriceService = inject(RoomPriceService);
  private roomService = inject(RoomService);

  // Signals
  roomPrices = signal<RoomPrice[]>([]);
  rooms = signal<Room[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal states
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  selectedRoomPrice = signal<RoomPrice | null>(null);

  // Form data
  priceForm = signal<CreateRoomPriceDto>({
    roomId: '',
    date: '',
    threeHourPrice: undefined,
    dailyPrice: undefined,
    monthlyPrice: undefined
  });

  formErrors = signal<string[]>([]);
  submitting = signal(false);

  // Toast
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  // Computed
  roomPriceCount = computed(() => this.roomPrices().length);

  ngOnInit(): void {
    this.loadRoomPrices();
    this.loadRooms();
  }

  loadRoomPrices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roomPriceService.getRoomPrices().subscribe({
      next: (prices) => {
        this.roomPrices.set(prices);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลราคาห้องได้');
        this.loading.set(false);
        console.error('Error loading room prices:', err);
      }
    });
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
      },
      error: (err) => {
        console.error('Error loading rooms:', err);
      }
    });
  }

  openAddModal(): void {
    const today = new Date();
    this.priceForm.set({
      roomId: '',
      date: this.formatDateForInput(today),
      threeHourPrice: undefined,
      dailyPrice: undefined,
      monthlyPrice: undefined
    });
    this.formErrors.set([]);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.priceForm.set({
      roomId: '',
      date: '',
      threeHourPrice: undefined,
      dailyPrice: undefined,
      monthlyPrice: undefined
    });
    this.formErrors.set([]);
  }

  openEditModal(roomPrice: RoomPrice): void {
    this.selectedRoomPrice.set(roomPrice);
    this.priceForm.set({
      roomId: roomPrice.roomId,
      date: this.formatDateForInput(new Date(roomPrice.date)),
      threeHourPrice: roomPrice.threeHourPrice,
      dailyPrice: roomPrice.dailyPrice,
      monthlyPrice: roomPrice.monthlyPrice
    });
    this.formErrors.set([]);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedRoomPrice.set(null);
    this.priceForm.set({
      roomId: '',
      date: '',
      threeHourPrice: undefined,
      dailyPrice: undefined,
      monthlyPrice: undefined
    });
    this.formErrors.set([]);
  }

  openDeleteModal(roomPrice: RoomPrice): void {
    this.selectedRoomPrice.set(roomPrice);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedRoomPrice.set(null);
  }

  validateForm(): boolean {
    const errors: string[] = [];
    const form = this.priceForm();

    if (!form.roomId || form.roomId.trim() === '') {
      errors.push('กรุณาเลือกห้อง');
    }

    if (!form.date || form.date.trim() === '') {
      errors.push('กรุณาเลือกวันที่');
    }

    if (form.threeHourPrice === undefined && form.dailyPrice === undefined && form.monthlyPrice === undefined) {
      errors.push('กรุณากรอกราคาอย่างน้อย 1 ประเภท');
    }

    if (form.threeHourPrice !== undefined && form.threeHourPrice < 0) {
      errors.push('ราคา 3 ชั่วโมงต้องไม่ติดลบ');
    }

    if (form.dailyPrice !== undefined && form.dailyPrice < 0) {
      errors.push('ราคารายวันต้องไม่ติดลบ');
    }

    if (form.monthlyPrice !== undefined && form.monthlyPrice < 0) {
      errors.push('ราคารายเดือนต้องไม่ติดลบ');
    }

    this.formErrors.set(errors);
    return errors.length === 0;
  }

  submitAddPrice(): void {
    if (!this.validateForm()) {
      return;
    }

    this.submitting.set(true);
    const form = this.priceForm();

    this.roomPriceService.createRoomPrice(form).subscribe({
      next: (newPrice) => {
        this.roomPrices.update(prices => [...prices, newPrice]);
        this.closeAddModal();
        this.showSuccessToast('เพิ่มราคาห้องสำเร็จ');
        this.submitting.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'ไม่สามารถเพิ่มราคาห้องได้';
        this.formErrors.set([errorMsg]);
        this.submitting.set(false);
      }
    });
  }

  submitEditPrice(): void {
    if (!this.validateForm()) {
      return;
    }

    const roomPrice = this.selectedRoomPrice();
    if (!roomPrice) return;

    this.submitting.set(true);
    const form = this.priceForm();

    const updateDto: UpdateRoomPriceDto = {
      threeHourPrice: form.threeHourPrice,
      dailyPrice: form.dailyPrice,
      monthlyPrice: form.monthlyPrice
    };

    this.roomPriceService.updateRoomPrice(roomPrice.priceId, updateDto).subscribe({
      next: (updatedPrice) => {
        this.roomPrices.update(prices =>
          prices.map(p => p.priceId === updatedPrice.priceId ? updatedPrice : p)
        );
        this.closeEditModal();
        this.showSuccessToast('แก้ไขราคาห้องสำเร็จ');
        this.submitting.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'ไม่สามารถแก้ไขราคาห้องได้';
        this.formErrors.set([errorMsg]);
        this.submitting.set(false);
      }
    });
  }

  confirmDelete(): void {
    const roomPrice = this.selectedRoomPrice();
    if (!roomPrice) return;

    this.submitting.set(true);

    this.roomPriceService.deleteRoomPrice(roomPrice.priceId).subscribe({
      next: () => {
        this.roomPrices.update(prices => prices.filter(p => p.priceId !== roomPrice.priceId));
        this.closeDeleteModal();
        this.showSuccessToast('ลบราคาห้องสำเร็จ');
        this.submitting.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'ไม่สามารถลบราคาห้องได้';
        this.showErrorToast(errorMsg);
        this.closeDeleteModal();
        this.submitting.set(false);
      }
    });
  }

  getRoomNumber(roomId: string): string {
    const room = this.rooms().find(r => r.roomId === roomId);
    return room ? room.roomNumber : roomId;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined || price === null) {
      return '-';
    }
    return price.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ฿';
  }

  showSuccessToast(message: string): void {
    this.toastMessage.set(message);
    this.toastType.set('success');
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  showErrorToast(message: string): void {
    this.toastMessage.set(message);
    this.toastType.set('error');
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }
}
