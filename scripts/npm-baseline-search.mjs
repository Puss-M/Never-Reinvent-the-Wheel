#!/usr/bin/env node

import {
  baseHelp,
  buildAssessment,
  createStructuredError,
  fetchJson,
  okResult,
  parseCommonArgs,
  printHelp,
  printStructuredError,
  readFixtures,
  scoreBucket,
  isEntrypoint,
  usingFixtures,
} from "./_shared.mjs";

async function fetchDownloadCounts(packageNames) {
  const entries = await Promise.all(
    packageNames.map(async (name) => {
      const url = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`;
      const data = await fetchJson(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "never-reinvent-the-wheel",
        },
      });
      return [name, data.downloads || 0];
    })
  );
  return Object.fromEntries(entries);
}

export async function searchNpm(options) {
  let searchData;
  let downloadCounts = {};

  if (usingFixtures()) {
    const fixtures = await readFixtures();
    searchData = fixtures.npm;
    downloadCounts = fixtures.npm.downloads;
  } else {
    const url = new URL("https://registry.npmjs.org/-/v1/search");
    url.searchParams.set("text", options.query);
    url.searchParams.set("size", String(Math.min(options.limit, 20)));

    searchData = await fetchJson(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "never-reinvent-the-wheel",
      },
    });

    const packageNames = (searchData.objects || []).map((entry) => entry.package.name);
    downloadCounts = await fetchDownloadCounts(packageNames);
  }

  const items = (searchData.objects || [])
    .filter((entry) => (downloadCounts[entry.package.name] || 0) >= options.minDownloads)
    .slice(0, options.limit)
    .map((entry, index) => ({
      rank: index + 1,
      source_type: "package",
      full_name: entry.package.name,
      title: entry.package.name,
      url: entry.package.links?.npm || `https://www.npmjs.com/package/${entry.package.name}`,
      description: entry.package.description,
      latest_version: entry.package.version,
      updated_at: entry.package.date || null,
      keywords: entry.package.keywords || [],
      repository_url: entry.package.links?.repository || null,
      metrics: {
        downloads_last_month: downloadCounts[entry.package.name] || 0,
        search_score: entry.score?.final || null,
      },
      assessment: buildAssessment({
        maintenance: scoreBucket(new Date(entry.package.date || 0).getTime(), {
          high: Date.now() - 1000 * 60 * 60 * 24 * 30,
          medium: Date.now() - 1000 * 60 * 60 * 24 * 180,
        }),
        traction: scoreBucket(downloadCounts[entry.package.name] || 0, {
          high: 100000,
          medium: 10000,
        }),
        completeness: "package_level_only",
        extensibility: "requires_agent_judgment",
        executionRisk: "requires_agent_judgment",
      }),
    }));

  return okResult("npm", options.query, options, items, {
    platform_label: "npm package baseline",
    total_count: searchData.total || searchData.objects?.length || items.length,
  });
}

const HELP_TEXT = baseHelp(
  "npm-baseline-search.mjs",
  "Search npm packages for reusable software building blocks after the GitHub phase."
);

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), { type: "software", minDownloads: 1000 });
  if (options.help) {
    printHelp(HELP_TEXT);
    return;
  }
  if (!options.query) {
    printStructuredError("npm", "", "MISSING_QUERY", "A search query is required.", {
      help: HELP_TEXT,
    });
    process.exit(1);
  }

  try {
    console.log(JSON.stringify(await searchNpm(options), null, 2));
  } catch (error) {
    console.log(
      JSON.stringify(createStructuredError("npm", options.query, "NPM_SEARCH_FAILED", error.message), null, 2)
    );
    process.exit(1);
  }
}

if (isEntrypoint(import.meta.url)) {
  main();
}
