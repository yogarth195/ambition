import { Router } from 'express';
import { AnyZodObject } from 'zod';
import { sendList, sendMessage, sendSuccess } from '../lib/http';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema';
import { CrudService } from '../services/base.service';

interface CrudRouterOptions<TRecord, TCreate> {
  service:       CrudService<TRecord, TCreate>;
  createSchema:  AnyZodObject;
  /** Defaults to a partial of createSchema. */
  updateSchema?: AnyZodObject;
}

/**
 * The nine report domains expose an identical REST surface, so their routers
 * are built here rather than copied nine times. Handlers stay thin: validate,
 * call the service, send the envelope. Errors propagate to error.middleware.
 */
export function createCrudRouter<TRecord, TCreate>({
  service,
  createSchema,
  updateSchema = createSchema.partial(),
}: CrudRouterOptions<TRecord, TCreate>): Router {
  const router = Router();

  router.post(
    '/',
    validate({ body: createSchema }),
    asyncHandler(async (req, res) => {
      sendSuccess(res, await service.create(req.validated.body), 201, 'Created successfully');
    }),
  );

  router.get(
    '/',
    validate({ query: listQuerySchema }),
    asyncHandler(async (req, res) => {
      sendList(res, await service.getAll(req.validated.query));
    }),
  );

  router.get(
    '/:id',
    validate({ params: idParamSchema }),
    asyncHandler(async (req, res) => {
      sendSuccess(res, await service.getById(req.validated.params.id));
    }),
  );

  router.put(
    '/:id',
    validate({ params: idParamSchema, body: updateSchema }),
    asyncHandler(async (req, res) => {
      sendSuccess(res, await service.update(req.validated.params.id, req.validated.body), 200, 'Updated successfully');
    }),
  );

  router.delete(
    '/:id',
    validate({ params: idParamSchema }),
    asyncHandler(async (req, res) => {
      await service.delete(req.validated.params.id);
      sendMessage(res, 'Deleted successfully');
    }),
  );

  return router;
}
