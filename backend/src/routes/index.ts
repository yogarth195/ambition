import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';

import authRoutes from './auth.routes';
import buffingRoutes from './buffing.routes';
import kpiRoutes from './kpi.routes';
import labourRoutes from './labour.routes';
import miscRoutes from './misc.routes';
import packedRoutes from './packed.routes';
import productionRoutes from './production.routes';
import quantityRoutes from './quantity.routes';
import repairRoutes from './repair.routes';
import saleRoutes from './sale.routes';
import trimmerRoutes from './trimmer.routes';

const router = Router();

// Public: /auth/login. /auth/me and /auth/change-password guard themselves.
router.use('/auth', authRoutes);

// Everything below requires a valid Bearer token.
router.use(requireAuth);

router.use('/production', productionRoutes);
router.use('/trimmer',    trimmerRoutes);
router.use('/buffing',    buffingRoutes);
router.use('/repair',     repairRoutes);
router.use('/packed',     packedRoutes);
router.use('/quantity',   quantityRoutes);
router.use('/sale',       saleRoutes);
router.use('/labour',     labourRoutes);
router.use('/misc',       miscRoutes);
router.use('/kpi',        kpiRoutes);

export default router;
