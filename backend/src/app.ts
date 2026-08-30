import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { logger } from './config/logger';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import apiRoutes from './routes/index';

const app = express();

// ─── Security Headers ───────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── NoSQL Injection Protection ─────────────────────────────────────────────
app.use(mongoSanitize());

// ─── HTTP Request Logging ───────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan('dev', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ─── Rate Limiting (general) ────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);

export default app;