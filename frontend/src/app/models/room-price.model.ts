export interface RoomPrice {
  priceId: string;
  roomId: string;
  roomNumber?: string;
  date: Date | string;
  threeHourPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomPriceDto {
  roomId: string;
  date: string;
  threeHourPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
}

export interface UpdateRoomPriceDto {
  threeHourPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
}
