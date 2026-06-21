import { Request, Response } from 'express';
import { buffingService } from '../services/buffing.service';
import { createBuffingSchema } from '../schemas/buffing.schema';

export class BuffingController {
  async create(req: Request, res: Response) {
    const parsed = createBuffingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.flatten() });
      return;
    }
    try {
      const data = await buffingService.create(parsed.data);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { monthBelongs, startDate, endDate, sortBy, sortOrder, page, pageSize } = req.query;
      const data = await buffingService.getAll({
        monthBelongs: monthBelongs as string,
        startDate:    startDate  as string,
        endDate:      endDate    as string,
        sortBy:       sortBy     as string,
        sortOrder:    sortOrder  as 'asc' | 'desc',
        page:         page     ? Number(page)     : undefined,
        pageSize:     pageSize ? Number(pageSize) : undefined,
      });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await buffingService.getById(req.params.id);
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
      const data = await buffingService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await buffingService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const buffingController = new BuffingController();
