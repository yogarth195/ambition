import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port:    Number(process.env.PORT ?? 5000),

  // Comma-separated in .env, e.g. "http://localhost:5173,https://my-app.vercel.app"
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),

  databaseUrl:  required('DATABASE_URL'),
  jwtSecret:    required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  isProduction: process.env.NODE_ENV === 'production',
};
