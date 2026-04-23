#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";

const requiredFiles = [
  "README.md",
  "README_zh.md",
  "SKILL.md",
  "CLAUDE.md",
  "agents/openai.yaml",
  "scripts/github-baseline-search.mjs",
];

const checks = [
  {
    file: "README.md",
    patterns: ["## When It Should Interrupt", "## Optional Helper Script", "[简体中文](./README_zh.md)"],
  },
  {
    file: "README_zh.md",
    patterns: ["## 它会在什么时候打断实现", "## 可选辅助脚本", "[English](./README.md)"],
  },
  {
    file: "SKILL.md",
    patterns: ["## Triggering", "## Workflow", "## Decision Heuristics"],
  },
  {
    file: "CLAUDE.md",
    patterns: ["## Triggering", "## Workflow", "## Decision Heuristics"],
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

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Repository validation passed.");
