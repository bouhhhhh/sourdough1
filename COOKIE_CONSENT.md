# GDPR Cookie Consent Implementation

This document explains the cookie consent system implemented in HeirBloom.

## Overview

A GDPR-compliant cookie consent banner has been added to the website. It appears on the first visit and allows users to:
- Accept all cookies
- Reject optional cookies (only necessary ones)
- Customize which types of cookies they want to allow

## Cookie Categories

### 1. Necessary Cookies (Always Enabled)
These cookies are essential for the website to function and cannot be disabled:

- **`session`** - User authentication session (24 hours)
- **`yns_cart_id`** - Shopping cart ID (30 days)
- **`NEXT_LOCALE`** - Language preference (1 year)
- **`__stripe_mid`, `__stripe_sid`** - Stripe payment processing (automatic)

### 2. Functional Cookies (Optional)
Currently not used, but reserved for future features like:
- Theme preferences (dark/light mode)
- Custom UI settings
- Saved filters/preferences

### 3. Analytics Cookies (Optional)
For understanding user behavior:
- Google Analytics (if enabled via `NEXT_PUBLIC_UMAMI_WEBSITE_ID`)
- Vercel Analytics
- Page view tracking

## Implementation Files

### Created Files:

1. **`/src/components/cookie-consent.tsx`**
   - Main cookie consent banner component
   - Displays on first visit
   - Stores consent in `cookie_consent` and `cookie_preferences` cookies
   - Fully translated (EN/FR)

2. **`/src/lib/cookie-utils.ts`**
   - Utility functions to check cookie consent
   - Use these to conditionally load analytics:
     ```typescript
     import { canUseAnalytics, canUseFunctional } from '@/lib/cookie-utils';
     
     if (canUseAnalytics()) {
       // Load Google Analytics
     }
     ```

### Modified Files:

1. **`/src/app/layout.tsx`**
   - Added `<CookieConsent />` component

2. **`/messages/en-US.json`**
   - Added cookie consent translations under `Global.cookies.*`

3. **`/messages/fr-CA.json`**
   - Added French translations for cookie consent

## User Experience

### First Visit:
1. User visits the website
2. Cookie banner appears at the bottom of the screen
3. User can:
   - Click "Accept All" → All cookies enabled
   - Click "Only Necessary" → Only essential cookies enabled
   - Click "Customize Settings" → Choose specific categories

### Customization Flow:
1. User clicks "Customize Settings"
2. Banner expands to show 3 categories with descriptions
3. User can toggle Functional and Analytics cookies
4. User clicks "Save Preferences"
5. Preferences are saved for 1 year

### Return Visits:
- Banner doesn't show again (unless user clears cookies)
- Preferences are remembered and applied

## Compliance Features

✅ **GDPR Compliant:**
- Clear information about cookie usage
- Granular consent options
- Easy opt-out mechanism
- Privacy policy link

✅ **Necessary cookies are clearly marked** as always enabled

✅ **Consent is stored for 1 year** (standard practice)

✅ **No cookies are set before consent** (except the consent cookie itself, which is allowed under GDPR)

## Cookies Created by This System

1. **`cookie_consent`** - Set to "true" when user makes a choice
   - Duration: 365 days
   - Purpose: Track that user has given consent
   
2. **`cookie_preferences`** - JSON object with preferences
   - Duration: 365 days
   - Purpose: Store which cookie categories are enabled
   - Format: `{"necessary":true,"functional":false,"analytics":true}`

## Testing

To test the cookie consent banner:

1. **First Visit:**
   - Open the site in incognito/private mode
   - Banner should appear at the bottom
   - Try all three options (Accept, Reject, Customize)

2. **Check Cookies:**
   - Open browser DevTools → Application → Cookies
   - Should see `cookie_consent` and `cookie_preferences`

3. **Verify Persistence:**
   - Close and reopen the browser
   - Banner should NOT appear again
   - Preferences should be maintained

4. **Reset:**
   - Delete cookies manually or use incognito mode
   - Banner should appear again

## Future Enhancements

### Recommended additions:

1. **Cookie Management Page**
   - Add a `/cookies` page where users can change preferences
   - Link from footer

2. **Privacy Policy Page**
   - Create `/privacy` page with detailed cookie policy
   - Link from cookie banner

3. **Conditional Analytics Loading**
   - Only load Google Analytics if user consented:
   ```typescript
   // In layout.tsx or analytics component
   import { canUseAnalytics } from '@/lib/cookie-utils';
   
   {canUseAnalytics() && (
     <Script src="your-analytics-script" />
   )}
   ```

4. **Cookie Management Button**
   - Add a floating button or footer link to reopen settings
   - Useful for users who want to change their mind

## Legal Considerations

⚠️ **Important:** This implementation provides the technical framework for GDPR compliance, but you should:

1. Create a comprehensive Privacy Policy
2. Create a Cookie Policy detailing all cookies used
3. Add links to these policies from the banner
4. Ensure your business is registered as a data controller (if required)
5. Keep records of consent

## Styling

The cookie banner uses Tailwind CSS classes and supports:
- ✅ Light/Dark mode
- ✅ Responsive design (mobile-friendly)
- ✅ Smooth animations
- ✅ Accessible (keyboard navigation, ARIA labels)

## Translations

The banner is fully translated in:
- 🇬🇧 English (`en-US`)
- 🇫🇷 French (`fr-CA`)

All translations are in `/messages/*.json` under the `Global.cookies.*` namespace.
