# Ridgeline Roofing — Whop integration work in progress

Original responsive React/Vite roofing template. This is NOT yet a completed Whop submission or a production-ready payment workflow.

## Run
Node 24: `npm ci --cache /tmp/npm-cache`, then `npm run dev`.
`npm run build` generates the static build. `node smoke.mjs` tests the UI using system Chromium while the dev server runs.

Edit company.js for branding, areas, descriptions, and displayed prices. Actual payment prices must match the merchant's Whop plans; the browser never sets the charged amount. Copy .env.example to .env.local and use only PUBLIC identifiers in VITE variables. Never place an API key there.

## Implemented
Responsive service, financing, service area, trust, and estimate sections; $149 inspection, $500 deposit, $249 gutter service catalog; configurable Whop CheckoutElement and ExpressCheckoutElement with BrandingElement; three whop.track call sites; explicit error states instead of simulated payment or lead success.

Current Elements version permits only one checkout entry element per Checkout provider. The UI switches between full and express checkout, remounting its provider. BrandingElement has its own Payments provider. These compositions build, but need real merchant/browser verification. Configure the merchant payment methods to exclude PayPal; express checkout explicitly disables it. Financing eligibility must be checked in the merchant account.

## Outstanding acceptance requirements
- Whop docs/CLI network access is blocked (403); domain additions saved in environment draft need review, save, and publication.
- CLI `whop auth status` reports loggedIn:false. Authenticate securely; never send credentials in chat.
- No account ID, real plans, site registration, or live deployment exists.
- Installed CLI 0.34.1 documents whop.site rather than the required whop.app. Resolve with the task owner/Whop before submitting. Do not silently substitute domains.
- A server-side `/api/estimate` handler now calls Whop Leads and returns a Lead ID only after a confirmed response. It has input validation, origin checking and a honeypot; add platform rate limiting before exposing it publicly. A real account Lead has not been tested. No personal data enters analytics.
- No setup-intent or final-invoice workflow exists yet. Add explicit card storage consent; persist customer/job/setup intent/payment identifiers server-side. Verify signatures and deduplicate payment webhooks; never mark a deposit paid based on browser callbacks. Calculate final balance from the approved total minus the verified deposit, with idempotent invoice creation. Require staff authentication and authorization before creating or charging invoices. Auto-charge only the explicitly authorized customer's stored method, or send a manual-payment invoice.
- Whop tracking SDK bootstrap must be verified against Websites documentation. Current call sites fire only when window.whop.track exists; unavailable messages are NOT proof of pixel delivery.
- Real company contact, license, insurance, warranty, privacy and refund policies, and genuine reviews must replace the clearly labeled demo content.

## Whop hosting continuation
Use the existing checkout; do not create a worktree. Inspect `npx whop apps create --help` and authenticate. For existing code, the CLI docs say register the website and pass --app to deployment; do not hand-write whop.app.json. Resolve the required domain before registration. The Whop Vite build plugin now packs both client and server into `dist/whop-build.zip`. Hosted server integration and an actual deployment still need validation.

See RECORDING.md for the required evidence and submission sequence.
