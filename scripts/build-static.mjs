#!/usr/bin/env node
/**
 * Generates public/__config.js from environment variables for Vercel static deployment.
 * Required env vars:
 *   BOOKING_API_KEY
 *   BFF_BASE_URL (optional, has default)
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const BFF_BASE_URL =
  process.env.BFF_BASE_URL ||
  'https://lsntpezzhinnohggezxy.supabase.co/functions/v1/booking-public';
const BOOKING_API_KEY = process.env.BOOKING_API_KEY || '';

if (!BOOKING_API_KEY) {
  console.warn('⚠ BOOKING_API_KEY is not set — the app will not be able to call the API.');
}

mkdirSync(publicDir, { recursive: true });

writeFileSync(
  join(publicDir, '__config.js'),
  `window.__BOOKING_CONFIG = ${JSON.stringify({
    bffBaseUrl: BFF_BASE_URL,
    apiKey: BOOKING_API_KEY,
    clientId: 'reservas-frontend-v1',
  })};\n`
);

console.log('[build-static] Generated public/__config.js');
console.log('[build-static] BFF URL:', BFF_BASE_URL);
console.log('[build-static] API key set:', !!BOOKING_API_KEY);
