#!/usr/bin/env node

import {
  baseHelp,
  buildAssessment,
  createStructuredError,
  daysAgoDate,
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

export async function searchGitHub(options) {
  const searchQuery = `${options.query} stars:>=${options.minStars} pushed:>=${daysAgoDate(options.pushedWithinDays)}`;

  let result;
  if (usingFixtures()) {
    const fixtures = await readFixtures();
    result = fixtures.github;
  } else {
    const url = new URL("https://api.github.com/search/repositories");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("sort", "stars");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", String(Math.min(options.limit, 20)));

    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "never-reinvent-the-wheel",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    result = await fetchJson(url, { headers });
  }

  const items = (result.items || []).slice(0, options.limit).map((repo, index) => ({
    rank: index + 1,
    source_type: "repository",
    full_name: repo.full_name,
    title: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    created_at: repo.created_at,
    updated_at: repo.pushed_at,
    license: repo.license?.spdx_id || repo.license?.name || null,
    metrics: {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    },
    assessment: buildAssessment({
      maintenance: scoreBucket(new Date(repo.pushed_at).getTime(), {
        high: Date.now() - 1000 * 60 * 60 * 24 * 30,
        medium: Date.now() - 1000 * 60 * 60 * 24 * 180,
      }),
      traction: scoreBucket(repo.stargazers_count, {
        high: 5000,
        medium: 1000,
      }),
      completeness: "requires_agent_judgment",
      extensibility: "requires_agent_judgment",
      executionRisk: "requires_agent_judgment",
    }),
  }));

  return okResult("github", options.query, options, items, {
    query_string: searchQuery,
    total_count: result.total_count || 0,
    platform_label: "GitHub repository baseline",
  });
}

const HELP_TEXT = baseHelp(
  "github-baseline-search.mjs",
  "Search GitHub repositories as the mandatory first phase of the build-vs-buy review."
);

async function main() {
  const options = parseCommonArgs(process.argv.slice(2), { type: "software" });
  if (options.help) {
    printHelp(HELP_TEXT);
    return;
  }
  if (!options.query) {
    printStructuredError("github", "", "MISSING_QUERY", "A search query is required.", {
      help: HELP_TEXT,
    });
    process.exit(1);
  }

  try {
    console.log(JSON.stringify(await searchGitHub(options), null, 2));
  } catch (error) {
    console.log(
      JSON.stringify(
        createStructuredError("github", options.query, "GITHUB_SEARCH_FAILED", error.message),
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
