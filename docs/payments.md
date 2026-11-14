# Paddle payments

Formivo bills through Paddle Billing. Production checkout is **off by default** and the pricing
page shows a "not open yet" state until it is deliberately switched on.

Plans and prices live in `src/lib/billing/plans.ts`. That file is the only place a limit or a
price is defined; the pricing page, the billing page, JSON-LD and the server-side entitlement
checks all read it.

## Environment

| Variable                        | Public?   | Where it comes from                                                    |
| ------------------------------- | --------- | ---------------------------------------------------------------------- |
| `PADDLE_ENVIRONMENT`            | server    | `sandbox` or `production`. Selects the API host.                       |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | browser | Developer tools → Authentication → client-side token.                 |
| `PADDLE_API_KEY`                | **secret** | Developer tools → Authentication → API key. Never prefix `NEXT_PUBLIC_`. |
| `PADDLE_WEBHOOK_SECRET`         | **secret** | Notifications → destination → secret key.                              |
| `PADDLE_PRICE_LIGHT`            | server    | Product catalogue → Light monthly price (`pri_...`).                   |
| `PADDLE_PRICE_PRO`              | server    | Product catalogue → Pro monthly price (`pri_...`).                     |
| `PADDLE_PRICE_AGENCY`           | server    | Product catalogue → Agency monthly price (`pri_...`).                  |

Free never has a price id and never opens a checkout.

Sandbox and live credentials must never be mixed. The API base URL is derived from
`PADDLE_ENVIRONMENT`, so a sandbox key cannot create a live charge.

## Checkout flow

1. The billing page posts a plan to `startCheckoutAction`.
2. The server re-checks availability, then creates a Paddle **transaction** with the price id,
   the workspace id and the plan in `custom_data`.
3. The browser opens Paddle.js in overlay mode with the returned transaction id.
4. If the overlay script is blocked, the hosted `checkout.url` is used as a fallback.
5. The redirect back to `/billing?checkout=success` only refreshes the page. **No plan is granted
   from the browser.**

An existing subscriber does not create a second subscription: the action calls
`PATCH /subscriptions/{id}` with the new price and `proration_billing_mode: prorated_immediately`.

## Webhook

Point the destination at `https://<your-domain>/api/webhooks/paddle` and subscribe to:

`transaction.completed`, `transaction.paid`, `transaction.payment_failed`,
`subscription.created`, `subscription.activated`, `subscription.updated`, `subscription.trialing`,
`subscription.past_due`, `subscription.paused`, `subscription.resumed`, `subscription.canceled`,
`adjustment.created`, `adjustment.updated`.

Verification is HMAC-SHA256 over `${ts}:${rawBody}` using `Paddle-Signature: ts=...;h1=...`, with a
five-minute tolerance so a captured request cannot be replayed. Every delivery is recorded in
`webhook_events` under `(provider, provider_event_id)`; a duplicate is acknowledged and ignored.
Adjustments are audit-only and never change a plan.

The subscription row is the only state the UI reads. `src/lib/billing/entitlements.ts` maps it to
limits, and a cancelled subscription keeps access until the paid period ends.

## Availability

`src/lib/billing/availability.ts` is the single gate used by the pricing page, the billing page
and the server action:

- Paddle not configured → checkout disabled, buttons read "Coming soon".
- `NEXT_PUBLIC_ENVIRONMENT=production` and `BILLING_CHECKOUT_ENABLED` is not `true` → disabled.
- Otherwise → enabled.

## Sandbox checklist

1. Set the six Paddle variables with sandbox values and `PADDLE_ENVIRONMENT=sandbox`.
2. `npm run dev`, sign in as a verified developer.
3. `/billing` → choose Light, Pro and Agency in turn; each must open the Paddle overlay.
4. Pay with the sandbox test card. Confirm the overlay closes and the page refreshes.
5. Watch the webhook: the subscription row gains the plan, `provider=paddle`, the price id and the
   billing period, and `/billing` shows the new limits.
6. Repeat with a failing test payment and confirm `past_due` is stored without a plan change.
7. Re-send the same event id and confirm it is recorded once and changes nothing.
8. Open the customer portal from `/billing` and confirm it is the Paddle portal for that customer.
9. Change plan on an existing subscription and confirm proration plus the updated webhook.
10. Cancel in the portal: access continues to the period end, then the Free limits apply.

## Switching to live

1. Set `PADDLE_ENVIRONMENT=production`.
2. Create live prices and put their ids in `PADDLE_PRICE_*`.
3. Replace the API key and client token with live values.
4. Create a live webhook destination with the production URL and its secret.
5. Set `BILLING_CHECKOUT_ENABLED=true` only after the sandbox checklist passes.
6. Deploy, run one real checkout, and confirm the subscription row and plan badge.
7. Remove `BILLING_CHECKOUT_ENABLED` (or set `false`) to take payments offline again. Existing
   subscriptions keep their entitlements until the period ends.
