import { Router } from 'express';
import { packedController } from '../controllers/packed.controller';

const router = Router();

router.post('/',     packedController.create);
router.get('/',      packedController.getAll);
router.get('/:id',   packedController.getById);
router.put('/:id',   packedController.update);
router.delete('/:id', packedController.delete);

export default router;
