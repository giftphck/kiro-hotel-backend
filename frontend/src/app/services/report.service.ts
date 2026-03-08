import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RevenueReport } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  /**
   * Get daily revenue report for a specific date
   * @param date - The date to generate report for
   * @returns RevenueReport with totalRevenue, roomsSold, bookingCount
   */
  getDailyRevenue(date: Date): Observable<RevenueReport> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const params = new HttpParams().set('date', dateStr);
    return this.http.get<RevenueReport>(`${this.apiUrl}/revenue/daily`, { params });
  }

  /**
   * Get monthly revenue report for a specific month
   * @param year - The year (e.g., 2026)
   * @param month - The month (1-12)
   * @returns RevenueReport with totalRevenue, roomsSold, bookingCount
   */
  getMonthlyRevenue(year: number, month: number): Observable<RevenueReport> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<RevenueReport>(`${this.apiUrl}/revenue/monthly`, { params });
  }

  /**
   * Get yearly revenue report for a specific year
   * @param year - The year (e.g., 2026)
   * @returns RevenueReport with totalRevenue, roomsSold, bookingCount
   */
  getYearlyRevenue(year: number): Observable<RevenueReport> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<RevenueReport>(`${this.apiUrl}/revenue/yearly`, { params });
  }
}
