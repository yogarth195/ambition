import 'dotenv/config';
import prisma from '../prisma/client';

const MONTH_BELONGS = '2026-08';
const ENTRY_DATE = new Date('2026-08-01');
const PLACEHOLDER = 'placeholder';

async function seedIfAbsent(label: string, findExisting: () => Promise<unknown>, create: () => Promise<unknown>) {
  const existing = await findExisting();
  if (existing) {
    console.log(`⏭  ${label}: already has an entry for ${MONTH_BELONGS} — skipped`);
    return;
  }
  await create();
  console.log(`✅ ${label}: zero entry created for ${MONTH_BELONGS}`);
}

async function main() {
  await seedIfAbsent(
    'Production',
    () => prisma.production.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.production.create({
      data: { design: PLACEHOLDER, shorts: 0, shortUnit: 0, total: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  await seedIfAbsent(
    'Trimmer',
    () => prisma.trimmer.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.trimmer.create({
      data: { item: PLACEHOLDER, value: 0, lastMonthRemaining: 0, finalValue: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  await seedIfAbsent(
    'Buffing',
    () => prisma.buffing.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.buffing.create({
      data: { item: PLACEHOLDER, value: 0, lastMonthRemaining: 0, finalValue: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  await seedIfAbsent(
    'Repair',
    () => prisma.repair.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.repair.create({
      data: { item: PLACEHOLDER, value: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  await seedIfAbsent(
    'Packed',
    () => prisma.packed.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.packed.create({
      data: { item: PLACEHOLDER, value: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  await seedIfAbsent(
    'Quantity',
    () => prisma.quantity.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.quantity.create({
      data: { item: PLACEHOLDER, value: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  await seedIfAbsent(
    'Labour',
    () => prisma.labour.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.labour.create({
      data: { amount: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  await seedIfAbsent(
    'Misc',
    () => prisma.misc.findFirst({ where: { monthBelongs: MONTH_BELONGS } }),
    () => prisma.misc.create({
      data: { amount: 0, entryDate: ENTRY_DATE, monthBelongs: MONTH_BELONGS },
    }),
  );

  // Sale has no monthBelongs column — keyed on entryDate falling within August instead.
  await seedIfAbsent(
    'Sale',
    () => prisma.sale.findFirst({
      where: { entryDate: { gte: new Date('2026-08-01'), lt: new Date('2026-09-01') } },
    }),
    () => prisma.sale.create({
      data: { item: PLACEHOLDER, value: 0, entryDate: ENTRY_DATE },
    }),
  );
}

main()
  .catch(error => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
