# Ridgeline Roofing — Whop integration work in progress

Original responsive React/Vite roofing template. This is not yet a completed Whop submission or a production-ready payment workflow. Ridgeline is a fictional business name.

## Run
Node 24: `npm ci --cache /tmp/npm-cache`, then `npm run dev`.
`npm run build` generates the static build. `node smoke.mjs` tests the UI using system Chromium while the dev server runs.

Edit company.js for branding, areas, descriptions, and displayed prices. Public merchant and plan IDs are in merchant.js and can be overridden with `VITE_` variables. The three hidden Whop plans on Momentum Daily match the displayed $149, $500, and $249 prices; the browser never sets the charged amount. Never place an API key in a `VITE_` variable.

The server estimate handler uses the account ID and Whop's hosted outbound API authentication. Outside Whop hosting it can use a server-only `WHOP_API_KEY` binding. The legacy Leads endpoint requires a `company_id` and a Whop `user_id`. The form now uses Whop OAuth sign-in; the server verifies the visitor token through `/users/me` before creating a Lead. Sandbox API creation with a synthetic Whop user succeeded, and OAuth redirects to the sandbox login page. A signed-in browser submission still needs verification. Keep keys out of `VITE_` variables and browser bundles.

## Implemented
Responsive service, financing, service area, trust, and estimate sections; $149 inspection, $500 deposit, $249 gutter service catalog; configurable Whop CheckoutElement and ExpressCheckoutElement with BrandingElement; three whop.track call sites; explicit error states instead of simulated payment or lead success.

Current Elements version permits only one checkout entry element per Checkout provider. The UI switches between full and express checkout, remounting its provider. BrandingElement has its own Payments provider. These compositions build, but need real merchant/browser verification. Configure the merchant payment methods to exclude PayPal; express checkout explicitly disables it. Financing eligibility must be checked in the merchant account.

## Outstanding acceptance requirements
- Whop API and docs are reachable. The current `WHOP_API_KEY` environment binding is ready and authenticates to the legacy Leads API. It is rejected by `/api/v5/me`, so do not assume v5 access.
- CLI login succeeds with the bound key when `NODE_USE_ENV_PROXY=1` is set. The task owner confirmed `Momentum Daily` (`biz_NjnUTht6pZas2V`) as the merchant.
- The account has three hidden, one-time Ridgeline demo plans. The site still needs real business contact, licensing, and policies before a production sales launch.
- Whop rejected a `whop.app` subdomain as reserved. The task owner accepted the documented `whop.site` alternative. The site is live at `https://ridgeline-roofing-momentum-2026.whop.site`, linked to app `app_yxpWkkwho77qrL`.
- A server-side `/api/estimate` handler attempts Whop Leads with bearer authorization and returns a Lead ID only after a confirmed response. The form requests Whop OAuth sign-in and the handler verifies the user token before supplying the required `user_id`. A synthetic sandbox Lead was created through the API. Browser OAuth completion and a form-created Lead have not yet been verified. Add platform rate limiting before exposing it publicly. No personal data enters analytics.
- The deposit checkout now offers a separate setup-mode Whop checkout after explicit card-storage consent. It shows the payment and setup references. `final-invoice.mjs` is a staff-side tool that verifies a paid deposit and successful setup for the same user, credits $500, and can create or send an idempotent final-balance invoice. These flows have not completed a sandbox payment yet and still need durable job state, verified webhook handling, and merchant review before production use.
- Whop tracking SDK bootstrap must be verified against Websites documentation. Current call sites fire only when window.whop.track exists; unavailable messages are NOT proof of pixel delivery.
- In this managed environment, the checkout script at `cdn.whop.com` is blocked by network policy. The UI now shows a checkout error instead of crashing. A browser checkout and payment still need verification in an environment that can load the script.
- Real company contact, license, insurance, warranty, privacy and refund policies, and genuine reviews must replace the clearly labeled demo content.

## Whop hosting continuation
The project is linked to the Whop Website app. Whop and Cloudflare Vite plugins pack the client and server into `dist/whop-build.zip`; build, CLI typecheck, upload, and production promotion passed. The live page and checkout frame load. A request to the live estimate endpoint without Whop sign-in correctly returns 401.

Whop's CLI acts on production. The separate sandbox binding is ready for the Momentum Lab test business (`biz_QuP6gQdX9pBwCo`). `npm run dev -- --mode sandbox --port 5175` selects its three hidden test plans; in another shell, `npm run smoke:sandbox` checks the $500 Elements checkout, Whop branding, and sandbox API calls without submitting payment. The current managed browser still blocks card and risk-service hosts, so a complete no-money payment remains unverified. Those hosts have been saved to a new environment draft for review and publication. Never commit or send either API key in chat.

See RECORDING.md for the required evidence and submission sequence.
