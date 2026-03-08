import { Request, Response } from 'express';
import customerService from '../services/customer.service';

export class CustomersController {
  /**
   * GET /api/customers
   * Get all customers
   */
  async getAllCustomers(_req: Request, res: Response): Promise<void> {
    try {
      const customers = await customerService.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ 
        error: 'Failed to fetch customers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/customers/:id
   * Get customer by ID
   */
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        res.status(404).json({ error: 'Customer not found' });
      } else {
        console.error('Error fetching customer:', error);
        res.status(500).json({ 
          error: 'Failed to fetch customer',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * POST /api/customers
   * Create a new customer
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { name, phoneNumber, thaiIdCard } = req.body;

      // Validate required fields
      if (!name || !phoneNumber || !thaiIdCard) {
        res.status(400).json({ 
          error: 'Missing required fields',
          message: 'Name, phone number, and Thai ID card are required'
        });
        return;
      }

      const customer = await customerService.createCustomer({
        name,
        phoneNumber,
        thaiIdCard
      });

      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ 
          error: 'Duplicate customer',
          message: error.message
        });
      } else {
        console.error('Error creating customer:', error);
        res.status(500).json({ 
          error: 'Failed to create customer',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * PUT /api/customers/:id
   * Update customer information
   */
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phoneNumber, thaiIdCard } = req.body;

      const customer = await customerService.updateCustomer(id, {
        name,
        phoneNumber,
        thaiIdCard
      });

      res.json(customer);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Customer not found') {
          res.status(404).json({ error: 'Customer not found' });
        } else if (error.message.includes('already exists')) {
          res.status(409).json({ 
            error: 'Duplicate customer',
            message: error.message
          });
        } else {
          console.error('Error updating customer:', error);
          res.status(500).json({ 
            error: 'Failed to update customer',
            message: error.message
          });
        }
      } else {
        res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
}

export default new CustomersController();
