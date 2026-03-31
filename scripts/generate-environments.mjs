#!/usr/bin/env node
/**
 * Generates Angular environment files from environment variables.
 * Run before `ng build` in CI/CD pipelines.
 *
 * Required env vars:
 *   TURNSTILE_SITE_KEY
 *   SUPABASE_ANON_KEY
 *   BOOKING_API_KEY
 *   BFF_BASE_URL (optional, has default)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envDir = join(__dirname, "../src/environments");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const bffBaseUrl =
  process.env.BFF_BASE_URL ||
  "https://ufutyjbqfjrlzkprvyvs.supabase.co/functions/v1/booking-public";

const turnstileSiteKey = requireEnv("TURNSTILE_SITE_KEY");
const supabaseAnonKey = requireEnv("SUPABASE_ANON_KEY");
const bookingApiKey = requireEnv("BOOKING_API_KEY");

const base = `  bffBaseUrl: "${bffBaseUrl}",
  turnstileSiteKey: "${turnstileSiteKey}",
  clientId: "simplifica-agenda-frontend",
  supabaseAnonKey: "${supabaseAnonKey}",
  bookingApiKey: "${bookingApiKey}",`;

mkdirSync(envDir, { recursive: true });

writeFileSync(
  join(envDir, "environment.prod.ts"),
  `export const environment = {\n  production: true,\n${base}\n};\n`
);

writeFileSync(
  join(envDir, "environment.ts"),
  `export const environment = {\n  production: false,\n${base}\n};\n`
);

console.log("✓ Environment files generated");
