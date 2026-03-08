import { Room } from './room.model';
import { Customer } from './customer.model';
import { Guest } from './guest.model';

export enum BookingType {
  THREE_HOUR = '3_HOUR',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY'
}

export enum BookingStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  bookingId: string;
  roomId: string;
  customerId: string;
  bookingType: BookingType;
  checkInDate: Date;
  checkOutDate: Date;
  actualCheckInAt?: Date;
  actualCheckOutAt?: Date;
  numberOfGuests: number;
  priceType: string;
  unitPrice: number;
  totalPrice: number;
  deposit: number;
  remark?: string;
  bookingStatus: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  room?: Room;
  customer?: Customer;
  guests?: Guest[];
}

export interface CreateBookingDto {
  roomId: string;
  customer: {
    name: string;
    phoneNumber: string;
    thaiIdCard: string;
  };
  bookingType: BookingType;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  priceType: string;
  unitPrice: number;
  totalPrice: number;
  calculatedPrice?: number;
  deposit: number;
  remark?: string;
  guests?: CreateGuestDto[];
}

export interface CreateGuestDto {
  guestName: string;
  idCardNumber: string;
}
