Apple Pay Domain Verification for Stripe

Stripe handles Apple merchant validation for you automatically. You don't need to follow Apple's manual merchant validation process.

To enable Apple Pay on your domain:

1. Register your domain via Stripe Dashboard:
   - Go to Settings > Payment methods > Domains (or Payment Links > Apple Pay)
   - Click "Add new domain"
   - Enter your domain (e.g., example.com) and subdomain (e.g., www.example.com)
   - Stripe will provide you with a domain association file

2. OR register programmatically via the Stripe API:

   const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

   const paymentMethodDomain = await stripe.paymentMethodDomains.create({
     domain_name: 'example.com',
   });

   // Also register www subdomain:
   await stripe.paymentMethodDomains.create({
     domain_name: 'www.example.com',
   });

3. Download the association file from Stripe and place it here:
   /public/.well-known/apple-developer-merchantid-domain-association

   It will be accessible at:
   https://your-domain.com/.well-known/apple-developer-merchantid-domain-association

4. After uploading, click "Verify" in Stripe Dashboard.

Important Notes:
- Register both top-level domains and subdomains (example.com and www.example.com)
- In development, Apple Pay requires HTTPS and a verified domain
- Testing on localhost typically won't work for Apple Pay
- For Stripe Connect direct charges, configure domains for each connected account
- This file is account-specific; download it from your Stripe Dashboard

