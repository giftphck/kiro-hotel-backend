import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { Room, RoomStatus } from '../../models/room.model';

interface RoomForm {
  roomNumber: string;
  roomType: string;
  roomStatus: RoomStatus;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  
  // Signals for reactive state management
  rooms = signal<Room[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Modal signals
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  selectedRoom = signal<Room | null>(null);
  
  // Form signals
  roomForm = signal<RoomForm>({
    roomNumber: '',
    roomType: 'Standard',
    roomStatus: RoomStatus.AVAILABLE
  });
  formErrors = signal<string[]>([]);
  submitting = signal(false);
  
  // Toast signals
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);
  
  // Room statuses for dropdown
  roomStatuses = Object.values(RoomStatus);
  
  // Room types
  roomTypes = ['Standard', 'Deluxe', 'Suite'];
  
  // Computed signal for room count
  roomCount = computed(() => this.rooms().length);
  
  ngOnInit(): void {
    this.loadRooms();
  }
  
  loadRooms(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('ไม่สามารถโหลดข้อมูลห้องพักได้');
        this.loading.set(false);
        console.error('Error loading rooms:', err);
      }
    });
  }
  
  openAddModal(): void {
    this.roomForm.set({
      roomNumber: '',
      roomType: 'Standard',
      roomStatus: RoomStatus.AVAILABLE
    });
    this.formErrors.set([]);
    this.showAddModal.set(true);
  }
  
  closeAddModal(): void {
    this.showAddModal.set(false);
    this.roomForm.set({
      roomNumber: '',
      roomType: 'Standard',
      roomStatus: RoomStatus.AVAILABLE
    });
    this.formErrors.set([]);
  }
  
  openEditModal(room: Room): void {
    this.selectedRoom.set(room);
    this.roomForm.set({
      roomNumber: room.roomNumber,
      roomType: room.roomType || 'Standard',
      roomStatus: room.roomStatus
    });
    this.formErrors.set([]);
    this.showEditModal.set(true);
  }
  
  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedRoom.set(null);
    this.roomForm.set({
      roomNumber: '',
      roomType: 'Standard',
      roomStatus: RoomStatus.AVAILABLE
    });
    this.formErrors.set([]);
  }
  
  openDeleteModal(room: Room): void {
    this.selectedRoom.set(room);
    this.showDeleteModal.set(true);
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedRoom.set(null);
  }
  
  validateForm(): boolean {
    const errors: string[] = [];
    const form = this.roomForm();
    
    if (!form.roomNumber || form.roomNumber.trim() === '') {
      errors.push('กรุณากรอกหมายเลขห้อง');
    }
    
    if (!form.roomType || form.roomType.trim() === '') {
      errors.push('กรุณาเลือกประเภทห้อง');
    }
    
    this.formErrors.set(errors);
    return errors.length === 0;
  }
  
  submitAddRoom(): void {
    if (!this.validateForm()) {
      return;
    }
    
    this.submitting.set(true);
    const form = this.roomForm();
    
    this.roomService.createRoom(form.roomNumber, form.roomType, form.roomStatus).subscribe({
      next: (newRoom) => {
        this.rooms.update(rooms => [...rooms, newRoom].sort((a, b) => 
          a.roomNumber.localeCompare(b.roomNumber)
        ));
        this.closeAddModal();
        this.showSuccessToast('เพิ่มห้องพักสำเร็จ');
        this.submitting.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'ไม่สามารถเพิ่มห้องพักได้';
        this.formErrors.set([errorMsg]);
        this.submitting.set(false);
      }
    });
  }
  
  submitEditRoom(): void {
    if (!this.validateForm()) {
      return;
    }
    
    const room = this.selectedRoom();
    if (!room) return;
    
    this.submitting.set(true);
    const form = this.roomForm();
    
    this.roomService.updateRoom(room.roomId, form.roomNumber, form.roomType).subscribe({
      next: (updatedRoom) => {
        this.rooms.update(rooms => 
          rooms.map(r => r.roomId === updatedRoom.roomId ? updatedRoom : r)
            .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
        );
        this.closeEditModal();
        this.showSuccessToast('แก้ไขห้องพักสำเร็จ');
        this.submitting.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'ไม่สามารถแก้ไขห้องพักได้';
        this.formErrors.set([errorMsg]);
        this.submitting.set(false);
      }
    });
  }
  
  confirmDelete(): void {
    const room = this.selectedRoom();
    if (!room) return;
    
    this.submitting.set(true);
    
    this.roomService.deleteRoom(room.roomId).subscribe({
      next: () => {
        this.rooms.update(rooms => rooms.filter(r => r.roomId !== room.roomId));
        this.closeDeleteModal();
        this.showSuccessToast('ลบห้องพักสำเร็จ');
        this.submitting.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'ไม่สามารถลบห้องพักได้';
        this.showErrorToast(errorMsg);
        this.closeDeleteModal();
        this.submitting.set(false);
      }
    });
  }
  
  updateRoomStatus(room: Room, newStatus: RoomStatus): void {
    this.roomService.updateRoomStatus(room.roomId, newStatus).subscribe({
      next: (updatedRoom) => {
        // Update the room in the signal array
        this.rooms.update(rooms => 
          rooms.map(r => r.roomId === updatedRoom.roomId ? updatedRoom : r)
        );
        this.showSuccessToast('อัพเดทสถานะห้องพักสำเร็จ');
      },
      error: (err) => {
        this.showErrorToast('ไม่สามารถอัพเดทสถานะห้องพักได้');
        console.error('Error updating room status:', err);
      }
    });
  }
  
  getStatusBadgeClass(status: RoomStatus): string {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return 'badge bg-success';
      case RoomStatus.OCCUPIED:
        return 'badge bg-danger';
      case RoomStatus.RESERVED:
        return 'badge bg-warning';
      case RoomStatus.CLEANING:
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  }
  
  getStatusLabel(status: RoomStatus): string {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return 'ว่าง';
      case RoomStatus.OCCUPIED:
        return 'มีผู้เข้าพัก';
      case RoomStatus.RESERVED:
        return 'จอง';
      case RoomStatus.CLEANING:
        return 'ทำความสะอาด';
      default:
        return status;
    }
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
