import { Router } from 'express';
import { labourController } from '../controllers/labour.controller';

const router = Router();

router.post('/',     labourController.create);
router.get('/',      labourController.getAll);
router.get('/:id',   labourController.getById);
router.put('/:id',   labourController.update);
router.delete('/:id', labourController.delete);

export default router;
