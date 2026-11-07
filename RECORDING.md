# Recording and submission checklist

The site is live at https://ridgeline-roofing-momentum-2026.whop.site. Do not claim the full task is complete until a sandbox payment, setup intent, final invoice, and delivered pixel events are recorded. Whop rejected `whop.app` as reserved; the task owner accepted `whop.site`.

Use OBS or Loom, record at 1920×1080, and hide API keys, tokens, real customer details, and account balances. Use only the currently documented Whop sandbox/test method; do not invent test card numbers or charge a real card.

## Suggested 4-minute recording
1. 0:00–0:40: Show the LIVE whop.site address, hero, service prices, financing disclosure, and mobile layout.
2. 0:40–1:40: Open the $500 deposit, show CheckoutElement/PaymentElement, express wallet option on a supported verified device/domain, and BrandingElement. Complete a real sandbox checkout. Show the verified test payment in Whop. Demonstrate explicit card storage consent and successful setup intent linked to the same customer/job.
3. 1:40–2:20: Sign in with a separate customer Whop account and submit the estimate form with synthetic information. Then sign in as the Momentum Daily owner, open `/#leads`, click “Load Whop Leads,” and show the created Lead with matching details and ID. The Whop dashboard has no Leads tab. A local success toast alone is insufficient.
4. 2:20–3:15: Show a completed demo job, its approved total and $500 deposit credit. Create the remaining-balance invoice. Show its actual Whop invoice ID and manual-payment link or authorized sandbox auto-charge result. Avoid emailing real customers.
5. 3:15–4:00: Show Whop event/network evidence for service_viewed, deposit_started, and estimate_requested. Show timestamps and account association. Console call-site logs alone are not delivery evidence. Briefly show company.js to demonstrate reusability.

Submit: live whop.site URL accepted by the task owner; GitHub repository or source ZIP excluding secrets/node_modules; accessible 3–5 minute recording; one paragraph accurately listing verified features.

## Feature paragraph (use ONLY after every claim is verified)
This reusable roofing website runs on Whop Websites and offers a $149 inspection, $500 project deposit, and $249 flat-rate service through Whop Payment Elements, express wallets, and required Whop branding. Estimate requests create Whop Leads. The deposit flow collects explicit consent and saves a payment method through a setup intent; the remaining project balance is collected through Whop Invoices with authorized auto-charge or manual payment. Whop tracking captures estimate_requested, service_viewed, and deposit_started, alongside automatic page-view and checkout events. Available financing methods are shown by Whop according to merchant and customer eligibility.
