import app from './app';
import { env } from './config/env';
import prisma from './prisma/client';

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(env.port, () => {
      console.log(`🚀 Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
}

process.on('SIGINT',  () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

startServer();
