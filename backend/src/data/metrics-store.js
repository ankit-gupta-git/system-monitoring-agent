import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.join(__dirname, 'metrics.json');

class MetricsStore {
  constructor() {
    this.metrics = [];
    this.limit = config.metricsHistoryLimit;
  }

  /**
   * Initializes the store by loading any persisted metrics from file.
   */
  async init() {
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const latestMetric = JSON.parse(data);
      if (latestMetric && typeof latestMetric === 'object' && !Array.isArray(latestMetric)) {
        this.metrics = [latestMetric];
      } else if (Array.isArray(latestMetric)) {
        // Fallback/migration: if it was an array, extract the last element
        this.metrics = latestMetric.slice(-1);
      } else {
        this.metrics = [];
      }
      logger.info(`Loaded latest metric entry from storage.`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('No persistent metrics storage found. Starting with empty store.');
        this.metrics = [];
      } else {
        logger.warn(`Could not read persistent metrics file. Initializing empty store. Reason: ${error.message}`);
        this.metrics = [];
      }
    }
  }

  /**
   * Appends a new metric measurement and saves the updated history to disk asynchronously.
   * @param {Object} metric 
   */
  async addMetric(metric) {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.limit) {
      this.metrics.shift();
    }

    try {
      // Save only the single latest metric to metrics.json
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(metric, null, 2), 'utf-8');
    } catch (error) {
      logger.error(`Error saving metrics to storage: ${error.message}`);
    }
  }

  /**
   * Returns the most recently collected metric.
   * @returns {Object|null}
   */
  getCurrent() {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Returns the entire history array of collected metrics.
   * @returns {Array}
   */
  getHistory() {
    return this.metrics;
  }

  /**
   * Wipes all metrics history from memory and persistence.
   */
  async clear() {
    this.metrics = [];
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify({}, null, 2), 'utf-8');
      logger.info('Persistent metrics storage cleared successfully.');
    } catch (error) {
      logger.error(`Failed to clear persistent metrics storage file: ${error.message}`);
    }
  }
}

export const metricsStore = new MetricsStore();
export default metricsStore;
