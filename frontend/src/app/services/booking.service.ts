import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking, CreateBookingDto, BookingStatus } from '../models/booking.model';
import { PaymentHistory } from '../models/payment-history.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bookings`;

  getBookings(filters?: {
    roomId?: string;
    customerId?: string;
    bookingStatus?: BookingStatus;
    startDate?: string;
    endDate?: string;
  }): Observable<Booking[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.roomId) params = params.set('roomId', filters.roomId);
      if (filters.customerId) params = params.set('customerId', filters.customerId);
      if (filters.bookingStatus) params = params.set('bookingStatus', filters.bookingStatus);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }
    
    return this.http.get<Booking[]>(this.apiUrl, { params });
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  createBooking(booking: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  updateBookingStatus(id: string, bookingStatus: BookingStatus): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, { bookingStatus });
  }

  updateBooking(id: string, updates: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, updates);
  }

  cancelBooking(id: string): Observable<Booking> {
    return this.http.delete<Booking>(`${this.apiUrl}/${id}`);
  }

  getTodayCheckIns(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/today/checkin`);
  }

  getTodayCheckOuts(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/today/checkout`);
  }

  getPaymentHistory(bookingId: string): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(`${this.apiUrl}/${bookingId}/payments`);
  }
}
