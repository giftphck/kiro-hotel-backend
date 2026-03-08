import { Routes } from '@angular/router';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { RoomBoardComponent } from './pages/room-board/room-board.component';
import { RoomPriceManagementComponent } from './pages/room-prices/room-price-management.component';
import { RevenueReportComponent } from './pages/reports/revenue-report.component';

export const routes: Routes = [
  { path: '', redirectTo: '/room-board', pathMatch: 'full' },
  { path: 'room-board', component: RoomBoardComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'room-prices', component: RoomPriceManagementComponent },
  { path: 'reports', component: RevenueReportComponent }
];
