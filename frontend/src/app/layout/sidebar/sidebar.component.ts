import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/room-board' },
    { label: 'ห้อง', icon: 'meeting_room', route: '/rooms' },
    { label: 'ห้องพัก', icon: 'attach_money', route: '/room-board' },
    { label: 'รายงาน', icon: 'assessment', route: '/reports' },
    { label: 'ตั้งค่า', icon: 'settings', route: '/settings' }
  ];

  adminName = 'Admin User';

  logout() {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
  }
}
