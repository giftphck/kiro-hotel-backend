# Bootstrap Configuration for Hotel Front Desk Management System

## Overview

This Angular project uses **Bootstrap 5.3.8** and **@ng-bootstrap/ng-bootstrap 20.0.0** for UI components instead of Angular Material as originally planned.

## Installed Packages

- `bootstrap@5.3.8` - Bootstrap CSS framework
- `@ng-bootstrap/ng-bootstrap@20.0.0` - Angular-powered Bootstrap widgets
- `date-fns@4.1.0` - Date utility library for date handling

## Configuration

### 1. Angular Configuration (angular.json)

Bootstrap CSS and JavaScript are included in the build configuration:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

### 2. App Configuration (app.config.ts)

The app is configured with necessary providers:

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations() // Required for ng-bootstrap components
  ]
};
```

### 3. Custom Theme (styles.scss)

Custom CSS variables define the hotel management color scheme:

#### Color Palette

- **Primary Blue**: `#64B5F6` (buttons, active states)
- **Status Colors**:
  - Available (Green): `#81C784`
  - Occupied (Red-Orange): `#E57373`
  - Reserved (Yellow-Orange): `#FFB74D`
  - Cleaning (Yellow): `#FFD54F`
- **Background Colors**:
  - Sidebar: Light blue gradient (`#E3F2FD` to `#BBDEFB`)
  - Main content: White (`#FFFFFF`)
  - Light background: `#F5F5F5`

#### Design Features

- **Rounded Corners**: All components use border-radius (8px, 12px, 16px)
- **Soft Shadows**: Multiple shadow levels for depth
- **Smooth Transitions**: 0.3s ease transitions on interactive elements
- **Custom Scrollbar**: Styled scrollbars matching the theme

## Using ng-bootstrap Components

### Importing Components

For standalone components (Angular 15+), import ng-bootstrap components directly:

```typescript
import { Component } from '@angular/core';
import { NgbModal, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgbDatepicker],
  template: `...`
})
export class ExampleComponent {
  constructor(private modalService: NgbModal) {}
}
```

### Available ng-bootstrap Components

- **NgbModal** - Modal dialogs
- **NgbDatepicker** - Date picker component
- **NgbDropdown** - Dropdown menus
- **NgbToast** - Toast notifications
- **NgbAlert** - Alert messages
- **NgbAccordion** - Accordion panels
- **NgbCarousel** - Image carousels
- **NgbPagination** - Pagination controls
- **NgbProgressbar** - Progress bars
- **NgbTooltip** - Tooltips
- **NgbPopover** - Popovers
- **NgbTypeahead** - Autocomplete

## Custom Utility Classes

The following utility classes are available globally:

### Shadow Classes
- `.shadow-soft` - Subtle shadow
- `.shadow-medium` - Medium shadow

### Border Radius Classes
- `.rounded-soft` - 8px radius
- `.rounded-medium` - 12px radius
- `.rounded-large` - 16px radius

### Status Color Classes
- `.status-available` - Green background with white text
- `.status-occupied` - Red-orange background with white text
- `.status-reserved` - Yellow-orange background with white text
- `.status-cleaning` - Yellow background with dark text

### Gradient Classes
- `.bg-gradient-blue` - Blue gradient background
- `.bg-gradient-sidebar` - Sidebar gradient background

### Text Color Classes
- `.text-primary-blue` - Primary blue text color

### Animation Classes
- `.transition-all` - Smooth transitions on all properties
- `.fade-in` - Fade in animation

## Bootstrap Grid System

Use Bootstrap's responsive grid system:

```html
<div class="container">
  <div class="row">
    <div class="col-md-6">Left column</div>
    <div class="col-md-6">Right column</div>
  </div>
</div>
```

## Responsive Breakpoints

Bootstrap breakpoints:
- `xs`: < 576px
- `sm`: ≥ 576px
- `md`: ≥ 768px
- `lg`: ≥ 992px
- `xl`: ≥ 1200px
- `xxl`: ≥ 1400px

## Example: Creating a Modal

```typescript
import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">จองห้องพัก</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <!-- Form content -->
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary">ยืนยันการจอง</button>
    </div>
  `
})
export class BookingModalComponent {
  activeModal = inject(NgbModal);
}
```

## Example: Using Date Picker

```typescript
import { Component } from '@angular/core';
import { NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker-example',
  standalone: true,
  imports: [NgbDatepicker, FormsModule],
  template: `
    <div class="form-group">
      <label>เลือกวันที่</label>
      <input 
        class="form-control" 
        placeholder="yyyy-mm-dd"
        name="dp" 
        [(ngModel)]="model" 
        ngbDatepicker 
        #d="ngbDatepicker"
      >
      <button class="btn btn-outline-secondary" (click)="d.toggle()">
        <i class="bi bi-calendar"></i>
      </button>
    </div>
  `
})
export class DatePickerExampleComponent {
  model: any;
}
```

## Thai Language Support

The UI primarily uses Thai language with some English labels:

- Menu items: "แดชบอร์ด", "ห้องพัก", "ราคาห้อง", "รายงาน", "ตั้งค่า"
- Buttons: "จองห้องพัก", "ค้นหา", "ออกจากระบบ"
- Status labels: "ว่าง", "เข้าพัก", "จองแล้ว", "Cleaning"
- Sections: "Check-out วันนี้", "Check-in วันนี้"

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode for development
npm run watch
```

## Resources

- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [ng-bootstrap Documentation](https://ng-bootstrap.github.io/)
- [Angular Documentation](https://angular.dev/)
- [date-fns Documentation](https://date-fns.org/)
