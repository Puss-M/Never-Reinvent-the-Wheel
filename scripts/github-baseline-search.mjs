#!/usr/bin/env node

const args = process.argv.slice(2);

function parseArgs(argv) {
  const options = {
    query: "",
    limit: 5,
    minStars: 100,
    pushedWithinDays: 365,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--") && !options.query) {
      options.query = arg;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Number(argv[i + 1] || options.limit);
      i += 1;
      continue;
    }
    if (arg === "--min-stars") {
      options.minStars = Number(argv[i + 1] || options.minStars);
      i += 1;
      continue;
    }
    if (arg === "--pushed-within-days") {
      options.pushedWithinDays = Number(argv[i + 1] || options.pushedWithinDays);
      i += 1;
    }
  }

  return options;
}

function daysAgoDate(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function buildSearchQuery({ query, minStars, pushedWithinDays }) {
  return `${query} stars:>=${minStars} pushed:>=${daysAgoDate(pushedWithinDays)}`;
}

async function searchRepositories(searchQuery, limit) {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", searchQuery);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(Math.min(limit, 20)));

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "never-reinvent-the-wheel",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }
  return response.json();
}

function mapRepository(repo, index) {
  return {
    rank: index + 1,
    full_name: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    updated_at: repo.pushed_at,
    license: repo.license?.spdx_id || null,
  };
}

async function main() {
  const options = parseArgs(args);
  if (!options.query) {
    console.error(
      "Usage: node scripts/github-baseline-search.mjs <query> [--limit 5] [--min-stars 100] [--pushed-within-days 365]"
    );
    process.exit(1);
  }

  const searchQuery = buildSearchQuery(options);
  const result = await searchRepositories(searchQuery, options.limit);
  const items = (result.items || []).slice(0, options.limit).map(mapRepository);

  console.log(
    JSON.stringify(
      {
        query: options.query,
        query_string: searchQuery,
        total_count: result.total_count || 0,
        returned_count: items.length,
        items,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
