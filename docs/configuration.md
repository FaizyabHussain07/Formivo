# Formivo configuration

Every variable below is optional for local development: the app boots and renders without
any of them. A provider that is unset reports "not configured" instead of failing silently.
Never commit real values; `.env.local` is ignored by git and `.env.example` is the template.

## Required for a usable deployment

| Variable                        | Purpose                                                                  | Where to get it                    |
| ------------------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | Public origin used in endpoints, emails and redirects.                   | Your deployment URL.               |
| `NEXT_PUBLIC_ENVIRONMENT`       | `development`, `preview` or `production`. Controls payment availability. | You choose.                        |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL.                                                    | Supabase → Project Settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key; safe in the browser.                                         | Same page ("anon public").         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only. Bypasses RLS, so it must never reach the client.            | Same page ("service_role").        |

In Supabase Auth → URL Configuration, allow-list:

- `<app>/auth/callback`
- `http://localhost:3000/auth/callback` for local work

## Transactional email (Resend)

| Variable            | Purpose                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`    | Sends client invitations and notifications.                                               |
| `RESEND_FROM_EMAIL` | Sender address, default `team@formivo.faizyab.me`. The domain must be verified in Resend. |

Without them the dashboard shows the invitation link so it can be passed on manually.

## Analytics (GA4 + PostHog)

Analytics is browser-side and entirely optional. With no ids set, nothing is downloaded and
no event is sent.

1. **GA4** — create a property at analytics.google.com, add a Web data stream for your domain,
   copy the Measurement ID (`G-XXXXXXX`) into `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
2. **PostHog** — create a project at posthog.com, copy the Project API key into
   `NEXT_PUBLIC_POSTHOG_KEY` and set `NEXT_PUBLIC_POSTHOG_HOST` to the ingestion host
   (`https://us.i.posthog.com` or `https://eu.i.posthog.com`).
3. **Session replay** is off by default because it records screens. Set
   `NEXT_PUBLIC_POSTHOG_REPLAY=1` to enable it; inputs are masked by default.

What is sent: page views, and the events in `src/lib/analytics/events.ts`
(`sign_up`, `login`, `form_created`, `pricing_viewed`, `checkout_started`, `prompt_copied`,
`docs_viewed`, …). Authenticated users are identified by internal user id only, never by
email. Submission content, passwords and tokens are never sent.

Traffic attribution (`src/lib/analytics/attribution.ts`) stores first-touch and last-touch
in `localStorage`, classifies the referrer (search, social, AI assistant, referral), and
attaches `traffic_source`, `traffic_medium`, `traffic_campaign` and `landing_page` to events
and to PostHog person properties. At sign-up the first touch is copied into the account's
user metadata so a registration can be attributed without a join.

A visitor who declines consent (`setConsent(false)`) stops every outbound call immediately;
the choice is stored in `localStorage` under `formivo:analytics-consent`.

## Search engine ownership

`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION` emit the
verification meta tags. The `googled*.html` file at the repository root is a Google
ownership file and must stay byte-identical (it is excluded from Prettier).

## Server-only secrets

| Variable                  | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| `CRON_SECRET`             | Shared secret for scheduled jobs. Minimum 32 characters.  |
| `INVITATION_TOKEN_PEPPER` | Peppers hashed invitation tokens. Required in production. |

Generate with `openssl rand -hex 32`.
