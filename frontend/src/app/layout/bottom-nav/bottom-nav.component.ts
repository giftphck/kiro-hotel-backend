import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    { label: 'ห้องพัก', icon: 'meeting_room', route: '/room-board' },
    { label: 'ราคา', icon: 'attach_money', route: '/room-prices' },
    { label: 'รายงาน', icon: 'assessment', route: '/reports' },
    { label: 'ตั้งค่า', icon: 'settings', route: '/settings' }
  ];
}
