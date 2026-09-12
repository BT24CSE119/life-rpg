import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root — try multiple locations for resilience
const envPaths = [
  path.resolve(process.cwd(), '../.env'),  // run from /backend
  path.resolve(process.cwd(), '.env'),     // run from project root
  path.resolve(__dirname, '../../.env'),   // run from /backend/src
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
  // DATABASE_URL is optional at boot — server degrades gracefully without DB
  DATABASE_URL: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
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
