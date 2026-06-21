import { Router } from 'express';
import { saleController } from '../controllers/sale.controller';

const router = Router();

router.post('/', saleController.create);
router.get('/', saleController.getAll);
router.get('/:id', saleController.getById);
router.put('/:id', saleController.update);
router.delete('/:id', saleController.delete);

export default router;
