import { Router } from 'express';
import reportsController from '../controllers/reports.controller';

const router = Router();

/**
 * GET /api/reports/revenue/daily?date=YYYY-MM-DD
 * Get daily revenue report
 */
router.get('/revenue/daily', reportsController.getDailyRevenue.bind(reportsController));

/**
 * GET /api/reports/revenue/monthly?year=YYYY&month=MM
 * Get monthly revenue report
 */
router.get('/revenue/monthly', reportsController.getMonthlyRevenue.bind(reportsController));

/**
 * GET /api/reports/revenue/yearly?year=YYYY
 * Get yearly revenue report
 */
router.get('/revenue/yearly', reportsController.getYearlyRevenue.bind(reportsController));

export default router;
