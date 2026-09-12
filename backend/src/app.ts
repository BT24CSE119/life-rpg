import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const createApp = (): Application => {
  const app = express();

  // ── Production Security Headers (Helmet) ──────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── High-Performance Response Compression (Gzip) ───────────────────────────
  app.use(compression());

  // ── CORS & Parsing ────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Allowed static origins
        const allowedOrigins = [
          env.FRONTEND_URL,
          'https://life-rpg07.vercel.app',
          'http://localhost:5173',
          'http://localhost:3000',
        ];

        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost')
        ) {
          return callback(null, true);
        }

        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // ── Rate Limiting (Security Hardening) ─────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    // General API rate limiter
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 600, // Limit each IP to 600 requests per window
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.',
      },
    });

    // Stricter limiter for authentication actions
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 40,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again after 15 minutes.',
      },
    });

    app.use('/api/', generalLimiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/signup', authLimiter);
  }

  // ── Request Logging (development) ──────────────────────────────────────────
  if (env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
      // Don't clutter logs with SSE heartbeat or frequent health checks
      if (req.path !== '/api/events' && req.path !== '/api/health') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      }
      next();
    });
  }

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── 404 & Error Handling ───────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
