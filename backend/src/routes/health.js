import express from 'express';
import metricsStore from '../data/metrics-store.js';

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Simple health check endpoint returning API status and last collection timestamp.
 * @access  Public
 */
router.get('/', (req, res) => {
  const currentMetric = metricsStore.getCurrent();
  res.status(200).json({
    status: 'UP',
    lastCollectionTimestamp: currentMetric ? currentMetric.timestamp : null,
    uptime: Math.floor(process.uptime()), // API server process uptime in seconds
  });
});

export default router;
