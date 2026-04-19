# Stripe Setup Instructions for Attentiq

## Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Sign up for a new account (or use existing)
3. Go to Dashboard: https://dashboard.stripe.com

## Step 2: Get API Keys
1. In Stripe Dashboard, go to Developers → API Keys
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Keep these safe - never commit them to git

## Step 3: Create 3 Products

### Product 1: Rapport Complet (One-time payment)
1. Go to Products → Create Product
2. Name: "Rapport Complet"
3. Description: "Un rapport approfondi pour une vidéo"
4. Pricing Model: **Standard pricing**
5. Price: 19 EUR
6. Billing period: **One-time** (not recurring)
7. Click Create Product
8. Copy the **Price ID** (starts with `price_`)
9. Save as `NEXT_PUBLIC_STRIPE_PRICE_ID_19`

### Product 2: 5 Rapports/mois (Recurring subscription)
1. Go to Products → Create Product
2. Name: "5 Rapports/mois"
3. Description: "Analysez 5 vidéos par mois"
4. Pricing Model: **Standard pricing**
5. Price: 49 EUR
6. Billing period: **Monthly** (recurring)
7. Click Create Product
8. Copy the **Price ID**
9. Save as `NEXT_PUBLIC_STRIPE_PRICE_ID_49`

### Product 3: Illimité/mois (Recurring subscription)
1. Go to Products → Create Product
2. Name: "Illimité/mois"
3. Description: "Analyses illimitées par mois"
4. Pricing Model: **Standard pricing**
5. Price: 99 EUR
6. Billing period: **Monthly** (recurring)
7. Click Create Product
8. Copy the **Price ID**
9. Save as `NEXT_PUBLIC_STRIPE_PRICE_ID_99`

## Step 4: Configure on Railway

1. Go to your Railway project: https://railway.app/project/8d3cc4a0-8229-4f06-aad1-7dfdf86c4abf
2. Select the `attentiq-frontend` service
3. Go to Variables tab
4. Add these 5 variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your publishable key
   - `STRIPE_SECRET_KEY` = your secret key
   - `NEXT_PUBLIC_STRIPE_PRICE_ID_19` = price ID from Product 1
   - `NEXT_PUBLIC_STRIPE_PRICE_ID_49` = price ID from Product 2
   - `NEXT_PUBLIC_STRIPE_PRICE_ID_99` = price ID from Product 3
5. Click Deploy to apply changes

## Step 5: Test Payment Flows

### Test Mode (Recommended)
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

### Test Each Flow
1. Go to https://attentiq-frontend.railway.app/checkout/rapport-complet
2. Click "Payer 19€ — Rapport complet"
3. Use test card 4242 4242 4242 4242
4. Verify redirect to /merci
5. Repeat for /checkout/5-rapports and /checkout/illimite

## Step 6: Go Live (When Ready)
1. In Stripe Dashboard, activate your account for live payments
2. Get live API keys (start with `pk_live_` and `sk_live_`)
3. Update Railway variables with live keys
4. Test again with real payment method
5. Deploy to production

## Troubleshooting

### "Stripe not available" error
- Check that NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set on Railway
- Redeploy the service after adding variables

### "Failed to create checkout session" error
- Check that STRIPE_SECRET_KEY is set on Railway
- Check that price IDs are correct
- Check Stripe Dashboard for any errors

### Payment not redirecting to /merci
- Check browser console for errors
- Verify success_url is correct in /api/checkout
- Check Stripe Dashboard for session details

## Support
- Stripe Docs: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Contact Stripe Support: https://support.stripe.com
