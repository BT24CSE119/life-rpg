import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root — try multiple locations for resilience
const envPaths = [
  path.resolve(process.cwd(), '.env'),     // current working directory
  path.resolve(__dirname, '../.env'),      // backend directory when running from src
  path.resolve(process.cwd(), '../.env'),  // root fallback
  path.resolve(__dirname, '../../.env'),   // root fallback from src
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) break;
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('3001')
    .transform(Number)
    .refine((n) => n > 0 && n < 65536, 'PORT must be a valid port number'),
  DATABASE_URL: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('90d'),
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
