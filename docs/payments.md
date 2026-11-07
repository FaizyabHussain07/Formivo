# Lemon Squeezy payments

Formivo bills through Lemon Squeezy. Production checkout is **off by default** and the
pricing page shows a "Coming soon" state until it is deliberately switched on.

## Where every credential comes from

| Variable                         | Where to find it                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `LEMONSQUEEZY_API_KEY`           | Settings → API → create a key. Use a test-mode key while the store is under review. |
| `LEMONSQUEEZY_STORE_ID`          | Settings → Stores; the numeric id in the URL.                                       |
| `LEMONSQUEEZY_PRO_VARIANT_ID`    | Product → your subscription product → variant id for the $19 plan.                  |
| `LEMONSQUEEZY_AGENCY_VARIANT_ID` | Same product, variant id for the $49 plan.                                          |
| `LEMONSQUEEZY_WEBHOOK_SECRET`    | Settings → Webhooks → create a webhook; the signing secret is shown once.           |

Add them to `.env.local` only. Never commit them, and never prefix them with `NEXT_PUBLIC_`.

## Webhook

Point the webhook at `https://<your-domain>/api/webhooks/lemonsqueezy` and subscribe to:

`order_created`, `subscription_created`, `subscription_updated`, `subscription_cancelled`,
`subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`,
`subscription_payment_success`, `subscription_payment_failed`.

Every delivery is verified with HMAC-SHA256 over the raw body, recorded in `webhook_events`
by provider event id, and applied idempotently — a replayed delivery is acknowledged and
ignored. The subscription row in the database is the only source of truth the UI reads; a
checkout redirect never grants a plan.

## How availability is decided

`src/lib/billing/availability.ts` is the single gate used by the pricing page, the billing
page and the checkout server action:

- Provider not configured → checkout disabled, buttons read "Coming soon".
- `NEXT_PUBLIC_ENVIRONMENT=production` and `BILLING_CHECKOUT_ENABLED` is not `true` → checkout
  disabled, "Coming soon".
- Otherwise → checkout enabled.

Because the server action re-checks the same function, a crafted request cannot open a
checkout that the UI is hiding.

## Local testing checklist

1. Set the five Lemon Squeezy variables in `.env.local` with test-mode values.
2. Run `npm run dev` and sign in as a developer.
3. Open `/billing`, choose Pro. The button must be enabled and redirect to Lemon Squeezy.
4. Complete a test purchase (Lemon Squeezy test mode accepts `4242 4242 4242 4242`).
5. Watch the webhook arrive: the subscription row gains `plan_key=pro` and `status=active`,
   and `/billing` shows the new plan and limits.
6. Trigger `subscription_payment_failed` from the Lemon Squeezy dashboard and confirm the
   status changes without losing access mid-period.
7. Re-send the same webhook and confirm it is recorded once and changes nothing.
8. Confirm that with `NEXT_PUBLIC_ENVIRONMENT=production` and no
   `BILLING_CHECKOUT_ENABLED`, both the buttons and the server action refuse checkout.

## Activating production after approval

1. Switch the Lemon Squeezy API key to a live-mode key.
2. Create a live webhook with the production URL and copy its signing secret.
3. Update the store id and live variant ids.
4. Set `NEXT_PUBLIC_ENVIRONMENT=production` and `BILLING_CHECKOUT_ENABLED=true`.
5. Deploy, then run one real checkout and confirm the subscription row and the plan badge.
6. Remove `BILLING_CHECKOUT_ENABLED` (or set it to `false`) to take payments offline again.
   Existing subscriptions keep their entitlements until the period ends.
