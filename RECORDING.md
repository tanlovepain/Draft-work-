# Submission recording: record only after each check succeeds

Live website: https://ridgeline-roofing-momentum-2026.whop.site. The original brief said `whop.app`; the Whop CLI rejected that as reserved. Confirm the reviewer accepts `whop.site` before resubmitting. The website source is at https://github.com/tanlovepain/Draft-work-.

A failed checkout plus a new Customer record does **not** prove a paid order. Whop may create a customer when checkout starts. Show a payment whose status is `paid`/`succeeded` and a receipt or payment ID. A Lead is a separate `lead_...` record; show it in the Whop Leads API or the site's owner-only viewer. Do not count the owner-associated legacy Lead. A console message about `whop.track` proves only that the browser called it, so show delivered requests or Whop reporting.

## Before recording

1. Deploy the latest GitHub commit to the live Whop Website. Reload the live URL and confirm the updated deposit flow displays **“Verifying deposit payment…”** after checkout completion. The GitHub push alone does not update the live site.
2. Use a separate test buyer identity and the **sandbox** checkout for payment. Confirm the merchant, test plan, allowed payment method, sandbox account, and card data against Whop's current sandbox guide. The CLI runs against production; do not use it for a test charge. Try the whole sequence once before recording.
3. Confirm the estimate request produces a **new** Lead ID for that buyer. Sign in as the owner only to view Leads.
4. Have an approved demo project total, verified deposit payment ID, and successful setup intent ID for the same buyer. Use `final-invoice.mjs` first without a write flag to show its calculation. Create/send only the authorized sandbox final invoice, and verify its returned invoice ID and status in Whop.
5. Confirm the three custom events reached Whop reporting or that their network requests completed successfully. Hide tokens, keys, emails, and real customer data before recording. If any required proof fails, fix it first; another video of the failure will not satisfy the brief.

## 3–5 minute screen recording script

**0:00–0:35 — Site.** Start with the live Whop URL visible in the address bar. Show the hero, three prices ($149 inspection, $500 deposit, $249 flat-rate service), service area, financing callout, and mobile layout briefly. Say this is the reusable demo template.

**0:35–1:40 — Successful payment.** Open the $500 deposit on the sandbox site. Show Whop CheckoutElement, Whop branding, and the express wallet option where the browser supports it. Complete the sandbox card checkout using Whop's documented test card. Show the payment ID and **paid/succeeded** status in Whop Payments. Do not show only the Customers list. Return to the deposit flow, opt in to card storage, finish the setup checkout, and show the `sint_...` ID and its succeeded status. If card setup fails, stop the recording attempt and troubleshoot.

**1:40–2:25 — Lead.** Sign in as a separate customer Whop user. Submit the estimate form with synthetic details. Capture its success state. Sign in as the merchant owner, open `/#leads`, click **Load Whop Leads**, and show the matching new `lead_...` ID, timestamp, and request details. Show the Whop API response if the reviewer needs independent proof.

**2:25–3:20 — Final invoice.** Show the approved demo total (for example $2,500), the verified $500 deposit credit, and the $2,000 final balance. Run the staff tool for the same buyer/payment/setup IDs, create the sandbox invoice, and show the actual `inv_...` ID and status in Whop. If using manual payment, show the hosted invoice payment link. If using auto-charge, show the successful charge and stored-method authorization. Never claim an unsent draft is a paid invoice.

**3:20–4:15 — Events and source.** Trigger service_viewed by opening a service, deposit_started by opening the deposit, and estimate_requested by a successful estimate submission. Show the three delivered pixel requests or Whop event records with timestamps. Briefly show `company.js` for reusable branding and pricing. End with the GitHub source URL.

Submit the live Whop URL, GitHub repo, 3–5 minute accessible recording, and one paragraph listing only features that you verified. Use OBS or Loom with readable browser zoom. Mask personal and secret data.
