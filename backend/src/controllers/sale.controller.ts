import { Request, Response } from 'express';
import { saleService } from '../services/sale.service';

export class SaleController {
  async create(req: Request, res: Response) {
    try {
      const data = await saleService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const data = await saleService.getAll(startDate as string, endDate as string);
      res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await saleService.getById(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await saleService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await saleService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const saleController = new SaleController();
