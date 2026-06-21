import { Router } from 'express';
import { kpiController } from '../controllers/kpi.controller';

const router = Router();

router.get('/', kpiController.getSummary);

export default router;
