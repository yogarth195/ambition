import { Router } from 'express';
import { miscController } from '../controllers/misc.controller';

const router = Router();

router.post('/',     miscController.create);
router.get('/',      miscController.getAll);
router.get('/:id',   miscController.getById);
router.put('/:id',   miscController.update);
router.delete('/:id', miscController.delete);

export default router;
