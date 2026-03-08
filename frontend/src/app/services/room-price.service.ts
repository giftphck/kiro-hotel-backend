import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomPrice, CreateRoomPriceDto, UpdateRoomPriceDto } from '../models/room-price.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomPriceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/room-prices`;

  getRoomPrices(): Observable<RoomPrice[]> {
    return this.http.get<RoomPrice[]>(this.apiUrl);
  }

  getRoomPriceById(priceId: string): Observable<RoomPrice> {
    return this.http.get<RoomPrice>(`${this.apiUrl}/${priceId}`);
  }

  getRoomPriceByRoomAndDate(roomId: string, date: string): Observable<RoomPrice> {
    return this.http.get<RoomPrice>(`${this.apiUrl}/room/${roomId}/date/${date}`);
  }

  createRoomPrice(roomPrice: CreateRoomPriceDto): Observable<RoomPrice> {
    return this.http.post<RoomPrice>(this.apiUrl, roomPrice);
  }

  updateRoomPrice(priceId: string, roomPrice: UpdateRoomPriceDto): Observable<RoomPrice> {
    return this.http.put<RoomPrice>(`${this.apiUrl}/${priceId}`, roomPrice);
  }

  deleteRoomPrice(priceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${priceId}`);
  }
}
