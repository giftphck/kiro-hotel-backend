export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING'
}

export interface Room {
  roomId: string;
  roomNumber: string;
  roomStatus: RoomStatus;
  roomType?: string;
  createdAt: Date;
  updatedAt: Date;
}
