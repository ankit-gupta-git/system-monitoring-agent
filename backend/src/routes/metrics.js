import express from 'express';
import metricsStore from '../data/metrics-store.js';

const router = express.Router();

/**
 * @route   GET /api/metrics/current
 * @desc    Get the latest collected system metrics from cache
 * @access  Public
 */
router.get('/current', (req, res) => {
  const currentMetric = metricsStore.getCurrent();
  if (!currentMetric) {
    return res.status(404).json({
      status: 'error',
      statusCode: 404,
      message: 'No metrics collected yet. The collector is still initializing.',
    });
  }
  res.status(200).json(currentMetric);
});

/**
 * @route   GET /api/metrics/history
 * @desc    Get the stored sliding window metrics history
 * @access  Public
 */
router.get('/history', (req, res) => {
  const history = metricsStore.getHistory();
  res.status(200).json(history);
});

/**
 * @route   DELETE /api/metrics/history
 * @desc    Wipe all metrics from cache and persistence
 * @access  Public
 */
router.delete('/history', async (req, res, next) => {
  try {
    await metricsStore.clear();
    res.status(200).json({
      status: 'success',
      message: 'Metrics history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
