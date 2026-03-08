export interface Guest {
  guestId: string;
  bookingId: string;
  guestName: string;
  idCardNumber: string;
  createdAt: Date;
}

export interface CreateGuestDto {
  guestName: string;
  idCardNumber: string;
}
