import { Request, Response } from 'express';
import { kpiService } from '../services/kpi.service';

const VALID_PERIODS = ['today', 'week', 'month', 'all'];

export class KpiController {
  async getSummary(req: Request, res: Response) {
    try {
      const { period, startDate, endDate } = req.query as Record<string, string>;

      // Custom date range takes priority over period
      if (startDate || endDate) {
        if (!startDate || !endDate) {
          res.status(400).json({ success: false, error: 'Both startDate and endDate are required for custom range' });
          return;
        }
        if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
          res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
          return;
        }
        if (new Date(startDate) > new Date(endDate)) {
          res.status(400).json({ success: false, error: 'startDate must be before endDate' });
          return;
        }
        const data = await kpiService.getSummary({ startDate, endDate });
        res.status(200).json({ success: true, data });
        return;
      }

      // Period preset
      const p = period || 'month';
      if (!VALID_PERIODS.includes(p)) {
        res.status(400).json({ success: false, error: 'period must be today | week | month | all' });
        return;
      }
      const data = await kpiService.getSummary({ period: p as any });
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const kpiController = new KpiController();
