export interface RevenueReport {
  period: string;  // e.g., "2026-04-08", "2026-04", "2026"
  totalRevenue: number;
  roomsSold: number;
  bookingCount: number;
  details?: RevenueDetail[];
}

export interface RevenueDetail {
  date: Date;
  revenue: number;
  bookings: number;
}
