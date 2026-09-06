import { notFound } from '../lib/appError';
import { QueryParams } from '../lib/queryHelpers';
import { BaseRepository } from '../repositories/base.repository';

export interface CrudService<TRecord, TCreate> {
  create(data: TCreate): Promise<TRecord>;
  getAll(params?: QueryParams): Promise<TRecord[]>;
  getById(id: string): Promise<TRecord>;
  update(id: string, data: Partial<TCreate>): Promise<TRecord>;
  delete(id: string): Promise<TRecord>;
}

/**
 * Default business behaviour for a report model: straight delegation to the
 * repository, with a missing record surfaced as a 404 instead of a null.
 * Update and delete rely on Prisma's P2025, which the error middleware also
 * maps to 404.
 */
export function createCrudService<TRecord, TCreate>(
  repository: BaseRepository<TRecord, TCreate>,
  label: string,
): CrudService<TRecord, TCreate> {
  return {
    create(data) {
      return repository.create(data);
    },

    getAll(params: QueryParams = {}) {
      return repository.findMany(params);
    },

    async getById(id) {
      const record = await repository.findById(id);
      if (!record) throw notFound(`${label} not found`);
      return record;
    },

    update(id, data) {
      return repository.update(id, data);
    },

    delete(id) {
      return repository.delete(id);
    },
  };
}
