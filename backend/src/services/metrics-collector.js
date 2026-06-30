import config from '../config/index.js';
import logger from '../utils/logger.js';
import metricsStore from '../data/metrics-store.js';
import { getDynamicSystemMetrics } from './system-info.js';

let intervalId = null;

/**
 * Performs a single metrics collection pass and saves the metrics to the store.
 */
async function collect() {
  try {
    logger.info('Collecting system metrics...');
    const metrics = await getDynamicSystemMetrics();
    await metricsStore.addMetric(metrics);
  } catch (error) {
    logger.error(`Failed to collect system metrics: ${error.message}`);
  }
}

/**
 * Starts the background metrics collection daemon.
 */
export const startCollector = () => {
  if (intervalId) {
    logger.warn('Collector is already running.');
    return;
  }

  const interval = config.metricsIntervalMs;
  logger.info(`Starting metrics collection daemon (interval: ${interval}ms)`);

  // Run first collection immediately so metrics are available instantly
  collect();

  intervalId = setInterval(collect, interval);
};

/**
 * Stops the background metrics collection daemon.
 */
export const stopCollector = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Metrics collection daemon stopped.');
  }
};

export default {
  startCollector,
  stopCollector,
};
