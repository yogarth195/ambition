import { Router } from 'express';
import { sendSuccess } from '../lib/http';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { kpiQuerySchema } from '../schemas/kpi.schema';
import { kpiService } from '../services/kpi.service';

const router = Router();

router.get(
  '/',
  validate({ query: kpiQuerySchema }),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await kpiService.getSummary(req.validated.query));
  }),
);

export default router;
