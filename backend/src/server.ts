import { env } from './config/env';
import createApp from './app';
import prisma from './config/database';

const app = createApp();

const startServer = async (): Promise<void> => {
  // Gracefully handle missing DATABASE_URL without crashing
  if (env.DATABASE_URL) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
    } catch (err) {
      const error = err as Error;
      console.warn(`⚠️  Database connection failed: ${error.message}`);
      console.warn('   The API will still start — database features will be unavailable.');
      console.warn('   Configure DATABASE_URL in your .env file to connect to PostgreSQL.');
    }
  } else {
    console.warn('⚠️  DATABASE_URL not set — database features disabled');
  }

  const server = app.listen(env.PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║         🗡️  Life RPG API  🗡️          ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Environment: ${env.NODE_ENV.padEnd(22)}║`);
    console.log(`║  Port:        ${String(env.PORT).padEnd(22)}║`);
    console.log(`║  URL:         http://localhost:${env.PORT}  ║`);
    console.log('╚══════════════════════════════════════╝');
    console.log('');
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
};

startServer().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
