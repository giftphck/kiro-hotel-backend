import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomStatus } from '../models/room.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  createRoom(roomNumber: string, roomType: string, roomStatus?: RoomStatus): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, { roomNumber, roomType, roomStatus });
  }

  updateRoom(id: string, roomNumber: string, roomType: string): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, { roomNumber, roomType });
  }

  updateRoomStatus(id: string, status: RoomStatus): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteRoom(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
