# Formivo SEO, AEO and GEO implementation

Status: 11 November 2026. This document separates what is implemented in the codebase,
what needs account access, and what is a recommendation rather than a result. No search
volume, ranking, traffic or Domain Rating numbers are asserted here because none were
measured in this environment.

## 1. Technical foundation

| Area                      | Status                                                                                                  | Where                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Canonical origin          | Fixed to `https://formivo.faizyab.me` at build time                                                     | `src/config/site.ts`, `src/lib/seo.ts`     |
| Canonical tags            | Every marketing page sets one; dynamic pages use their own slug                                         | page-level `metadata`                      |
| robots.txt                | Public marketing is allowed; app, auth, invite and API routes are disallowed                            | `src/app/robots.ts`                        |
| XML sitemap               | Static pages, articles, guides, comparisons, docs and blog categories                                   | `src/app/sitemap.ts`                       |
| Trailing slashes          | Framework normalises the root canonical to the host without a slash, which is one URL to search engines | Next.js metadata                           |
| Indexing of private areas | Developers, clients, admin, invitations and auth are `noindex` and blocked in robots                    | route layouts and `next.config.ts` headers |
| 404 handling              | Unknown routes return the Next.js not-found response                                                    | app router                                 |
| Preferred host            | `https://` and the production hostname are used in canonicals, OG and schema                            | `SITE_URL`                                 |

### Metadata coverage

Unique titles, descriptions, canonical URLs and OG/Twitter data exist for the homepage,
features, pricing, about, contact, security, privacy, terms, guides index, guide detail,
alternatives index, alternative detail, blog index, blog categories, blog articles and
docs pages. Docs use the shared `docMetadata` helper.

The homepage uses the specified absolute title:

`Form Backend for Developers & Agencies | Formivo`

and the specified description:

`Connect HTML, React and Next.js forms to Formivo. Collect submissions, manage leads and give clients their own private portal. Start free.`

## 2. Structured data

Implemented in `src/components/marketing/structured-data.tsx`:

- `Organization`
- `WebSite`
- `SoftwareApplication` with offers generated from `src/lib/billing/plans.ts`
- `FAQPage` built from the same 17 answers rendered on the page

Article, guide and comparison pages carry their own visible content and metadata. No
`aggregateRating`, review count, price or availability is invented. `FAQPage` markup is
valid but Google no longer guarantees FAQ rich results; it is there for entity clarity,
not as a traffic trick.

## 3. Social previews

- Every indexable page points at an absolute HTTPS image.
- The homepage and brand-level shares use `/og-image.jpg` (1200 x 630).
- Content pages use the generated `/og` route with a page-specific title, subtitle and
  content type (`product`, `blog`, `guide`, `comparison`, `docs`).
