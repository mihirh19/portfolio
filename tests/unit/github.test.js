import { describe, expect, test, mock } from "bun:test";
import { getLatestRepos, languageColor } from "@/lib/github";

const apiRepo = (o) => ({
  id: 1, name: "repo", description: "d", html_url: "https://github.com/u/repo",
  stargazers_count: 3, language: "Python", pushed_at: "2026-09-01T00:00:00Z", fork: false, ...o,
});

describe("getLatestRepos", () => {
  test("maps fields, skips forks, respects limit, sends token + revalidate", async () => {
    const fetchImpl = mock(async () => ({
      ok: true,
      json: async () => [apiRepo({ id: 1 }), apiRepo({ id: 2, fork: true }), apiRepo({ id: 3 }), apiRepo({ id: 4 })],
    }));
    const repos = await getLatestRepos({ username: "u", token: "t", limit: 2, fetchImpl });
    expect(repos).toEqual([
      { id: 1, name: "repo", description: "d", url: "https://github.com/u/repo", stars: 3, language: "Python", updatedAt: "2026-09-01T00:00:00Z" },
      { id: 3, name: "repo", description: "d", url: "https://github.com/u/repo", stars: 3, language: "Python", updatedAt: "2026-09-01T00:00:00Z" },
    ]);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.github.com/users/u/repos?sort=pushed&per_page=30");
    expect(init.headers.Authorization).toBe("Bearer t");
    expect(init.next).toEqual({ revalidate: 3600 });
  });

  test("no token → no Authorization header", async () => {
    const fetchImpl = mock(async () => ({ ok: true, json: async () => [] }));
    await getLatestRepos({ username: "u", fetchImpl });
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test("non-ok or thrown → []", async () => {
    expect(await getLatestRepos({ username: "u", fetchImpl: async () => ({ ok: false }) })).toEqual([]);
    expect(await getLatestRepos({ username: "u", fetchImpl: async () => { throw new Error("x"); } })).toEqual([]);
  });
});

test("languageColor has a fallback", () => {
  expect(languageColor("JavaScript")).toBe("#f1e05a");
  expect(languageColor("Klingon")).toBe("#8a90a6");
  expect(languageColor(null)).toBe("#8a90a6");
});
