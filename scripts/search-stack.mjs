#!/usr/bin/env node

import {
  SUPPORTED_TYPES,
  baseHelp,
  createStructuredError,
  isEntrypoint,
  parseCommonArgs,
  printHelp,
  printStructuredError,
  summarizeSignals,
} from "./_shared.mjs";
import { searchGitHub } from "./github-baseline-search.mjs";
import { searchNpm } from "./npm-baseline-search.mjs";
import { searchPyPi } from "./pypi-baseline-search.mjs";
import { searchHuggingFace } from "./hf-baseline-search.mjs";
import { searchRoboflow } from "./roboflow-baseline-search.mjs";

const PLATFORM_MAP = {
  github: searchGitHub,
  npm: searchNpm,
  pypi: searchPyPi,
  huggingface: searchHuggingFace,
  roboflow: searchRoboflow,
};

const TYPE_PLATFORMS = {
  software: ["github", "npm", "pypi"],
  ai: ["github", "huggingface", "roboflow"],
  mixed: ["github", "npm", "pypi", "huggingface", "roboflow"],
};

function normalizeType(type) {
  return SUPPORTED_TYPES.includes(type) ? type : "software";
}

export async function searchStack(options) {
  const type = normalizeType(options.type);
  const platforms = TYPE_PLATFORMS[type];
  const results = [];

  for (const platform of platforms) {
    try {
      results.push(await PLATFORM_MAP[platform](options));
    } catch (error) {
      results.push(createStructuredError(platform, options.query, "PLATFORM_SEARCH_FAILED", error.message));
    }
  }

  return {
    query: options.query,
    type,
    platforms_checked: platforms,
    platform_results: results,
    signals_summary: summarizeSignals(results),
    errors: results
      .filter((result) => result.status === "error")
      .map(({ platform, code, message }) => ({ platform, code, message })),
  };
}

const HELP_TEXT = baseHelp(
  "search-stack.mjs",
  `Aggregate the GitHub-first multi-platform search flow.

Type mapping:
  software -> GitHub + npm + PyPI
  ai       -> GitHub + Hugging Face + Roboflow
  mixed    -> GitHub + npm + PyPI + Hugging Face + Roboflow`
);

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), { type: "software" });
  if (options.help) {
    printHelp(HELP_TEXT);
    return;
  }
  if (!options.query) {
    printStructuredError("search-stack", "", "MISSING_QUERY", "A search query is required.", {
      help: HELP_TEXT,
    });
    process.exit(1);
  }

  console.log(JSON.stringify(await searchStack(options), null, 2));
}

if (isEntrypoint(import.meta.url)) {
  main().catch((error) => {
    console.log(
      JSON.stringify(createStructuredError("search-stack", "", "SEARCH_STACK_FAILED", error.message), null, 2)
    );
    process.exit(1);
  });
}