- `og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, `og:image`,
  dimensions, alt text and `twitter:card=summary_large_image` are set.
- The generated cards are text-only compositions, so query input cannot inject markup.

Manual validation still needed: LinkedIn Post Inspector, X card preview, Facebook Sharing
Debugger. Caches can take time to refresh even after the tags are correct.

## 4. AEO and GEO

Implemented:

- Direct, factual answers in the FAQ and article `answer` fields.
- One clear H1 and a logical H2/H3 hierarchy on the homepage.
- Accessible, server-rendered HTML for every marketing claim.
- `llms.txt` and `llms-full.txt` summaries that only repeat content a crawler can read.
- Explicit crawler rules for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
  PerplexityBot, Google-Extended, Bingbot and Applebot-Extended.
- Consistent entity facts: product name, category, audience, functionality and origin.
- No invented citations, reviews, customer logos or usage statistics.

Entity sentence used consistently: Formivo is a developer-first form backend and lead
management platform for freelancers and web development agencies. It connects existing
website forms to one public endpoint, stores submissions, organizes leads, and gives each
client a read-only portal for the form shared with them.

## 5. Keyword map

Volume and difficulty evidence requires Google Ads, Search Console, Ahrefs or Semrush
access, which this environment does not have. The map below is built from search intent
and existing page coverage, and should be validated against those tools before new pages
are prioritised.

| Primary keyword                               | Intent                   | Target page                                       | Content already covers it             |
| --------------------------------------------- | ------------------------ | ------------------------------------------------- | ------------------------------------- |
| form backend                                  | Commercial investigation | `/`                                               | Yes                                   |
| form backend for developers                   | Commercial               | `/`                                               | Yes                                   |
| form submission backend                       | Commercial               | `/`                                               | Yes                                   |
| html form backend                             | Informational / how-to   | `/guides/html`                                    | Yes                                   |
| how to receive html form submissions          | Informational            | `/blog/how-to-receive-html-form-submissions`      | Verify slug and coverage              |
| react form backend                            | Informational / how-to   | `/guides/react`                                   | Yes                                   |
| next.js form backend                          | Informational / how-to   | `/guides/nextjs`, `/blog/nextjs-form-submissions` | Verify slug and coverage              |
| contact form backend                          | Commercial               | `/features`, `/pricing`                           | Yes                                   |
| form endpoint service                         | Commercial               | `/docs/api`                                       | Yes                                   |
| client portal for web agencies                | Commercial               | `/docs/client-portal`                             | Yes                                   |
| give clients access to form submissions       | Informational            | `/blog/share-form-submissions-with-clients`       | Yes                                   |
| manage leads from multiple websites           | Commercial               | `/features`, use cases                            | Partially, could use a dedicated page |
| formspree alternatives                        | Commercial comparison    | `/alternatives/formspree`                         | Yes                                   |
| web3forms alternatives                        | Commercial comparison    | `/alternatives/web3forms`                         | Yes                                   |
| best form backend for developers              | Commercial listicle      | Blog opportunity                                  | Not yet a dedicated roundup           |
| how to build a contact form without a backend | Informational            | Guide or article                                  | Covered across guides                 |
| prevent contact form spam                     | Informational            | `/blog/prevent-contact-form-spam`                 | Yes                                   |
| form backend vs custom backend                | Commercial investigation | `/blog/form-backend-vs-custom-backend`            | Verify slug and coverage              |
| organize website form submissions             | Informational            | `/docs/submissions`                               | Yes                                   |

Cannibalisation rule: one primary intent per URL. Product pages target buying intent,
guides target implementation, articles target definitions and comparisons. New articles
must link to the existing page that owns the commercial intent instead of repeating it.

## 6. Content roadmap

Priority is based on fit with the product and the existence of a real developer question,
not on guessed search volume.

1. Best form backend services for developers (roundup, fair criteria, dated verification).
2. How freelancers manage leads from multiple client websites (workflow article).
3. How to build a contact form for a static website (already partly covered, check overlap).
4. What happens after someone submits a contact form (lifecycle explainer).
5. How to reduce lost leads from client websites (practical checklist).
6. A practical guide to managing client form submissions (agency operations).
7. Web3Forms alternatives, expanded with verified current facts.
8. Form backend pricing comparison, using public pricing captured on a stated date.

Every article needs a specific author, a publication date, an updated date only when the
content changed, code that runs against the real endpoint, internal links, and a CTA that
matches the reader's stage. Do not mass-produce AI articles, invent benchmarks, or rewrite
competitor pages.

## 7. Backlinks and digital PR

No backlink metrics were measured. The goal is relevant editorial links, not a purchased
number. Domain Rating 90+ is an ambition that depends on the wider link graph and cannot
be guaranteed or implemented in code.

Prospect categories to qualify manually:

| Category               | Examples to investigate                                                       | Outreach angle                                            |
| ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| Launch communities     | Product Hunt, Indie Hackers, Hacker News Show HN, BetaList, Peerlist, DevHunt | Launch story with a working demo and honest limitations   |
| Developer publications | Dev.to, Hashnode, freeCodeCamp, CSS-Tricks, Smashing Magazine                 | Original integration tutorial, not a product announcement |
| Directories            | AlternativeTo, SaaSHub, Startup Stash, Uneed, MicroLaunch                     | Accurate listing with real screenshots and pricing        |
| Newsletters            | Web Dev Weekly, Frontend Focus, JavaScript Weekly, agency newsletters         | A genuinely useful form workflow piece                    |
| Podcasts               | Indie hackers, bootstrapper and web agency shows                              | Founder story about client access and form operations     |
| Open source lists      | Curated awesome lists for forms, Next.js and SaaS                             | Only where the list accepts hosted tools                  |
| Agency resources       | Web agency blogs, freelancer communities                                      | Client hand-off checklist with no forced signup           |

Outreach rules: personalize every message, link to a page that answers the reader's
question, never buy links, never use PBNs or mass directory blasts, and never promise a
ranking. Track prospects and acquired links separately. No messages have been sent.

## 8. Analytics and Search Console

Implemented in code:

- GA4 loader with `send_page_view: false` and explicit page views on client navigation,
  so route changes are not counted twice: `src/lib/analytics/client.ts` and
  `src/components/analytics/analytics-provider.tsx`.
- Event catalogue: `page_view`, `sign_up`, `login`, `form_created`, `form_published`,
  `form_submission_received`, `client_invited`, `client_joined`, `feedback_submitted`,
  `pricing_viewed`, `checkout_started`, `subscription_activated`, `docs_viewed`,
  `prompt_copied`.
- Consent-aware sending, no submission content, passwords or emails in analytics payloads.
- PostHog support behind environment variables, disabled unless configured.
- Search Console and Bing verification meta tags read from environment variables.

Manual steps:

1. GA4: create a property, copy the `G-` measurement ID, set
   `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the deployment environment, redeploy, then confirm
   Realtime receives a page view.
2. Search Console: add a URL-prefix property for `https://formivo.faizyab.me/`. Choose the
   HTML tag method, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the token, redeploy,
   verify, then submit `https://formivo.faizyab.me/sitemap.xml`.
3. Bing Webmaster Tools: import the site from Search Console or verify with
   `NEXT_PUBLIC_BING_SITE_VERIFICATION`, then submit the same sitemap.
4. Inspect `/`, `/pricing`, `/features`, `/docs` and the newest article after verification.
5. Review queries, impressions, CTR and average position monthly. Do not report a
   connection that has not been verified in the account.

## 9. Core Web Vitals

Current design choices that help:

- No hero image and no large client-side animation library; product visuals are CSS and
  DOM.
- Fonts load through `next/font` with `display: swap`.
- Motion respects `prefers-reduced-motion`.
- The YouTube walkthrough uses a lazy-loaded iframe and only loads near the viewport.
- Analytics loads after hydration.

Still to measure on the deployed origin with real field data: LCP, INP and CLS. Lab
Lighthouse scores are not field data and are not claimed here.

## 10. International readiness

The site is written in international English with `lang="en"`, USD pricing and no
geographic restriction. There are no translated or regional variants, so adding
`hreflang` would create false signals. Add it only when a genuinely localised page exists.

## 11. Reporting checklist

Monthly:

- Indexed vs excluded pages in Search Console, with the reason for each exclusion.
- Sitemap status and last read date.
- Queries with impressions but weak CTR, mapped to the page that should answer them.
- Core Web Vitals field data by device.
- New and lost referring domains, reviewed for relevance and spam.
- Signup and pricing events from GA4, segmented by landing page.

Never report a ranking, traffic or Domain Rating figure that was not read from a real
account or measurement tool.
