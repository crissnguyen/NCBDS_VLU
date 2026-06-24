const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const rootDir = path.join(__dirname, '..');
const nodeEnv = process.env.NODE_ENV || 'development';
const envFiles = [
  path.join(rootDir, `.env.${nodeEnv}.local`),
  path.join(rootDir, `.env.${nodeEnv}`),
  path.join(rootDir, '.env.local'),
  path.join(rootDir, '.env'),
];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
}

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv,
  port: toInt(process.env.PORT, 5001),
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || process.env.PUBLIC_APP_URL || 'http://localhost:5173',
  corsOrigins: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST,
    port: toInt(process.env.SMTP_PORT, 587),
    secure: toBool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@estateai.vn',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
};

module.exports = { env };
