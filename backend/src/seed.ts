import 'dotenv/config';
import prisma from './prisma/client';
import { hashPassword } from './lib/password';

async function seed() {
  const email    = process.env.ADMIN;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN and ADMIN_PASSWORD must be set in .env before seeding');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${email} — leaving it untouched`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
      name:     process.env.ADMIN_NAME ?? 'Administrator',
      role:     'ADMIN',
    },
  });

  console.log(`✅ Admin user created: ${email}`);
}

seed()
  .catch(error => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
