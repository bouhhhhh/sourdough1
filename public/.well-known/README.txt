Apple Pay Domain Verification

To enable Apple Pay on the Web via Stripe on this domain, you must verify the domain in your Stripe Dashboard.

Steps:
1) In Stripe Dashboard, go to Settings > Payment methods > Apple Pay (or Payment Links > Apple Pay).
2) Click "Add new domain" and download the domain association file from Stripe.
3) Place the downloaded file named `apple-developer-merchantid-domain-association` in this directory:
   /public/.well-known/apple-developer-merchantid-domain-association
   So it will be publicly accessible at:
   https://<your-domain>/.well-known/apple-developer-merchantid-domain-association
4) After uploading, click "Verify" in Stripe.

Notes:
- This repository only includes a placeholder README. The association file is specific to your Stripe account and domain and must be downloaded from Stripe.
- In development, Apple Pay requires HTTPS and a verified domain. Testing Apple Pay may not work on localhost.
