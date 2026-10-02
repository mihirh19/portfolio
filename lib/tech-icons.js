// Animated icons from techstack-generator where they exist, Simple Icons otherwise.
// `mono` icons are near-black brand marks that get turned white in dark mode.
// techstack icons carry extra padding, so they render a bit larger to match Simple Icons.
const ts = (name) => ({ src: `https://techstack-generator.vercel.app/${name}-icon.svg`, mono: false, scale: 1.3 });
const si = (slug, mono = false) => ({ src: `https://cdn.simpleicons.org/${slug}`, mono, scale: 1 });

const ICONS = {
  JavaScript: ts("js"),
  Python: ts("python"),
  "C++": ts("cpp"),
  Java: ts("java"),
  Django: ts("django"),
  React: ts("react"),
  MySQL: ts("mysql"),
  AWS: ts("aws"),
  Docker: ts("docker"),
  Kubernetes: ts("kubernetes"),

  TypeScript: si("typescript"),
  "scikit-learn": si("scikitlearn"),
  NumPy: si("numpy", true),
  Pandas: si("pandas", true),
  LangChain: si("langchain", true),
  "Next.js": si("nextdotjs", true),
  "Tailwind CSS": si("tailwindcss"),
  HTML: si("html5"),
  CSS: si("css"),
  "Node.js": si("nodedotjs"),
  Express: si("express", true),
  FastAPI: si("fastapi"),
  Flask: si("flask", true),
  MongoDB: si("mongodb"),
  PostgreSQL: si("postgresql"),
  Git: si("git"),
  Postman: si("postman"),
  Solidity: si("solidity", true),
  "Google Embeddings": si("google"),
  Streamlit: si("streamlit"),
  "Ethers.js": si("ethers", true),
  JWT: si("jsonwebtokens", true),
  "Jupyter Notebook": si("jupyter"),
};

export function techIcon(name) {
  return ICONS[name] ?? null;
}
