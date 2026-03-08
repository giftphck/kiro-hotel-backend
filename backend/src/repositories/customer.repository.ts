import pool from '../config/database.config';
import { Customer } from '../models/customer.model';

export interface CreateCustomerDto {
  name: string;
  phoneNumber: string;
  thaiIdCard: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phoneNumber?: string;
  thaiIdCard?: string;
}

export class CustomerRepository {
  /**
   * Create a new customer
   */
  async createCustomer(customer: CreateCustomerDto): Promise<Customer> {
    const query = `
      INSERT INTO customers (name, phone_number, thai_id_card)
      VALUES ($1, $2, $3)
      RETURNING 
        customer_id as "customerId",
        name,
        phone_number as "phoneNumber",
        thai_id_card as "thaiIdCard",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [
      customer.name,
      customer.phoneNumber,
      customer.thaiIdCard
    ]);
    
    return result.rows[0];
  }

  /**
   * Find customer by Thai ID card
   */
  async findCustomerByThaiId(thaiIdCard: string): Promise<Customer | null> {
    const query = `
      SELECT 
        customer_id as "customerId",
        name,
        phone_number as "phoneNumber",
        thai_id_card as "thaiIdCard",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM customers
      WHERE thai_id_card = $1
    `;
    
    const result = await pool.query(query, [thaiIdCard]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string): Promise<Customer | null> {
    const query = `
      SELECT 
        customer_id as "customerId",
        name,
        phone_number as "phoneNumber",
        thai_id_card as "thaiIdCard",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM customers
      WHERE customer_id = $1
    `;
    
    const result = await pool.query(query, [customerId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerId: string, customer: UpdateCustomerDto): Promise<Customer | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (customer.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(customer.name);
    }
    if (customer.phoneNumber !== undefined) {
      updates.push(`phone_number = $${paramIndex++}`);
      values.push(customer.phoneNumber);
    }
    if (customer.thaiIdCard !== undefined) {
      updates.push(`thai_id_card = $${paramIndex++}`);
      values.push(customer.thaiIdCard);
    }

    if (updates.length === 0) {
      return this.getCustomerById(customerId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(customerId);

    const query = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE customer_id = $${paramIndex}
      RETURNING 
        customer_id as "customerId",
        name,
        phone_number as "phoneNumber",
        thai_id_card as "thaiIdCard",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get all customers
   */
  async getAllCustomers(): Promise<Customer[]> {
    const query = `
      SELECT 
        customer_id as "customerId",
        name,
        phone_number as "phoneNumber",
        thai_id_card as "thaiIdCard",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM customers
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}

export default new CustomerRepository();
