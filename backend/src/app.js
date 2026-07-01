import express from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import errorHandler from './utils/errorHandler.js';
import healthRouter from './routes/health.js';
import systemRouter from './routes/system.js';
import metricsRouter from './routes/metrics.js';
import metricsDirectRouter from './routes/metricsDirect.js';
import summaryRouter from './routes/summary.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${elapsed}ms)`);
  });
  next();
});

app.use('/health', healthRouter);
app.use('/metrics', metricsDirectRouter);
app.use('/summary', summaryRouter);
app.use('/api/system', systemRouter);
app.use('/api/metrics', metricsRouter);

app.use((req, res, next) => {
  const err = new Error(`Resource not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

app.use(errorHandler);

export default app;
