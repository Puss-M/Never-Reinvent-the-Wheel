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

export async function searchRoboflow(options) {
  let searchData;

  if (usingFixtures()) {
    const fixtures = await readFixtures();
    searchData = fixtures.roboflow.search;
  } else {
    if (!process.env.ROBOFLOW_API_KEY) {
      throw new Error(
        "ROBOFLOW_API_KEY is required for the documented Universe API. Set it to enable Roboflow search."
      );
    }

    const url = new URL("https://api.roboflow.com/universe/search");
    url.searchParams.set("q", options.query);
    url.searchParams.set("api_key", process.env.ROBOFLOW_API_KEY);
    url.searchParams.set("page", "1");

    searchData = await fetchJson(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "never-reinvent-the-wheel",
      },
    });
  }

  const rawResults = searchData.results || searchData.datasets || [];
  const items = rawResults.slice(0, options.limit).map((dataset, index) => ({
    rank: index + 1,
    source_type: "dataset",
    full_name: dataset.id || dataset.slug || dataset.name,
    title: dataset.name,
    url: dataset.slug && dataset.owner
      ? `https://universe.roboflow.com/${dataset.owner}/${dataset.slug}`
      : dataset.url || null,
    description: dataset.project_type || "Roboflow Universe dataset",
    project_type: dataset.project_type || null,
    metrics: {
      images: dataset.images || null,
      stars: dataset.stars || 0,
    },
    assessment: buildAssessment({
      maintenance: "unknown",
      traction: scoreBucket(dataset.stars || 0, {
        high: 100,
        medium: 20,
      }),
      completeness: "dataset_level_only",
      extensibility: "requires_agent_judgment",
      executionRisk: "requires_agent_judgment",
    }),
  }));

  return okResult("roboflow", options.query, options, items, {
    platform_label: "Roboflow Universe baseline",
    total_count: rawResults.length,
    experimental: !usingFixtures(),
  });
}

const HELP_TEXT = baseHelp(
  "roboflow-baseline-search.mjs",
  "Search Roboflow Universe datasets. Requires ROBOFLOW_API_KEY for live requests."
);

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), { type: "ai" });
  if (options.help) {
    printHelp(HELP_TEXT);
    return;
  }
  if (!options.query) {
    printStructuredError("roboflow", "", "MISSING_QUERY", "A search query is required.", {
      help: HELP_TEXT,
    });
    process.exit(1);
  }

  try {
    console.log(JSON.stringify(await searchRoboflow(options), null, 2));
  } catch (error) {
    console.log(
      JSON.stringify(
        createStructuredError("roboflow", options.query, "ROBOFLOW_SEARCH_FAILED", error.message, {
          experimental: true,
        }),
        null,
        2
      )
    );
    process.exit(1);
  }
}

if (isEntrypoint(import.meta.url)) {
  main();
}
