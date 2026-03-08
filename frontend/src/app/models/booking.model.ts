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
  checkInDate: Date | string;
  checkOutDate: Date | string;
  actualCheckInAt?: Date | string;
  actualCheckOutAt?: Date | string;
  numberOfGuests: number;
  priceType: string;
  unitPrice: number;
  totalPrice: number;
  deposit: number;
  remark?: string;
  bookingStatus: BookingStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Populated fields from JOIN
  roomNumber?: string;
  roomStatus?: string;
  roomType?: string;
  customerName?: string;
  customerPhone?: string;
  customerThaiId?: string;
}

export interface CreateBookingDto {
  roomId: string;
  customer: {
    name: string;
    phoneNumber: string;
    thaiIdCard: string;
  };
  bookingType: BookingType;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  numberOfGuests: number;
  priceType: string;
  unitPrice: number;
  totalPrice: number;
  deposit: number;
  remark?: string;
}
