// Owner: rewrite the project summaries, tech and highlights below in your own words.
export const site = {
  name: "Mihir Hadavani",
  role: "Software Engineer",
  roles: ["an AI agent engineer", "a RAG systems builder", "a backend engineer", "a DevOps tinkerer"],
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  githubUsername: "mihirh19",
  email: "mihirhadvani2107@gmail.com",
  location: "Pune, Maharashtra, India",
  timezone: "Asia/Kolkata",
  avatar: "/Newavtar.gif",
  resumeUrl: "/Mihir_Hadavani_Resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/mihirh19" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mihir-hadavani-996263232/" },
    { label: "LeetCode", href: "https://leetcode.com/mihir21/" },
    { label: "X / Twitter", href: "https://twitter.com/mihirh21" },
    { label: "Instagram", href: "https://www.instagram.com/_mihirh.21" },
    { label: "Facebook", href: "https://facebook.com/mihir2107" },
  ],
  about: {
    headline:
      "I'm a software engineer building AI agents and RAG systems that turn enterprise data into safe, real-world action.",
    paragraphs: [
      `At SteepGraph I architect multi-agent systems for Aras Innovator PLM — agents that answer product-data questions, author schema changes behind human-in-the-loop approval and compare BOMs across versions, all on a Python/FastAPI and PostgreSQL backend.`,
      `My day-to-day spans vector embeddings, semantic search and agentic memory, custom MCP servers, identity with Zitadel (OIDC, PKCE, SSO) and eval harnesses that replay real LLM calls to keep agents honest.`,
      `I'm comfortable across the whole decision-to-action lifecycle: data ingestion and validation, system design with gRPC and Kafka, and production deployment on Docker, Kubernetes and the cloud.`,
    ],
  },
  certifications: [
    {
      title: "AWS Academy Graduate — Machine Learning Foundations",
      date: "May 2024",
      href: "https://www.credly.com/badges/ce5d39f4-b3c3-4214-aa20-cc25527e6474/linked_in_profile",
    },
    {
      title: "AWS Academy Graduate — Cloud Foundations",
      date: "Dec 2023",
      href: "https://www.credly.com/badges/99d61c02-3da1-4d54-a538-61be25a275f0/public_url",
    },
    {
      title: "Google Cloud Study Jams",
      date: "Nov 2023",
      href: "https://drive.google.com/file/d/1N2Slvl3yY-TR5v4wYL7MJKfCiC-MEygN/view",
    },
    { title: "Full Stack Development", date: "Nov 2022", href: "https://www.cert.devtown.in/verify/Vei5G" },
    { title: "300+ problems solved on LeetCode", date: "Ongoing", href: "https://leetcode.com/mihir21/" },
  ],
  skills: [
    { group: "AI / Gen AI", items: ["Agno", "MCP / FastMCP", "LangChain", "Google Gemini", "pgvector", "RAG", "LLM APIs", "Agentic Memory", "Prompt Engineering"] },
    { group: "Languages", items: ["Python", "Java", "TypeScript", "SQL", "Rust"] },
    { group: "Backend & System Design", items: ["FastAPI", "Spring Boot", "gRPC", "Apache Kafka", "PostgreSQL", "Microservices", "Design Patterns"] },
    { group: "Identity, Cloud & DevOps", items: ["Zitadel", "AWS", "Azure", "Docker", "Kubernetes", "Traefik", "Prometheus", "Grafana", "GitHub Actions", "Git"] },
  ],
  projects: [
    {
      slug: "kavach",
      title: "Kavach: Fintech Resilience Control Plane",
      image: "/kavach.svg",
      repo: "https://github.com/mihirh19/baas_Kavach",
      demo: null,
      summary:
        "A resilience layer for fintech apps: when one BaaS-provider/bank pair fails or degrades, Kavach fails money movement over instead of letting it halt.",
      tech: ["Rust", "Java", "gRPC", "Apache Kafka", "PostgreSQL", "Docker Compose"],
      highlights: [
        "Full HLD/LLD across 5 database-per-service microservices",
        "Saga-based failover orchestration with circuit breakers, CQRS-lite and idempotent receivers",
        "gRPC for correctness-critical calls like breaker checks and ledger posting",
        "Kafka for async, at-least-once fact propagation — webhook normalization and ledger postings",
      ],
    },
    {
      slug: "finguru",
      title: "FinGuru: News Research Tool",
      image: "/finguru.png",
      repo: "https://github.com/mihirh19/news_research_tool_Equity-Research-Analysis-",
      demo: null,
      summary:
        "A generative-AI research tool that ingests news URLs and PDFs and answers questions grounded in the source articles.",
      tech: ["LangChain", "Python", "Google Gemini", "Streamlit", "AWS Lambda", "AWS API Gateway", "AWS SageMaker", "AWS S3"],
      highlights: [
        "Ingests articles from URLs or uploaded PDFs",
        "Generates vector embeddings over the extracted text for semantic search",
        "Uses LangChain + Google Gemini to answer questions and surface insights with sources",
        "Serverless deployment on AWS Lambda and API Gateway, with SageMaker and S3",
      ],
    },
    {
      slug: "cashcraft",
      title: "CashCraft",
      image: "/cashcraft.png",
      repo: "https://github.com/mihirh19/cashcraft",
      demo: null,
      summary: "A personal-finance app for tracking income, expenses and budgets.",
      tech: ["React", "Node.js", "MongoDB"],
      highlights: ["Expense and income tracking", "Budget overview dashboard", "Authentication"],
    },
    {
      slug: "crowdfunding",
      title: "CrowdFunding Web3 App",
      image: "/crowdfunding.png",
      repo: "https://github.com/mihirh19/crowdfunding",
      demo: null,
      summary: "A decentralized crowdfunding platform where campaigns and donations live on-chain.",
      tech: ["Solidity", "React", "Ethers.js"],
      highlights: ["Create and fund campaigns from a wallet", "Smart-contract-backed transparency", "Campaign progress tracking"],
    },
    {
      slug: "todo-app",
      title: "Todo App",
      image: "/todo.png",
      repo: "https://github.com/mihirh19/todo_web_app",
      demo: null,
      summary: "A clean task manager with create, complete and delete flows.",
      tech: ["JavaScript", "HTML", "CSS"],
      highlights: ["Add, complete and remove tasks", "Persistent storage", "Responsive layout"],
    },
    {
      slug: "placement-recommendation",
      title: "Placement Recommendation",
      image: "/placement.png",
      repo: "https://github.com/mihirh19/placement-recommendation",
      demo: null,
      summary: "A machine-learning model that predicts placement outcomes and recommends improvements for students.",
      tech: ["Python", "scikit-learn", "Pandas"],
      highlights: ["Data cleaning and feature engineering", "Model comparison and tuning", "Interactive prediction UI"],
    },
    {
      slug: "newsgenix",
      title: "Newsgenix",
      image: "/Newsgenix.png",
      repo: "https://github.com/mihirh19/NewsMonkey",
      demo: null,
      summary: "A category-based news reader with infinite scrolling.",
      tech: ["React", "News API"],
      highlights: ["Category browsing", "Infinite scroll", "Loading progress bar"],
    },
    {
      slug: "inotebook",
      title: "iNoteBook",
      image: "/INotebook.png",
      repo: "https://github.com/mihirh19/inotebook",
      demo: null,
      summary: "A secure cloud notebook for writing and organizing notes.",
      tech: ["React", "Express", "MongoDB", "JWT"],
      highlights: ["User authentication", "Create, edit and delete notes", "REST API backend"],
    },
    {
      slug: "zomato-clone",
      title: "Zomato Clone",
      image: "/Zomato.png",
      repo: "https://github.com/mihirh19/zomato_front_clone",
      demo: null,
      summary: "A front-end recreation of the Zomato food-delivery landing experience.",
      tech: ["HTML", "CSS", "JavaScript"],
      highlights: ["Pixel-faithful responsive layout", "Search and collections UI"],
    },
  ],
  experience: [
    {
      title: "Software Engineer",
      org: "SteepGraph",
      year: "Jul 2025 — Present",
      href: "https://www.steepgraph.com",
      desc: "Pune, Maharashtra · On-site",
      points: [
        "Architected a multi-agent AI system in Agno for Aras Innovator PLM — answers PLM queries, authors schema changes under human-in-the-loop approval and compares BOMs across versions.",
        "Built a custom FastMCP server exposing dozens of tools over Aras's OData REST API and AML, with per-session credential isolation and a self-invalidating schema cache.",
        "Implemented a hybrid-search RAG pipeline on pgvector with semantic chunking, plus an agentic memory layer so agents reuse insights across sessions.",
        "Integrated Zitadel identity: custom login UI, PKCE, RS256 JWT verification with rotating JWKS, SSO and machine-to-machine auth.",
        "Deployed the platform as multi-tenant SaaS on Docker and Kubernetes with Traefik ingress and Prometheus/Grafana monitoring.",
      ],
    },
    {
      title: "DevOps Intern",
      org: "Inventyv Software Services",
      year: "May 2024 — Dec 2024",
      href: null,
      desc: "On-site",
      points: [
        "Built a CI/CD pipeline with GitHub Actions, Docker, Spinnaker and Kubernetes.",
        "Tuned Kubernetes HPA policies and resource limits to scale cleanly under variable traffic.",
        "Set up Prometheus and Grafana dashboards for real-time monitoring and faster incident response.",
      ],
    },
    {
      title: "B.Tech, Information Technology",
      org: "Dharmsinh Desai University, Nadiad",
      year: "2021 — 2025",
      href: "https://www.ddu.ac.in",
      desc: "Graduated with a CGPA of 8.89 / 10.",
    },
    {
      title: "Higher Secondary (HSC)",
      org: "Modi School, Rajkot",
      year: "2019 — 2021",
      href: "https://school.careers360.com/schools/modi-school-ishwariya-rajkot",
      desc: "Scored 91.53%.",
    },
  ],
};

export function getProject(slug) {
  return site.projects.find((p) => p.slug === slug);
}

export function getNextProject(slug) {
  const i = site.projects.findIndex((p) => p.slug === slug);
  return site.projects[(i + 1) % site.projects.length];
}
