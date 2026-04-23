#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { searchStack } from "./search-stack.mjs";

const requiredFiles = [
  "README.md",
  "README_zh.md",
  "SKILL.md",
  "CLAUDE.md",
  "agents/openai.yaml",
  "scripts/github-baseline-search.mjs",
  "scripts/npm-baseline-search.mjs",
  "scripts/pypi-baseline-search.mjs",
  "scripts/hf-baseline-search.mjs",
  "scripts/roboflow-baseline-search.mjs",
  "scripts/search-stack.mjs",
  "scripts/fixtures/search-fixtures.json",
];

const checks = [
  {
    file: "README.md",
    patterns: [
      "GitHub-first, multi-platform",
      "## Optional Helper Script",
      "## Platform Selection Matrix",
      "## Example Outputs",
      "[简体中文](./README_zh.md)",
    ],
  },
  {
    file: "README_zh.md",
    patterns: [
      "GitHub 优先",
      "## 可选辅助脚本",
      "## 平台选择矩阵",
      "## 示例输出",
      "[English](./README.md)",
    ],
  },
  {
    file: "SKILL.md",
    patterns: ["## Triggering", "## Platform Selection", "## Workflow", "## Decision Heuristics"],
  },
  {
    file: "CLAUDE.md",
    patterns: ["## Triggering", "## Platform Selection", "## Workflow", "## Decision Heuristics"],
  },
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    fail(`Missing required file: ${file}`);
  }
}

for (const { file, patterns } of checks) {
  if (!existsSync(file)) {
    continue;
  }
  const content = readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (!content.includes(pattern)) {
      fail(`Missing required pattern in ${file}: ${pattern}`);
    }
  }
}

process.env.NO_REINVENT_WHEEL_FIXTURE = "1";
const parsed = await searchStack({
  query: "document extraction agent",
  type: "ai",
  limit: 5,
  minStars: 100,
  minDownloads: 1000,
  pushedWithinDays: 365,
});
for (const field of ["query", "type", "platforms_checked", "platform_results", "signals_summary", "errors"]) {
  if (!(field in parsed)) {
    fail(`Missing aggregated field in search-stack output: ${field}`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Repository validation passed.");
