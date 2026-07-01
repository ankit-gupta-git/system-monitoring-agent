import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  metricsIntervalMs: parseInt(process.env.METRICS_INTERVAL_MS || '5000', 10),
  metricsHistoryLimit: parseInt(process.env.METRICS_HISTORY_LIMIT || '720', 10),
  geminiApiKey: process.env.GEMINI_API_KEY,
};

export default config;
