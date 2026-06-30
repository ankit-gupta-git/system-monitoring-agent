import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import metricsStore from './data/metrics-store.js';
import { startCollector, stopCollector } from './services/metrics-collector.js';

let server;

/**
 * Bootstrap and start the backend agent.
 */
async function bootstrap() {
  try {
    logger.info('Initializing System Monitoring Agent...');

    // 1. Initialize persistent metrics cache storage
    await metricsStore.init();

    // 2. Start background metric collection (runs every 5 seconds)
    startCollector();

    // 3. Start Express server
    const port = config.port;
    server = app.listen(port, () => {
      logger.info(`System Monitoring Agent Server running on port ${port} in [${config.nodeEnv}] mode`);
    });
  } catch (error) {
    logger.error(`Application bootstrap failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Perform clean teardown on signal termination.
 */
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down agent gracefully...`);

  // Stop the collection timer
  stopCollector();

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Enforce termination if resources remain stuck
  setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded. Force exiting.');
    process.exit(1);
  }, 5000);
};

// Listen for termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Watch for unhandled exceptions or rejections
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  if (err.stack) logger.error(err.stack);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
  shutdown('UNHANDLED_REJECTION');
});

bootstrap();
