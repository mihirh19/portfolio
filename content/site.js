// Owner: rewrite the project summaries, tech and highlights below in your own words.
export const site = {
  name: "Mihir Hadavani",
  role: "Software Engineer",
  roles: ["AI/ML engineer", "full-stack developer", "generative-AI builder", "gamer"],
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  githubUsername: "mihirh19",
  email: "miheerhadvani990@gmail.com",
  location: "Junagadh, Gujarat, India",
  timezone: "Asia/Kolkata",
  avatar: "/Newavtar.gif",
  resumeUrl:
    "https://drive.google.com/file/d/1xmE3BOmgM7TAOOgVp36xQIQvYDntDYoo/view?usp=sharing",
  socials: [
    { label: "GitHub", href: "https://github.com/mihirh19" },
    { label: "LinkedIn", href: "https://linkedin.com/in/mihir-hadavani-996263232" },
    { label: "X / Twitter", href: "https://twitter.com/mihirh21" },
    { label: "Instagram", href: "https://www.instagram.com/_mihirh.21" },
    { label: "Facebook", href: "https://facebook.com/mihir2107" },
  ],
  about: {
    headline:
      "I'm an AI/ML and full-stack developer who builds products that think — integrating generative AI into fast, delightful web apps.",
    paragraphs: [
      `I started building full-stack applications at seventeen, before I even knew what "full-stack" meant. Once HTML and CSS clicked, frameworks like Tailwind and Bootstrap made me feel unstoppable.`,
      `Since then I've shipped with React, Next.js, Node.js, Express, MongoDB, MySQL, C++, Python, FastAPI and more — and yes, I still check Stack Overflow for syntax.`,
      `Today I work where full-stack meets machine learning and generative AI. It's an exciting time to be a developer, and I'm thrilled to be building at that intersection.`,
    ],
  },
  skills: [
    { group: "AI / ML", items: ["Python", "scikit-learn", "NumPy", "Pandas", "LangChain", "Generative AI"] },
    { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "JavaScript", "HTML", "CSS"] },
    { group: "Backend", items: ["Node.js", "Express", "FastAPI", "Django", "Flask", "MongoDB", "MySQL", "PostgreSQL"] },
    { group: "Tools & Cloud", items: ["Git", "Docker", "Kubernetes", "AWS", "Postman", "Solidity", "C++", "Java"] },
  ],
  projects: [
    {
      slug: "finguru",
      title: "FinGuru: News Research Tool",
      image: "/finguru.png",
      repo: "https://github.com/mihirh19/news_research_tool_Equity-Research-Analysis-",
      demo: null,
      summary:
        "An equity-research assistant that ingests news articles and PDFs and answers questions about them with retrieval-augmented generation.",
      tech: ["Python", "LangChain", "Google Embeddings", "Streamlit"],
      highlights: [
        "Fetches and parses articles from URLs or uploaded PDFs",
        "Splits content into chunks and embeds them for semantic search",
        "Answers questions with cited sources",
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
      title: "B.Tech, Information Technology",
      org: "Dharmsinh Desai University, Nadiad",
      year: "2025",
      href: "https://www.ddu.ac.in",
      desc: "Graduated with a CGPA of 8.98. Nobody asks this, but it's okay.",
    },
    {
      title: "Full-stack Intern",
      org: "Devtown",
      year: "2022",
      href: "https://www.devtown.in",
      desc: "Developed a full-stack application with the MERN stack.",
    },
    {
      title: "Higher Secondary School",
      org: "Modi School, Rajkot",
      year: "2021",
      href: "https://school.careers360.com/schools/modi-school-ishwariya-rajkot",
      desc: "PCM — barely survived with a 94% aggregate. Flex Fridays, fellas.",
    },
    {
      title: "Secondary School",
      org: "Genius International School, Keshod",
      year: "2019",
      href: null,
      desc: "Barely survived with a 90% aggregate.",
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
