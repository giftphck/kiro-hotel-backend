import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  private customerService = inject(CustomerService);

  // Signals
  customers = signal<Customer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Modal states
  showAddModal = signal(false);
  showEditModal = signal(false);
  selectedCustomer = signal<Customer | null>(null);
  
  // Form data
  customerForm = signal<CreateCustomerDto>({
    name: '',
    phoneNumber: '',
    thaiIdCard: ''
  });
  
  formErrors = signal<string[]>([]);
  submitting = signal(false);
  
  // Toast
  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading.set(true);
    this.error.set(null);
    
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.error.set('ไม่สามารถโหลดข้อมูลลูกค้าได้');
        this.loading.set(false);
      }
    });
  }

  // Add Modal
  openAddModal() {
    this.customerForm.set({
      name: '',
      phoneNumber: '',
      thaiIdCard: ''
    });
    this.formErrors.set([]);
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.customerForm.set({
      name: '',
      phoneNumber: '',
      thaiIdCard: ''
    });
    this.formErrors.set([]);
  }

  submitAddCustomer() {
    const errors = this.validateForm();
    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.submitting.set(true);
    this.customerService.createCustomer(this.customerForm()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeAddModal();
        this.loadCustomers();
        this.displayToast('เพิ่มลูกค้าสำเร็จ', 'success');
      },
      error: (err) => {
        this.submitting.set(false);
        const errorMsg = err.error?.message || 'ไม่สามารถเพิ่มลูกค้าได้';
        this.formErrors.set([errorMsg]);
      }
    });
  }

  // Edit Modal
  openEditModal(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.customerForm.set({
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      thaiIdCard: customer.thaiIdCard
    });
    this.formErrors.set([]);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedCustomer.set(null);
    this.customerForm.set({
      name: '',
      phoneNumber: '',
      thaiIdCard: ''
    });
    this.formErrors.set([]);
  }

  submitEditCustomer() {
    const customer = this.selectedCustomer();
    if (!customer) return;

    const errors = this.validateForm();
    if (errors.length > 0) {
      this.formErrors.set(errors);
      return;
    }

    this.submitting.set(true);
    const updateData: UpdateCustomerDto = {
      name: this.customerForm().name,
      phoneNumber: this.customerForm().phoneNumber,
      thaiIdCard: this.customerForm().thaiIdCard
    };

    this.customerService.updateCustomer(customer.customerId, updateData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeEditModal();
        this.loadCustomers();
        this.displayToast('แก้ไขลูกค้าสำเร็จ', 'success');
      },
      error: (err) => {
        this.submitting.set(false);
        const errorMsg = err.error?.message || 'ไม่สามารถแก้ไขลูกค้าได้';
        this.formErrors.set([errorMsg]);
      }
    });
  }

  // Validation
  validateForm(): string[] {
    const errors: string[] = [];
    const form = this.customerForm();

    if (!form.name || form.name.trim() === '') {
      errors.push('กรุณากรอกชื่อ-นามสกุล');
    }

    if (!form.phoneNumber || form.phoneNumber.trim() === '') {
      errors.push('กรุณากรอกเบอร์โทรศัพท์');
    } else if (!/^[0-9]{9,10}$/.test(form.phoneNumber)) {
      errors.push('เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก');
    }

    if (!form.thaiIdCard || form.thaiIdCard.trim() === '') {
      errors.push('กรุณากรอกเลขบัตรประชาชน');
    } else if (!/^[0-9]{13}$/.test(form.thaiIdCard)) {
      errors.push('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
    }

    return errors;
  }

  // Toast
  displayToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
