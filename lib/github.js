const COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  Java: "#b07219",
  Solidity: "#AA6746",
};

export function languageColor(language) {
  return COLORS[language] ?? "#8a90a6";
}

export async function getLatestRepos({ username, token, limit = 6, fetchImpl = fetch }) {
  try {
    const headers = { Accept: "application/vnd.github+json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetchImpl(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=30`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .filter((r) => !r.fork)
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        updatedAt: r.pushed_at,
      }));
  } catch {
    return [];
  }
}
