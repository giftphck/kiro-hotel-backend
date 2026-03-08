import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoomPriceManagementComponent } from './room-price-management.component';
import { RoomPriceService } from '../../services/room-price.service';
import { RoomService } from '../../services/room.service';
import { RoomPrice } from '../../models/room-price.model';
import { Room, RoomStatus } from '../../models/room.model';

describe('RoomPriceManagementComponent', () => {
  let component: RoomPriceManagementComponent;
  let fixture: ComponentFixture<RoomPriceManagementComponent>;
  let mockRoomPriceService: any;
  let mockRoomService: any;

  const mockRooms: Room[] = [
    {
      roomId: 'room-1',
      roomNumber: '101',
      roomStatus: RoomStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      roomId: 'room-2',
      roomNumber: '102',
      roomStatus: RoomStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockRoomPrices: RoomPrice[] = [
    {
      priceId: 'price-1',
      roomId: 'room-1',
      date: '2024-01-15',
      threeHourPrice: 500,
      dailyPrice: 1000,
      monthlyPrice: 20000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      priceId: 'price-2',
      roomId: 'room-2',
      date: '2024-01-15',
      threeHourPrice: 600,
      dailyPrice: 1200,
      monthlyPrice: 24000,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    mockRoomPriceService = {
      getRoomPrices: vi.fn(),
      createRoomPrice: vi.fn(),
      updateRoomPrice: vi.fn(),
      deleteRoomPrice: vi.fn()
    };

    mockRoomService = {
      getRooms: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RoomPriceManagementComponent],
      providers: [
        { provide: RoomPriceService, useValue: mockRoomPriceService },
        { provide: RoomService, useValue: mockRoomService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoomPriceManagementComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load room prices and rooms on init', () => {
      mockRoomPriceService.getRoomPrices.mockReturnValue(of(mockRoomPrices));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));

      fixture.detectChanges();

      expect(mockRoomPriceService.getRoomPrices).toHaveBeenCalled();
      expect(mockRoomService.getRooms).toHaveBeenCalled();
      expect(component.roomPrices()).toEqual(mockRoomPrices);
      expect(component.rooms()).toEqual(mockRooms);
      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading room prices fails', () => {
      const errorResponse = { error: 'Failed to load' };
      mockRoomPriceService.getRoomPrices.mockReturnValue(throwError(() => errorResponse));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));

      fixture.detectChanges();

      expect(component.error()).toBe('ไม่สามารถโหลดข้อมูลราคาห้องได้');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Create Room Price', () => {
    beforeEach(() => {
      mockRoomPriceService.getRoomPrices.mockReturnValue(of(mockRoomPrices));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));
      fixture.detectChanges();
    });

    it('should open add modal with default values', () => {
      component.openAddModal();

      expect(component.showAddModal()).toBe(true);
      expect(component.priceForm().roomId).toBe('');
      expect(component.priceForm().date).toBeTruthy();
      expect(component.formErrors()).toEqual([]);
    });

    it('should create room price with valid data', () => {
      const newPrice: RoomPrice = {
        priceId: 'price-3',
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: 550,
        dailyPrice: 1100,
        monthlyPrice: 22000,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRoomPriceService.createRoomPrice.mockReturnValue(of(newPrice));

      component.openAddModal();
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: 550,
        dailyPrice: 1100,
        monthlyPrice: 22000
      });

      component.submitAddPrice();

      expect(mockRoomPriceService.createRoomPrice).toHaveBeenCalledWith({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: 550,
        dailyPrice: 1100,
        monthlyPrice: 22000
      });
      expect(component.roomPrices().length).toBe(3);
      expect(component.showAddModal()).toBe(false);
      expect(component.toastType()).toBe('success');
    });

    it('should validate required fields before creating', () => {
      component.openAddModal();
      component.priceForm.set({
        roomId: '',
        date: '',
        threeHourPrice: undefined,
        dailyPrice: undefined,
        monthlyPrice: undefined
      });

      component.submitAddPrice();

      expect(mockRoomPriceService.createRoomPrice).not.toHaveBeenCalled();
      expect(component.formErrors().length).toBeGreaterThan(0);
      expect(component.formErrors()).toContain('กรุณาเลือกห้อง');
      expect(component.formErrors()).toContain('กรุณาเลือกวันที่');
      expect(component.formErrors()).toContain('กรุณากรอกราคาอย่างน้อย 1 ประเภท');
    });

    it('should validate negative prices', () => {
      component.openAddModal();
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: -100,
        dailyPrice: -500,
        monthlyPrice: -10000
      });

      component.submitAddPrice();

      expect(mockRoomPriceService.createRoomPrice).not.toHaveBeenCalled();
      expect(component.formErrors()).toContain('ราคา 3 ชั่วโมงต้องไม่ติดลบ');
      expect(component.formErrors()).toContain('ราคารายวันต้องไม่ติดลบ');
      expect(component.formErrors()).toContain('ราคารายเดือนต้องไม่ติดลบ');
    });

    it('should handle unique constraint violation (room + date combination)', () => {
      const errorResponse = {
        error: { error: 'ราคาสำหรับห้องและวันที่นี้มีอยู่แล้ว' }
      };
      mockRoomPriceService.createRoomPrice.mockReturnValue(throwError(() => errorResponse));

      component.openAddModal();
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-15',
        threeHourPrice: 500,
        dailyPrice: 1000,
        monthlyPrice: 20000
      });

      component.submitAddPrice();

      expect(component.formErrors()).toContain('ราคาสำหรับห้องและวันที่นี้มีอยู่แล้ว');
      expect(component.showAddModal()).toBe(true);
      expect(component.submitting()).toBe(false);
    });

    it('should handle API failure when creating room price', () => {
      const errorResponse = { error: { error: 'Server error' } };
      mockRoomPriceService.createRoomPrice.mockReturnValue(throwError(() => errorResponse));

      component.openAddModal();
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: 550,
        dailyPrice: 1100,
        monthlyPrice: 22000
      });

      component.submitAddPrice();

      expect(component.formErrors()).toContain('Server error');
      expect(component.showAddModal()).toBe(true);
    });

    it('should close add modal and reset form', () => {
      component.openAddModal();
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: 550,
        dailyPrice: 1100,
        monthlyPrice: 22000
      });

      component.closeAddModal();

      expect(component.showAddModal()).toBe(false);
      expect(component.priceForm().roomId).toBe('');
      expect(component.priceForm().date).toBe('');
      expect(component.formErrors()).toEqual([]);
    });
  });

  describe('Update Room Price', () => {
    beforeEach(() => {
      mockRoomPriceService.getRoomPrices.mockReturnValue(of(mockRoomPrices));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));
      fixture.detectChanges();
    });

    it('should open edit modal with existing price data', () => {
      const priceToEdit = mockRoomPrices[0];
      component.openEditModal(priceToEdit);

      expect(component.showEditModal()).toBe(true);
      expect(component.selectedRoomPrice()).toEqual(priceToEdit);
      expect(component.priceForm().roomId).toBe(priceToEdit.roomId);
      expect(component.priceForm().threeHourPrice).toBe(priceToEdit.threeHourPrice);
      expect(component.priceForm().dailyPrice).toBe(priceToEdit.dailyPrice);
      expect(component.priceForm().monthlyPrice).toBe(priceToEdit.monthlyPrice);
    });

    it('should update room price with valid data', () => {
      const priceToEdit = mockRoomPrices[0];
      const updatedPrice: RoomPrice = {
        ...priceToEdit,
        threeHourPrice: 600,
        dailyPrice: 1200,
        monthlyPrice: 24000
      };

      mockRoomPriceService.updateRoomPrice.mockReturnValue(of(updatedPrice));

      component.openEditModal(priceToEdit);
      component.priceForm.set({
        roomId: priceToEdit.roomId,
        date: '2024-01-15',
        threeHourPrice: 600,
        dailyPrice: 1200,
        monthlyPrice: 24000
      });

      component.submitEditPrice();

      expect(mockRoomPriceService.updateRoomPrice).toHaveBeenCalledWith(
        priceToEdit.priceId,
        {
          threeHourPrice: 600,
          dailyPrice: 1200,
          monthlyPrice: 24000
        }
      );
      expect(component.showEditModal()).toBe(false);
      expect(component.toastType()).toBe('success');
    });

    it('should update room prices list after successful update', () => {
      const priceToEdit = mockRoomPrices[0];
      const updatedPrice: RoomPrice = {
        ...priceToEdit,
        threeHourPrice: 600
      };

      mockRoomPriceService.updateRoomPrice.mockReturnValue(of(updatedPrice));

      component.openEditModal(priceToEdit);
      component.priceForm.update(form => ({ ...form, threeHourPrice: 600 }));

      component.submitEditPrice();

      const updatedPriceInList = component.roomPrices().find(p => p.priceId === priceToEdit.priceId);
      expect(updatedPriceInList?.threeHourPrice).toBe(600);
    });

    it('should validate form before updating', () => {
      const priceToEdit = mockRoomPrices[0];
      component.openEditModal(priceToEdit);
      component.priceForm.set({
        roomId: '',
        date: '',
        threeHourPrice: undefined,
        dailyPrice: undefined,
        monthlyPrice: undefined
      });

      component.submitEditPrice();

      expect(mockRoomPriceService.updateRoomPrice).not.toHaveBeenCalled();
      expect(component.formErrors().length).toBeGreaterThan(0);
    });

    it('should handle API failure when updating room price', () => {
      const priceToEdit = mockRoomPrices[0];
      const errorResponse = { error: { error: 'Update failed' } };
      mockRoomPriceService.updateRoomPrice.mockReturnValue(throwError(() => errorResponse));

      component.openEditModal(priceToEdit);
      component.priceForm.update(form => ({ ...form, threeHourPrice: 600 }));

      component.submitEditPrice();

      expect(component.formErrors()).toContain('Update failed');
      expect(component.showEditModal()).toBe(true);
    });

    it('should close edit modal and reset form', () => {
      const priceToEdit = mockRoomPrices[0];
      component.openEditModal(priceToEdit);

      component.closeEditModal();

      expect(component.showEditModal()).toBe(false);
      expect(component.selectedRoomPrice()).toBeNull();
      expect(component.priceForm().roomId).toBe('');
      expect(component.formErrors()).toEqual([]);
    });
  });

  describe('Delete Room Price', () => {
    beforeEach(() => {
      mockRoomPriceService.getRoomPrices.mockReturnValue(of(mockRoomPrices));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));
      fixture.detectChanges();
    });

    it('should open delete confirmation modal', () => {
      const priceToDelete = mockRoomPrices[0];
      component.openDeleteModal(priceToDelete);

      expect(component.showDeleteModal()).toBe(true);
      expect(component.selectedRoomPrice()).toEqual(priceToDelete);
    });

    it('should delete room price with confirmation', () => {
      const priceToDelete = mockRoomPrices[0];
      mockRoomPriceService.deleteRoomPrice.mockReturnValue(of(void 0));

      component.openDeleteModal(priceToDelete);
      const initialCount = component.roomPrices().length;

      component.confirmDelete();

      expect(mockRoomPriceService.deleteRoomPrice).toHaveBeenCalledWith(priceToDelete.priceId);
      expect(component.roomPrices().length).toBe(initialCount - 1);
      expect(component.roomPrices().find(p => p.priceId === priceToDelete.priceId)).toBeUndefined();
      expect(component.showDeleteModal()).toBe(false);
      expect(component.toastType()).toBe('success');
    });

    it('should handle API failure when deleting room price', () => {
      const priceToDelete = mockRoomPrices[0];
      const errorResponse = { error: { error: 'Delete failed' } };
      mockRoomPriceService.deleteRoomPrice.mockReturnValue(throwError(() => errorResponse));

      component.openDeleteModal(priceToDelete);
      const initialCount = component.roomPrices().length;

      component.confirmDelete();

      expect(component.roomPrices().length).toBe(initialCount);
      expect(component.showDeleteModal()).toBe(false);
      expect(component.toastType()).toBe('error');
    });

    it('should close delete modal without deleting', () => {
      const priceToDelete = mockRoomPrices[0];
      component.openDeleteModal(priceToDelete);

      component.closeDeleteModal();

      expect(component.showDeleteModal()).toBe(false);
      expect(component.selectedRoomPrice()).toBeNull();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockRoomPriceService.getRoomPrices.mockReturnValue(of(mockRoomPrices));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));
      fixture.detectChanges();
    });

    it('should validate that at least one price type is provided', () => {
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: undefined,
        dailyPrice: undefined,
        monthlyPrice: undefined
      });

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.formErrors()).toContain('กรุณากรอกราคาอย่างน้อย 1 ประเภท');
    });

    it('should accept form with only one price type', () => {
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: 500,
        dailyPrice: undefined,
        monthlyPrice: undefined
      });

      const isValid = component.validateForm();

      expect(isValid).toBe(true);
      expect(component.formErrors()).toEqual([]);
    });

    it('should validate missing room selection', () => {
      component.priceForm.set({
        roomId: '',
        date: '2024-01-20',
        threeHourPrice: 500,
        dailyPrice: 1000,
        monthlyPrice: 20000
      });

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.formErrors()).toContain('กรุณาเลือกห้อง');
    });

    it('should validate missing date', () => {
      component.priceForm.set({
        roomId: 'room-1',
        date: '',
        threeHourPrice: 500,
        dailyPrice: 1000,
        monthlyPrice: 20000
      });

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.formErrors()).toContain('กรุณาเลือกวันที่');
    });

    it('should allow zero prices', () => {
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: 0,
        dailyPrice: 0,
        monthlyPrice: 0
      });

      const isValid = component.validateForm();

      expect(isValid).toBe(true);
      expect(component.formErrors()).toEqual([]);
    });

    it('should reject negative prices', () => {
      component.priceForm.set({
        roomId: 'room-1',
        date: '2024-01-20',
        threeHourPrice: -100,
        dailyPrice: 1000,
        monthlyPrice: 20000
      });

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.formErrors()).toContain('ราคา 3 ชั่วโมงต้องไม่ติดลบ');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      mockRoomPriceService.getRoomPrices.mockReturnValue(of(mockRoomPrices));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));
      fixture.detectChanges();
    });

    it('should get room number by room ID', () => {
      const roomNumber = component.getRoomNumber('room-1');
      expect(roomNumber).toBe('101');
    });

    it('should return room ID if room not found', () => {
      const roomNumber = component.getRoomNumber('non-existent');
      expect(roomNumber).toBe('non-existent');
    });

    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = component.formatDate(date);
      expect(formatted).toBeTruthy();
    });

    it('should format date for input field', () => {
      const date = new Date('2024-01-15');
      const formatted = component.formatDateForInput(date);
      expect(formatted).toBe('2024-01-15');
    });

    it('should format price with Thai locale', () => {
      const formatted = component.formatPrice(1000);
      expect(formatted).toContain('1,000.00');
      expect(formatted).toContain('฿');
    });

    it('should format undefined price as dash', () => {
      const formatted = component.formatPrice(undefined);
      expect(formatted).toBe('-');
    });
  });

  describe('Toast Notifications', () => {
    beforeEach(() => {
      mockRoomPriceService.getRoomPrices.mockReturnValue(of(mockRoomPrices));
      mockRoomService.getRooms.mockReturnValue(of(mockRooms));
      fixture.detectChanges();
    });

    it('should show success toast', () => {
      component.showSuccessToast('Success message');

      expect(component.showToast()).toBe(true);
      expect(component.toastMessage()).toBe('Success message');
      expect(component.toastType()).toBe('success');
    });

    it('should show error toast', () => {
      component.showErrorToast('Error message');

      expect(component.showToast()).toBe(true);
      expect(component.toastMessage()).toBe('Error message');
      expect(component.toastType()).toBe('error');
    });
  });
});
