export interface RoomPrice {
  priceId: string;
  roomId: string;
  date: Date;
  threeHourPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}
