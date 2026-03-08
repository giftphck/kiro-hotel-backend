import { Request, Response, NextFunction } from 'express';
import reportService from '../services/report.service';

export class ReportsController {
  /**
   * GET /api/reports/revenue/daily?date=YYYY-MM-DD
   * Get daily revenue report
   */
  async getDailyRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date } = req.query;

      // Validate query parameter
      if (!date) {
        res.status(400).json({ 
          error: 'Missing required query parameter: date (format: YYYY-MM-DD)' 
        });
        return;
      }

      // Parse and validate date
      const reportDate = new Date(date as string);
      if (isNaN(reportDate.getTime())) {
        res.status(400).json({ 
          error: 'Invalid date format. Use YYYY-MM-DD format' 
        });
        return;
      }

      const report = await reportService.getDailyRevenue(reportDate);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/revenue/monthly?year=YYYY&month=MM
   * Get monthly revenue report
   */
  async getMonthlyRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year, month } = req.query;

      // Validate query parameters
      if (!year || !month) {
        res.status(400).json({ 
          error: 'Missing required query parameters: year and month' 
        });
        return;
      }

      // Parse and validate year and month
      const yearNum = parseInt(year as string, 10);
      const monthNum = parseInt(month as string, 10);

      if (isNaN(yearNum) || isNaN(monthNum)) {
        res.status(400).json({ 
          error: 'Invalid year or month format. Use numeric values' 
        });
        return;
      }

      if (monthNum < 1 || monthNum > 12) {
        res.status(400).json({ 
          error: 'Month must be between 1 and 12' 
        });
        return;
      }

      const report = await reportService.getMonthlyRevenue(yearNum, monthNum);
      res.status(200).json(report);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Month must be')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * GET /api/reports/revenue/yearly?year=YYYY
   * Get yearly revenue report
   */
  async getYearlyRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year } = req.query;

      // Validate query parameter
      if (!year) {
        res.status(400).json({ 
          error: 'Missing required query parameter: year' 
        });
        return;
      }

      // Parse and validate year
      const yearNum = parseInt(year as string, 10);
      if (isNaN(yearNum)) {
        res.status(400).json({ 
          error: 'Invalid year format. Use numeric value (e.g., 2026)' 
        });
        return;
      }

      const report = await reportService.getYearlyRevenue(yearNum);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportsController();
