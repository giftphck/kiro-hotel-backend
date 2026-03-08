import { BookingRepository } from '../repositories/booking.repository';
import { RevenueReport } from '../models/report.model';
import { BookingStatus } from '../models/booking.model';

export class ReportService {
  private bookingRepository: BookingRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  /**
   * Get daily revenue report for a specific date
   * @param date - The date to generate report for
   * @returns RevenueReport with totalRevenue, roomsSold, bookingCount
   */
  async getDailyRevenue(date: Date): Promise<RevenueReport> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.bookingRepository.getBookings({
      status: BookingStatus.CHECKED_OUT,
      checkOutDateStart: startOfDay,
      checkOutDateEnd: endOfDay
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.deposit), 0);
    const roomsSold = new Set(bookings.map(booking => booking.roomId)).size;
    const bookingCount = bookings.length;

    const period = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    return {
      period,
      totalRevenue,
      roomsSold,
      bookingCount
    };
  }

  /**
   * Get monthly revenue report for a specific month
   * @param year - The year (e.g., 2026)
   * @param month - The month (1-12)
   * @returns RevenueReport with totalRevenue, roomsSold, bookingCount
   */
  async getMonthlyRevenue(year: number, month: number): Promise<RevenueReport> {
    // Validate month
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const bookings = await this.bookingRepository.getBookings({
      status: BookingStatus.CHECKED_OUT,
      checkOutDateStart: startOfMonth,
      checkOutDateEnd: endOfMonth
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.deposit), 0);
    const roomsSold = new Set(bookings.map(booking => booking.roomId)).size;
    const bookingCount = bookings.length;

    const period = `${year}-${String(month).padStart(2, '0')}`; // YYYY-MM format

    return {
      period,
      totalRevenue,
      roomsSold,
      bookingCount
    };
  }

  /**
   * Get yearly revenue report for a specific year
   * @param year - The year (e.g., 2026)
   * @returns RevenueReport with totalRevenue, roomsSold, bookingCount
   */
  async getYearlyRevenue(year: number): Promise<RevenueReport> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const bookings = await this.bookingRepository.getBookings({
      status: BookingStatus.CHECKED_OUT,
      checkOutDateStart: startOfYear,
      checkOutDateEnd: endOfYear
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.deposit), 0);
    const roomsSold = new Set(bookings.map(booking => booking.roomId)).size;
    const bookingCount = bookings.length;

    const period = String(year); // YYYY format

    return {
      period,
      totalRevenue,
      roomsSold,
      bookingCount
    };
  }
}

export default new ReportService();
