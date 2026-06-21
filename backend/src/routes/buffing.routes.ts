import { Router } from 'express';
import { buffingController } from '../controllers/buffing.controller';

const router = Router();

router.post('/',     buffingController.create);
router.get('/',      buffingController.getAll);
router.get('/:id',   buffingController.getById);
router.put('/:id',   buffingController.update);
router.delete('/:id', buffingController.delete);

export default router;
