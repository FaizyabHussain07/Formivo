/**
 * Documentation information architecture.
 *
 * One source of truth for the sidebar, the search index, the previous/next pager and
 * the sitemap, so a new page cannot drift out of the navigation.
 */
export type DocPage = {
  title: string;
  href: string;
  description: string;
};

export type DocGroup = {
  title: string;
  pages: DocPage[];
};

export const DOCS_NAV: DocGroup[] = [
  {
    title: "Get started",
    pages: [
      {
        title: "Introduction",
        href: "/docs",
        description: "What Formivo is, what it stores, and how the pieces fit together.",
      },
      {
        title: "Quickstart",
        href: "/docs/quickstart",
        description: "Create a form, copy its endpoint and receive your first submission.",
      },
      {
        title: "Account verification",
        href: "/docs/account-verification",
        description: "The six-digit email code, resend behavior and verified-only access.",
      },
    ],
  },
  {
    title: "Integrations",
    pages: [
      {
        title: "HTML forms",
        href: "/docs/html",
        description: "Point an existing <form> at a Formivo endpoint with no JavaScript.",
      },
      {
        title: "JavaScript",
        href: "/docs/javascript",
        description: "Send submissions with fetch and handle success and failure states.",
      },
      {
        title: "React",
        href: "/docs/react",
        description: "A small controlled-form hook with validation and error handling.",
      },
      {
        title: "Next.js",
        href: "/docs/nextjs",
        description: "App Router and Route Handler patterns, including server actions.",
      },
    ],
  },
  {
    title: "Reference",
    pages: [
      {
        title: "API reference",
        href: "/docs/api",
        description: "Endpoint contract, request fields, responses, status codes and limits.",
      },
      {
        title: "Spam protection",
        href: "/docs/spam-protection",
        description: "Honeypots, rate limits, origin rules and how to tune them.",
      },
    ],
  },
  {
    title: "Product",
    pages: [
      {
        title: "Submissions",
        href: "/docs/submissions",
        description: "Statuses, filtering, export and what each plan allows.",
      },
      {
        title: "Client portal",
        href: "/docs/client-portal",
        description: "Invite a client, scope their access and revoke it later.",
      },
    ],
  },
  {
    title: "Help",
    pages: [
      {
        title: "Troubleshooting",
        href: "/docs/troubleshooting",
        description: "The failures people actually hit, and the fix for each one.",
      },
      {
        title: "Changelog",
        href: "/docs/changelog",
        description: "What shipped, in order, with dates.",
      },
    ],
  },
];

export const DOCS_FLAT: DocPage[] = DOCS_NAV.flatMap((group) => group.pages);

export function findDocPage(href: string): DocPage | undefined {
  return DOCS_FLAT.find(
    (page) => page.href === href || (page.href !== "/docs" && href.startsWith(`${page.href}/`)),
  );
}

export function docsPager(href: string): { previous?: DocPage; next?: DocPage } {
  const index = DOCS_FLAT.findIndex(
    (page) => page.href === href || (page.href !== "/docs" && href.startsWith(`${page.href}/`)),
  );
  if (index === -1) return {};
  return { previous: DOCS_FLAT[index - 1], next: DOCS_FLAT[index + 1] };
}
