import { buildQueryArgs, QueryParams } from '../lib/queryHelpers';

/**
 * Structural shape of a Prisma model delegate. Declaring it here rather than
 * importing Prisma's generated types keeps the factory usable across every
 * model without a giant union.
 */
export interface PrismaDelegate {
  create(args: any): Promise<any>;
  findMany(args?: any): Promise<any[]>;
  findUnique(args: any): Promise<any | null>;
  findFirst(args?: any): Promise<any | null>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
  count(args?: any): Promise<number>;
}

export interface BaseRepository<TRecord, TCreate> {
  create(data: TCreate): Promise<TRecord>;
  findMany(params?: QueryParams): Promise<TRecord[]>;
  findById(id: string): Promise<TRecord | null>;
  update(id: string, data: Partial<TCreate>): Promise<TRecord>;
  delete(id: string): Promise<TRecord>;
  hasAny(): Promise<boolean>;
  existsForMonth(month: string): Promise<boolean>;
}

/**
 * The five CRUD operations plus the two month lookups are identical for every
 * report model, so each domain repository is built from this and then extended
 * with whatever queries are actually specific to it.
 */
export function createBaseRepository<TRecord, TCreate>(
  delegate: PrismaDelegate,
): BaseRepository<TRecord, TCreate> {
  return {
    create(data) {
      return delegate.create({ data });
    },

    findMany(params: QueryParams = {}) {
      return delegate.findMany(buildQueryArgs(params));
    },

    findById(id) {
      return delegate.findUnique({ where: { id } });
    },

    update(id, data) {
      return delegate.update({ where: { id }, data });
    },

    delete(id) {
      return delegate.delete({ where: { id } });
    },

    async hasAny() {
      return (await delegate.findFirst()) !== null;
    },

    async existsForMonth(month) {
      return (await delegate.findFirst({ where: { monthBelongs: month } })) !== null;
    },
  };
}
