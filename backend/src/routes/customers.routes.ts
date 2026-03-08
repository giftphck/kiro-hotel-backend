import { Router } from 'express';
import customersController from '../controllers/customers.controller';

const router = Router();

// GET /api/customers - Get all customers
router.get('/', (req, res) => customersController.getAllCustomers(req, res));

// GET /api/customers/:id - Get customer by ID
router.get('/:id', (req, res) => customersController.getCustomerById(req, res));

// POST /api/customers - Create new customer
router.post('/', (req, res) => customersController.createCustomer(req, res));

// PUT /api/customers/:id - Update customer
router.put('/:id', (req, res) => customersController.updateCustomer(req, res));

export default router;
