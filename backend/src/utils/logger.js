/**
 * Simple structured console logger for logging application events.
 */
const levels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const formatMessage = (level, message, meta = '') => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
  return `[${timestamp}] [${level}]: ${message}${metaStr}`;
};

export const logger = {
  info: (message, meta) => console.log(formatMessage(levels.INFO, message, meta)),
  warn: (message, meta) => console.warn(formatMessage(levels.WARN, message, meta)),
  error: (message, meta) => console.error(formatMessage(levels.ERROR, message, meta)),
};

export default logger;
