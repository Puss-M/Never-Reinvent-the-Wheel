#!/usr/bin/env node

import {
  baseHelp,
  buildAssessment,
  createStructuredError,
  fetchJson,
  fetchText,
  okResult,
  parseCommonArgs,
  printHelp,
  printStructuredError,
  readFixtures,
  scoreBucket,
  isEntrypoint,
  usingFixtures,
} from "./_shared.mjs";

function parsePyPiSearchResults(html, limit) {
  const results = [];
  const regex =
    /<a class="package-snippet" href="\/project\/([^/]+)\/">[\s\S]*?<span class="package-snippet__name">([^<]+)<\/span>[\s\S]*?<p class="package-snippet__description">([\s\S]*?)<\/p>[\s\S]*?<time[^>]*datetime="([^"]+)"/g;

  let match;
  while ((match = regex.exec(html)) && results.length < limit) {
    results.push({
      project: match[1],
      name: match[2].trim(),
      description: match[3].replace(/\s+/g, " ").trim(),
      updated_at: match[4],
    });
  }

  return results;
}

function latestReleaseTimestamp(releases, version) {
  const files = releases?.[version] || [];
  return files[0]?.upload_time_iso_8601 || null;
}

export async function searchPyPi(options) {
  let searchResults;

  if (usingFixtures()) {
    const fixtures = await readFixtures();
    searchResults = parsePyPiSearchResults(fixtures.pypi.search_html, options.limit);
    const items = searchResults.map((result, index) => {
      const projectData = fixtures.pypi.projects[result.project];
      const releaseTime = latestReleaseTimestamp(projectData.releases, projectData.info.version) || result.updated_at;
      return {
        rank: index + 1,
        source_type: "package",
        full_name: projectData.info.name,
        title: projectData.info.name,
        url: `https://pypi.org/project/${projectData.info.name}/`,
        description: projectData.info.summary || result.description,
        latest_version: projectData.info.version,
        updated_at: releaseTime,
        homepage_url: projectData.info.project_urls?.Homepage || null,
        license: projectData.info.license || null,
        metrics: {
          release_count: Object.keys(projectData.releases || {}).length,
        },
        assessment: buildAssessment({
          maintenance: scoreBucket(new Date(releaseTime || 0).getTime(), {
            high: Date.now() - 1000 * 60 * 60 * 24 * 30,
            medium: Date.now() - 1000 * 60 * 60 * 24 * 180,
          }),
          traction: "unknown",
          completeness: "package_level_only",
          extensibility: "requires_agent_judgment",
          executionRisk: "requires_agent_judgment",
        }),
      };
    });

    return okResult("pypi", options.query, options, items, {
      platform_label: "PyPI package baseline",
      total_count: searchResults.length,
    });
  }

  const searchUrl = `https://pypi.org/search/?q=${encodeURIComponent(options.query)}`;
  const html = await fetchText(searchUrl, {
    headers: {
      Accept: "text/html",
      "User-Agent": "never-reinvent-the-wheel",
    },
  });

  searchResults = parsePyPiSearchResults(html, options.limit);

  const items = [];
  for (const [index, result] of searchResults.entries()) {
    const projectData = await fetchJson(`https://pypi.org/pypi/${encodeURIComponent(result.project)}/json`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "never-reinvent-the-wheel",
      },
    });

    const releaseTime =
      latestReleaseTimestamp(projectData.releases, projectData.info.version) || result.updated_at || null;

    items.push({
      rank: index + 1,
      source_type: "package",
      full_name: projectData.info.name,
      title: projectData.info.name,
      url: `https://pypi.org/project/${projectData.info.name}/`,
      description: projectData.info.summary || result.description,
      latest_version: projectData.info.version,
      updated_at: releaseTime,
      homepage_url: projectData.info.project_urls?.Homepage || null,
      license: projectData.info.license || null,
      metrics: {
        release_count: Object.keys(projectData.releases || {}).length,
      },
      assessment: buildAssessment({
        maintenance: scoreBucket(new Date(releaseTime || 0).getTime(), {
          high: Date.now() - 1000 * 60 * 60 * 24 * 30,
          medium: Date.now() - 1000 * 60 * 60 * 24 * 180,
        }),
        traction: "unknown",
        completeness: "package_level_only",
        extensibility: "requires_agent_judgment",
        executionRisk: "requires_agent_judgment",
      }),
    });
  }

  return okResult("pypi", options.query, options, items, {
    platform_label: "PyPI package baseline",
    total_count: searchResults.length,
  });
}

const HELP_TEXT = baseHelp(
  "pypi-baseline-search.mjs",
  "Search PyPI packages as a secondary software ecosystem after the GitHub baseline."
);

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), { type: "software" });
  if (options.help) {
    printHelp(HELP_TEXT);
    return;
  }
  if (!options.query) {
    printStructuredError("pypi", "", "MISSING_QUERY", "A search query is required.", {
      help: HELP_TEXT,
    });
    process.exit(1);
  }

  try {
    console.log(JSON.stringify(await searchPyPi(options), null, 2));
  } catch (error) {
    console.log(
      JSON.stringify(createStructuredError("pypi", options.query, "PYPI_SEARCH_FAILED", error.message), null, 2)
    );
    process.exit(1);
  }
}

if (isEntrypoint(import.meta.url)) {
  main();
}
