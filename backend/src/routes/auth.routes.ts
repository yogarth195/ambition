import { Router } from 'express';
import { sendMessage, sendSuccess } from '../lib/http';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { changePasswordSchema, loginSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

const router = Router();

router.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    sendSuccess(res, await authService.login(req.validated.body), 200, 'Logged in successfully');
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    sendSuccess(res, await authService.getMe(req.user!.id));
  }),
);

router.put(
  '/change-password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  asyncHandler(async (req, res) => {
    await authService.changePassword(req.user!.id, req.validated.body);
    sendMessage(res, 'Password updated successfully');
  }),
);

export default router;
