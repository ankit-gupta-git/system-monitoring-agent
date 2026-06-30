import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.join(__dirname, '../data/metrics.json');

const router = express.Router();

/**
 * @route   GET /metrics
 * @desc    Get the latest system metrics directly from the persistent JSON file
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const latestMetrics = JSON.parse(data);
    res.status(200).json(latestMetrics);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'No metrics storage file found yet. The collector is still initializing.',
      });
    }
    next(error);
  }
});

export default router;
