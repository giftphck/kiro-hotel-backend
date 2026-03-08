export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
  INITIAL_PAYMENT = 'INITIAL_PAYMENT',
  REFUND = 'REFUND'
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export interface PaymentHistory {
  paymentId: string;
  bookingId: string;
  amount: number;
  priceType?: string;
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  remark?: string;
  createdAt: Date;
  createdBy?: string;
}

export interface CreatePaymentHistoryDto {
  bookingId: string;
  amount: number;
  priceType?: string;
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  remark?: string;
  createdBy?: string;
}
