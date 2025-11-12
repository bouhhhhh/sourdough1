# Email Configuration for HeirBloom

This guide explains how to set up email notifications for order confirmations.

## Overview

When a customer completes a payment:
1. They receive a confirmation email with their order details
2. You (the store owner) receive a notification email about the new order

## Setup Instructions

### 1. Get a Resend API Key

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Verify your domain or use their test domain for development
3. Generate an API key from your dashboard

### 2. Configure Environment Variables

Add these variables to your `.env` file (not `.env.example`):

```bash
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email "From" Address
# Must be from a verified domain in Resend
# Example: "HeirBloom Orders <orders@mail.yourdomain.com>"
EMAIL_FROM="HeirBloom <orders@mail.yourdomain.com>"

# Admin Email (receives order notifications)
# This is YOUR email address where you want to receive notifications
# Optional: If not set, defaults to EMAIL_FROM
ADMIN_EMAIL="your.email@gmail.com"
```

### 3. Domain Verification (Production)

For production use, you need to verify your domain in Resend:

1. Log into your Resend dashboard
2. Go to "Domains" section
3. Add your domain (e.g., `mail.maisonheirbloom.ca`)
4. Add the DNS records provided by Resend to your domain DNS settings
5. Wait for verification (usually a few minutes)

**Note:** For testing, you can use Resend's test domain without verification, but emails will only be sent to your verified email address.

### 4. Email Templates

The system sends two types of emails:

#### Customer Confirmation Email
- Subject: "Order Confirmation - ORD-xxxxx"
- Includes:
  - Order number and date
  - Items ordered with quantities and prices
  - Total amount paid
  - Shipping address
  - Next steps information
- Translated based on customer's language preference (EN/FR)

#### Admin Notification Email
- Subject: "🎉 New Order Received - ORD-xxxxx"
- Includes:
  - Order number and date
  - Customer's email address
  - Total amount
  - Items ordered
  - Shipping address
- Always sent in English

## Testing

To test email sending:

1. Make sure your `.env` file has the correct values
2. Complete a test purchase on your site
3. Check both the customer email and your admin email

## Troubleshooting

### Emails not being sent

1. **Check API Key**: Make sure `RESEND_API_KEY` is set correctly
2. **Check From Address**: The `EMAIL_FROM` must match a verified domain
3. **Check Logs**: Look for errors in the terminal/console
4. **Resend Dashboard**: Check the "Logs" section in Resend dashboard

### Admin notifications not working

1. Make sure `ADMIN_EMAIL` is set in your `.env` file
2. Check that the email address is valid
3. Check your spam folder

### Development Testing

For local development, Resend allows sending to your own verified email even without domain verification. This is perfect for testing!

## Cost

Resend's free tier includes:
- 100 emails per day
- 3,000 emails per month

This should be sufficient for small to medium-sized stores. For higher volumes, check [Resend pricing](https://resend.com/pricing).

## Localization

Customer emails are automatically translated based on the `locale` parameter:
- English (`en-US`)
- French (`fr-CA`)

Admin notification emails are always in English.

All translations are stored in the `/messages/*.json` files.
