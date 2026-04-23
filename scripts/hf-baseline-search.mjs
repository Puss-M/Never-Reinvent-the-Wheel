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

function mapHubItem(sourceType, item, index) {
  const id = item.id || item.modelId || item.name;
  const baseUrl =
    sourceType === "model"
      ? `https://huggingface.co/${id}`
      : sourceType === "dataset"
        ? `https://huggingface.co/datasets/${id}`
        : `https://huggingface.co/spaces/${id}`;

  return {
    rank: index + 1,
    source_type: sourceType,
    full_name: id,
    title: id,
    url: baseUrl,
    description: item.description || null,
    pipeline_tag: item.pipeline_tag || null,
    updated_at: item.lastModified || item.last_modified || null,
    metrics: {
      likes: item.likes || 0,
      downloads: item.downloads || 0,
    },
    assessment: buildAssessment({
      maintenance: scoreBucket(new Date(item.lastModified || item.last_modified || 0).getTime(), {
        high: Date.now() - 1000 * 60 * 60 * 24 * 30,
        medium: Date.now() - 1000 * 60 * 60 * 24 * 180,
      }),
      traction: scoreBucket(item.downloads || item.likes || 0, {
        high: 10000,
        medium: 1000,
      }),
      completeness: sourceType === "space" ? "demo_or_app" : "asset_level_only",
      extensibility: "requires_agent_judgment",
      executionRisk: "requires_agent_judgment",
    }),
  };
}

export async function searchHuggingFace(options) {
  let models;
  let datasets;
  let spaces;

  if (usingFixtures()) {
    const fixtures = await readFixtures();
    models = fixtures.huggingface.models;
    datasets = fixtures.huggingface.datasets;
    spaces = fixtures.huggingface.spaces;
  } else {
    const headers = {
      Accept: "application/json",
      "User-Agent": "never-reinvent-the-wheel",
    };

    const [modelResponse, datasetResponse, spaceResponse] = await Promise.all([
      fetchJson(`https://huggingface.co/api/models?search=${encodeURIComponent(options.query)}&limit=${options.limit}`, {
        headers,
      }),
      fetchJson(`https://huggingface.co/api/datasets?search=${encodeURIComponent(options.query)}&limit=${options.limit}`, {
        headers,
      }),
      fetchJson(`https://huggingface.co/api/spaces?search=${encodeURIComponent(options.query)}&limit=${options.limit}`, {
        headers,
      }),
    ]);

    models = modelResponse;
    datasets = datasetResponse;
    spaces = spaceResponse;
  }

  const filteredModels = (models || [])
    .filter((item) => (item.downloads || 0) >= options.minDownloads || (item.likes || 0) > 0)
    .slice(0, options.limit)
    .map((item, index) => mapHubItem("model", item, index));
  const filteredDatasets = (datasets || [])
    .filter((item) => (item.downloads || 0) >= Math.max(0, Math.floor(options.minDownloads / 5)) || (item.likes || 0) > 0)
    .slice(0, options.limit)
    .map((item, index) => mapHubItem("dataset", item, index));
  const filteredSpaces = (spaces || [])
    .slice(0, options.limit)
    .map((item, index) => mapHubItem("space", item, index));

  const items = [...filteredModels, ...filteredDatasets, ...filteredSpaces]
    .sort((a, b) => (b.metrics.downloads || b.metrics.likes || 0) - (a.metrics.downloads || a.metrics.likes || 0))
    .slice(0, options.limit * 2);

  return okResult("huggingface", options.query, options, items, {
    platform_label: "Hugging Face Hub baseline",
    total_count: (models?.length || 0) + (datasets?.length || 0) + (spaces?.length || 0),
    source_breakdown: {
      models: filteredModels.length,
      datasets: filteredDatasets.length,
      spaces: filteredSpaces.length,
    },
  });
}

const HELP_TEXT = baseHelp(
  "hf-baseline-search.mjs",
  "Search Hugging Face models, datasets, and Spaces for AI/CV reuse candidates."
);

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), { type: "ai", minDownloads: 100 });
  if (options.help) {
    printHelp(HELP_TEXT);
    return;
  }
  if (!options.query) {
    printStructuredError("huggingface", "", "MISSING_QUERY", "A search query is required.", {
      help: HELP_TEXT,
    });
    process.exit(1);
  }

  try {
    console.log(JSON.stringify(await searchHuggingFace(options), null, 2));
  } catch (error) {
    console.log(
      JSON.stringify(
        createStructuredError("huggingface", options.query, "HUGGINGFACE_SEARCH_FAILED", error.message),
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
