import { Router } from 'express';
import { productionController } from '../controllers/production.controller';

const router = Router();

router.post('/',     productionController.create);
router.get('/',      productionController.getAll);
router.get('/:id',   productionController.getById);
router.put('/:id',   productionController.update);
router.delete('/:id', productionController.delete);

export default router;
