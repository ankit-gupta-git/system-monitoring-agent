import express from 'express';
import { getStaticSystemInfo, getDynamicSystemMetrics } from '../services/system-info.js';

const router = express.Router();

/**
 * @route   GET /api/system/static
 * @desc    Get static system specifications (CPU model, OS distro, memory capacity, etc.)
 * @access  Public
 */
router.get('/static', async (req, res, next) => {
  try {
    const staticInfo = await getStaticSystemInfo();
    res.status(200).json(staticInfo);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/system/dynamic
 * @desc    Get fresh, real-time dynamic metrics immediately
 * @access  Public
 */
router.get('/dynamic', async (req, res, next) => {
  try {
    const dynamicMetrics = await getDynamicSystemMetrics();
    res.status(200).json(dynamicMetrics);
  } catch (error) {
    next(error);
  }
});

export default router;
