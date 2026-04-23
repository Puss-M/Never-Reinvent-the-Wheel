#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_PATH = path.join(__dirname, "fixtures", "search-fixtures.json");

export const SUPPORTED_TYPES = ["software", "ai", "mixed"];

export function isEntrypoint(metaUrl) {
  if (!process.argv[1]) {
    return false;
  }
  return fileURLToPath(metaUrl) === path.resolve(process.argv[1]);
}

export function printHelp(text) {
  console.log(text.trim());
}

export function clampNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

export function parseCommonArgs(argv, defaults = {}) {
  const options = {
    query: "",
    type: defaults.type ?? "software",
    limit: defaults.limit ?? 5,
    minStars: defaults.minStars ?? 100,
    minDownloads: defaults.minDownloads ?? 1000,
    pushedWithinDays: defaults.pushedWithinDays ?? 365,
    json: true,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (!arg.startsWith("--") && !options.query) {
      options.query = arg;
      continue;
    }
    if (arg === "--type") {
      options.type = argv[i + 1] || options.type;
      i += 1;
      continue;
    }
    if (arg === "--limit") {
      options.limit = clampNumber(argv[i + 1], options.limit, 1, 20);
      i += 1;
      continue;
    }
    if (arg === "--min-stars") {
      options.minStars = clampNumber(argv[i + 1], options.minStars, 0, 10000000);
      i += 1;
      continue;
    }
    if (arg === "--min-downloads") {
      options.minDownloads = clampNumber(argv[i + 1], options.minDownloads, 0, 1000000000);
      i += 1;
      continue;
    }
    if (arg === "--pushed-within-days") {
      options.pushedWithinDays = clampNumber(argv[i + 1], options.pushedWithinDays, 1, 3650);
      i += 1;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
    }
  }

  return options;
}

export function baseHelp(scriptName, extra = "") {
  return `
Usage: node scripts/${scriptName} <query> [options]

Options:
  --type <software|ai|mixed>   Search type for context-aware filtering
  --limit <n>                  Maximum returned items (default: 5)
  --min-stars <n>              Minimum GitHub stars or star-like threshold
  --min-downloads <n>          Minimum package/model download threshold
  --pushed-within-days <n>     Recency filter when supported
  --json                       Print JSON output (default)
  --help                       Show this help

${extra}`.trim();
}

export function createStructuredError(platform, query, code, message, extra = {}) {
  return {
    platform,
    status: "error",
    query,
    code,
    message,
    ...extra,
  };
}

export function printStructuredError(platform, query, code, message, extra = {}) {
  console.log(JSON.stringify(createStructuredError(platform, query, code, message, extra), null, 2));
}

export function okResult(platform, query, options, items, extra = {}) {
  return {
    platform,
    status: "ok",
    query,
    options: {
      type: options.type,
      limit: options.limit,
      min_stars: options.minStars,
      min_downloads: options.minDownloads,
      pushed_within_days: options.pushedWithinDays,
    },
    returned_count: items.length,
    items,
    ...extra,
  };
}

export async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 500)}`);
  }
  return response.json();
}

export async function fetchText(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 500)}`);
  }
  return response.text();
}

export function daysAgoDate(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export function scoreBucket(value, thresholds) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "unknown";
  }
  const numeric = Number(value);
  if (numeric >= thresholds.high) {
    return "high";
  }
  if (numeric >= thresholds.medium) {
    return "medium";
  }
  return "low";
}

export function buildAssessment({ maintenance, traction, completeness = "unknown", extensibility = "unknown", executionRisk = "unknown" }) {
  return {
    relevance: "requires_agent_judgment",
    maintenance,
    traction,
    completeness,
    extensibility,
    execution_risk: executionRisk,
  };
}

export async function readFixtures() {
  const raw = await readFile(FIXTURE_PATH, "utf8");
  return JSON.parse(raw);
}

export function usingFixtures() {
  return process.env.NO_REINVENT_WHEEL_FIXTURE === "1";
}

export function summarizeSignals(platformResults) {
  const summary = {
    successful_platforms: [],
    failed_platforms: [],
    total_candidates: 0,
    candidate_breakdown: {},
  };

  for (const result of platformResults) {
    if (result.status === "ok") {
      summary.successful_platforms.push(result.platform);
      summary.total_candidates += result.returned_count || 0;
      summary.candidate_breakdown[result.platform] = result.returned_count || 0;
    } else {
      summary.failed_platforms.push({
        platform: result.platform,
        code: result.code,
      });
    }
  }

  return summary;
}
