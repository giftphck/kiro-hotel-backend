import customerRepository, { CreateCustomerDto, UpdateCustomerDto } from '../repositories/customer.repository';
import { Customer } from '../models/customer.model';

export class CustomerService {
  /**
   * Get all customers
   */
  async getCustomers(): Promise<Customer[]> {
    return await customerRepository.getAllCustomers();
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    const customer = await customerRepository.getCustomerById(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData: CreateCustomerDto): Promise<Customer> {
    // Validate required fields
    if (!customerData.name || !customerData.phoneNumber || !customerData.thaiIdCard) {
      throw new Error('Name, phone number, and Thai ID card are required');
    }

    // Check if Thai ID card already exists
    const existingCustomer = await customerRepository.findCustomerByThaiId(customerData.thaiIdCard);
    if (existingCustomer) {
      throw new Error('Customer with this Thai ID card already exists');
    }

    return await customerRepository.createCustomer(customerData);
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerId: string, customerData: UpdateCustomerDto): Promise<Customer> {
    // Check if customer exists
    const existingCustomer = await customerRepository.getCustomerById(customerId);
    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    // If updating Thai ID card, check for duplicates
    if (customerData.thaiIdCard && customerData.thaiIdCard !== existingCustomer.thaiIdCard) {
      const duplicateCustomer = await customerRepository.findCustomerByThaiId(customerData.thaiIdCard);
      if (duplicateCustomer) {
        throw new Error('Customer with this Thai ID card already exists');
      }
    }

    const updatedCustomer = await customerRepository.updateCustomer(customerId, customerData);
    
    if (!updatedCustomer) {
      throw new Error('Failed to update customer');
    }
    
    return updatedCustomer;
  }
}

export default new CustomerService();
