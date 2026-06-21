import { Router } from 'express';
import { quantityController } from '../controllers/quantity.controller';

const router = Router();

router.post('/',     quantityController.create);
router.get('/',      quantityController.getAll);
router.get('/:id',   quantityController.getById);
router.put('/:id',   quantityController.update);
router.delete('/:id', quantityController.delete);

export default router;
