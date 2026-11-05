/** Shared content model for the marketing site (blog, guides, alternatives, docs). */

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; language: string; code: string; title?: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "note"; title: string; text: string }
  | { type: "quote"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: "Fundamentals" | "Integration" | "Security" | "Clients";
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  /** One-line answer used in the intro and by answer engines. */
  answer: string;
  blocks: ContentBlock[];
};

export type Guide = {
  slug: string;
  language: string;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  requirements: string[];
  steps: string[];
  code: string;
  response: string;
  troubleshooting: { problem: string; fix: string }[];
  related: string[];
};

export type Alternative = {
  slug: string;
  competitor: string;
  title: string;
  seoTitle: string;
  description: string;
  summary: string;
  /** Facts read from the competitor's own site, with the date they were checked. */
  verifiedOn: string;
  competitorSource: string;
  competitorFacts: string[];
  bestFor: string[];
  formivoDifference: string[];
  comparison: { dimension: string; formivo: string; competitor: string }[];
  chooseCompetitor: string[];
  chooseFormivo: string[];
  faq: { question: string; answer: string }[];
};
