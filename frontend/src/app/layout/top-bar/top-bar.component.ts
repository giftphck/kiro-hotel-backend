import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  @Output() bookingClick = new EventEmitter<void>();
  @Output() menuToggle = new EventEmitter<void>();

  notificationCount = 3;

  onBookingClick() {
    this.bookingClick.emit();
  }

  onMenuToggle() {
    this.menuToggle.emit();
  }

  onNotificationClick() {
    // TODO: Implement notification display
    console.log('Notifications clicked');
  }

  onSettingsClick() {
    // TODO: Navigate to settings
    console.log('Settings clicked');
  }

  onProfileMenuClick(action: string) {
    console.log('Profile action:', action);
  }
}
