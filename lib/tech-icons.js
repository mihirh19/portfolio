// Animated icons from techstack-generator where they exist, Simple Icons otherwise.
// `mono` icons are near-black brand marks that get turned white in dark mode.
// techstack icons carry extra padding, so they render a bit larger to match Simple Icons.
const ts = (name) => ({ src: `https://techstack-generator.vercel.app/${name}-icon.svg`, mono: false, scale: 1.3 });
const si = (slug, mono = false) => ({ src: `https://cdn.simpleicons.org/${slug}`, mono, scale: 1 });
const dev = (path) => ({ src: `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}.svg`, mono: false, scale: 1 });
// No vector mark on the icon CDNs, so use the project's GitHub avatar.
const gh = (org) => ({ src: `https://github.com/${org}.png?size=64`, mono: false, scale: 1, rounded: true });

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

  // From the resume
  Agno: gh("agno-agi"),
  "MCP / FastMCP": si("modelcontextprotocol", true),
  "Google Gemini": si("googlegemini"),
  pgvector: si("postgresql"),
  Rust: si("rust", true),
  SQL: si("sqlite"),
  "Spring Boot": si("springboot"),
  gRPC: dev("grpc/grpc-original"),
  "Apache Kafka": si("apachekafka", true),
  Zitadel: gh("zitadel"),
  Azure: dev("azure/azure-original"),
  Traefik: si("traefikproxy"),
  Prometheus: si("prometheus"),
  Grafana: si("grafana"),
  "GitHub Actions": si("githubactions"),
  "Docker Compose": ts("docker"),
  "AWS Lambda": ts("aws"),
  "AWS API Gateway": ts("aws"),
  "AWS SageMaker": ts("aws"),
  "AWS S3": ts("aws"),
};

export function techIcon(name) {
  return ICONS[name] ?? null;
}
