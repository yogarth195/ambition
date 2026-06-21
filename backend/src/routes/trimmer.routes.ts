import { Router } from 'express';
import { trimmerController } from '../controllers/trimmer.controller';

const router = Router();

router.post('/',     trimmerController.create);
router.get('/',      trimmerController.getAll);
router.get('/:id',   trimmerController.getById);
router.put('/:id',   trimmerController.update);
router.delete('/:id', trimmerController.delete);

export default router;
