import express from 'express';
import cors from 'cors';
import prisma from './prisma/client';

import productionRoutes from './routes/production.routes';
import trimmerRoutes from './routes/trimmer.routes';
import buffingRoutes from './routes/buffing.routes';
import repairRoutes from './routes/repair.routes';
import packedRoutes from './routes/packed.routes';
import quantityRoutes from './routes/quantity.routes';
import saleRoutes from './routes/sale.routes';
import labourRoutes from './routes/labour.routes';
import miscRoutes from './routes/misc.routes';
import kpiRoutes from './routes/kpi.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/production', productionRoutes);
app.use('/api/trimmer', trimmerRoutes);
app.use('/api/buffing', buffingRoutes);
app.use('/api/repair', repairRoutes);
app.use('/api/packed', packedRoutes);
app.use('/api/quantity', quantityRoutes);
app.use('/api/sale', saleRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/misc', miscRoutes);
app.use('/api/kpi', kpiRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

startServer();
