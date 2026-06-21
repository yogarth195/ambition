import { Router } from 'express';
import { repairController } from '../controllers/repair.controller';

const router = Router();

router.post('/',     repairController.create);
router.get('/',      repairController.getAll);
router.get('/:id',   repairController.getById);
router.put('/:id',   repairController.update);
router.delete('/:id', repairController.delete);

export default router;
