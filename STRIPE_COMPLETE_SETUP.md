# ✅ Stripe Complete Setup — Attentiq Payment Validation
### Total time: ~15 minutes · 4 tests · Zero ambiguity

> **Before you start:** The code is fully deployed on Railway. You only need to create a Stripe account, configure 3 products, add 5 environment variables, and run 4 tests. Every step below is exact and copy-paste ready.

---

## PART 1 — Quick Start: Create Stripe Account (5 minutes)

### Step 1.1 — Create your Stripe account

1. Open: **https://dashboard.stripe.com/register**
2. Fill in: email, full name, country (**France**), password
3. Click **Create account**
4. Check your email → click the verification link Stripe sends
5. You are now in the Stripe Dashboard

> ⚠️ **Stay in Test Mode.** You will see a toggle in the top-left of the dashboard that says **"Test mode"** — make sure it is **ON** (the toggle should be blue/active). Do NOT switch to Live mode for this validation.

---

### Step 1.2 — Get your API Keys

1. In the Stripe Dashboard left sidebar, click **Developers**
2. Click **API keys**
3. You will see two keys:

| Key | Starts with | Action |
|-----|-------------|--------|
| Publishable key | `pk_test_` | Click **Reveal** → Copy the full value |
| Secret key | `sk_test_` | Click **Reveal test key** → Copy the full value |

4. **Save both keys** in a text file — you will need them in Part 3.

> 🔑 Example format (yours will be different):
> ```
> pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
> sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
> ```

---

## PART 2 — Create 3 Products + Prices (5 minutes)

> You will create 3 products. Each takes about 90 seconds. Follow the steps exactly — the product names and prices must match what the code expects.

---

### Product 1 — Rapport Complet (19€ one-time)

1. In the Stripe Dashboard sidebar, click **Product catalogue** (or **Products**)
2. Click the **+ Add product** button (top right)
3. Fill in the form:

   - **Name:**
     ```
     Rapport Complet
     ```
   - **Description:**
     ```
     Un rapport approfondi pour une vidéo
     ```
   - Leave **Image** empty

4. In the **Pricing** section:
   - **Pricing model:** Standard pricing
   - **Price:** `19`
   - **Currency:** `EUR`
   - **Billing period:** Click **One time** (not Monthly, not Annual)

5. Click **Save product**

6. You are now on the product detail page. Look for the **Price** section — you will see a row with `€19.00` and a **Price ID** that looks like:
   ```
   price_1AbCdEfGhIjKlMnOpQrStUv
   ```
7. **Copy this Price ID** and save it as `PRICE_ID_19` in your text file.

---

### Product 2 — 5 Rapports (49€/month recurring)

1. Click **Product catalogue** → **+ Add product**
2. Fill in the form:

   - **Name:**
     ```
     5 Rapports/mois
     ```
   - **Description:**
     ```
     Analysez 5 vidéos par mois
     ```

3. In the **Pricing** section:
   - **Pricing model:** Standard pricing
   - **Price:** `49`
   - **Currency:** `EUR`
   - **Billing period:** Click **Monthly** (recurring)

4. Click **Save product**

5. Copy the **Price ID** from the product detail page and save it as `PRICE_ID_49` in your text file.

---

### Product 3 — Illimité (99€/month recurring)

1. Click **Product catalogue** → **+ Add product**
2. Fill in the form:

   - **Name:**
     ```
     Illimité/mois
     ```
   - **Description:**
     ```
     Analyses illimitées par mois
     ```

3. In the **Pricing** section:
   - **Pricing model:** Standard pricing
   - **Price:** `99`
   - **Currency:** `EUR`
   - **Billing period:** Click **Monthly** (recurring)

4. Click **Save product**

5. Copy the **Price ID** from the product detail page and save it as `PRICE_ID_99` in your text file.

---

### ✅ Checkpoint — You should now have 5 values saved:

```
PUBLISHABLE_KEY  = pk_test_51...
SECRET_KEY       = sk_test_51...
PRICE_ID_19      = price_1...   (Rapport Complet, one-time)
PRICE_ID_49      = price_1...   (5 Rapports/mois, monthly)
PRICE_ID_99      = price_1...   (Illimité/mois, monthly)
```

---

## PART 3 — Configure Railway (2 minutes)

### Step 3.1 — Open the Railway project

1. Go to: **https://railway.app/project/8d3cc4a0-8229-4f06-aad1-7dfdf86c4abf**
2. Click on the **attentiq-frontend** service card

### Step 3.2 — Add environment variables

1. Click the **Variables** tab
2. For each variable below, click **+ New Variable**, paste the name exactly as shown, paste the value, press Enter:

| Variable Name | Value to paste |
|---------------|----------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your `pk_test_51...` key |
| `STRIPE_SECRET_KEY` | Your `sk_test_51...` key |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_19` | Your `PRICE_ID_19` (`price_1...`) |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_49` | Your `PRICE_ID_49` (`price_1...`) |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_99` | Your `PRICE_ID_99` (`price_1...`) |

> ⚠️ **Variable names are case-sensitive.** Copy them exactly as shown above — including the `NEXT_PUBLIC_` prefix where present.

### Step 3.3 — Deploy

1. After adding all 5 variables, Railway will automatically trigger a redeploy.
2. Wait for the deployment to show **✅ Active** (usually 60–90 seconds).
3. You can watch the build log in the **Deployments** tab.

---

## PART 4 — Run the 4 Payment Tests (3 minutes each)

> **Test card to use for all tests:**
> ```
> Card number : 4242 4242 4242 4242
> Expiry date : 12/26  (any future date works)
> CVC         : 123    (any 3 digits work)
> Name        : Test User
> ```

---

### TEST 1 — Rapport Complet (19€ one-time payment)

**Goal:** Verify the one-time payment flow works end-to-end.

**Step 1** — Open the checkout page:
```
https://attentiq-frontend.railway.app/checkout/rapport-complet
```

**Step 2** — Verify the page loads correctly:
- ✅ You see the title **"Rapport Complet"**
- ✅ You see the price **"19€"**
- ✅ You see the button **"Payer 19€ — Rapport Complet"**
- ✅ No error message is visible

**Step 3** — Click the button **"Payer 19€ — Rapport Complet"**
- ✅ The button shows a spinner and text **"Redirection vers le paiement…"**
- ✅ After 1–3 seconds, you are redirected to a **Stripe-hosted checkout page** (URL starts with `https://checkout.stripe.com/...`)

**Step 4** — On the Stripe checkout page, verify:
- ✅ The product name shows **"Rapport Complet"**
- ✅ The amount shows **"€19.00"**
- ✅ The payment type is **one-time** (no "per month" text)

**Step 5** — Fill in the payment form:
- Email: `test@example.com`
- Card number: `4242 4242 4242 4242`
- Expiry: `12/26`
- CVC: `123`
- Name: `Test User`
- Click **Pay €19.00**

**Step 6** — Verify the success redirect:
- ✅ You are redirected to: `https://attentiq-frontend.railway.app/merci`
- ✅ You see a green checkmark icon
- ✅ You see the text **"Merci pour votre achat ! 🎉"**
- ✅ You see the green banner: **"✅ Accès premium activé — votre rapport complet est disponible."**

**Step 7** — Verify in Stripe Dashboard:
1. Go to **https://dashboard.stripe.com/test/payments**
2. You should see a new payment of **€19.00** with status **Succeeded**
3. Click on it → verify the product is **"Rapport Complet"**

**TEST 1 RESULT:** ☐ PASS &nbsp;&nbsp; ☐ FAIL

---

### TEST 2 — 5 Rapports/mois (49€/month subscription)

**Goal:** Verify the monthly subscription flow works end-to-end.

**Step 1** — Open the checkout page:
```
https://attentiq-frontend.railway.app/checkout/5-rapports
```

**Step 2** — Verify the page loads correctly:
- ✅ You see the badge **"⭐ Le plus populaire"**
- ✅ You see the price **"49€"**
- ✅ You see the button **"Payer 49€ — 5 Rapports"**
- ✅ No error message is visible

**Step 3** — Click the button **"Payer 49€ — 5 Rapports"**
- ✅ The button shows a spinner and text **"Redirection vers le paiement…"**
- ✅ After 1–3 seconds, you are redirected to a Stripe checkout page

**Step 4** — On the Stripe checkout page, verify:
- ✅ The product name shows **"5 Rapports/mois"**
- ✅ The amount shows **"€49.00 per month"** (or equivalent)
- ✅ The payment type is **subscription / recurring**

**Step 5** — Fill in the payment form:
- Email: `test@example.com`
- Card number: `4242 4242 4242 4242`
- Expiry: `12/26`
- CVC: `123`
- Name: `Test User`
- Click **Subscribe** (or **Pay €49.00**)

**Step 6** — Verify the success redirect:
- ✅ You are redirected to: `https://attentiq-frontend.railway.app/merci`
- ✅ You see the text **"Merci pour votre achat ! 🎉"**
- ✅ You see the green premium banner

**Step 7** — Verify in Stripe Dashboard:
1. Go to **https://dashboard.stripe.com/test/subscriptions**
2. You should see a new subscription of **€49.00/month** with status **Active**

**TEST 2 RESULT:** ☐ PASS &nbsp;&nbsp; ☐ FAIL

---

### TEST 3 — Illimité/mois (99€/month subscription)

**Goal:** Verify the premium subscription flow works end-to-end.

**Step 1** — Open the checkout page:
```
https://attentiq-frontend.railway.app/checkout/illimite
```

**Step 2** — Verify the page loads correctly:
- ✅ You see the badge **"🚀 Pour les pros"**
- ✅ You see the price **"99€"**
- ✅ You see the button **"Démarrer pour 99€/mois"**
- ✅ You see the FAQ section with 3 questions
- ✅ No error message is visible

**Step 3** — Click the button **"Démarrer pour 99€/mois"**
- ✅ The button shows a spinner and text **"Redirection vers le paiement…"**
- ✅ After 1–3 seconds, you are redirected to a Stripe checkout page

**Step 4** — On the Stripe checkout page, verify:
- ✅ The product name shows **"Illimité/mois"**
- ✅ The amount shows **"€99.00 per month"** (or equivalent)
- ✅ The payment type is **subscription / recurring**

**Step 5** — Fill in the payment form:
- Email: `test@example.com`
- Card number: `4242 4242 4242 4242`
- Expiry: `12/26`
- CVC: `123`
- Name: `Test User`
- Click **Subscribe** (or **Pay €99.00**)

**Step 6** — Verify the success redirect:
- ✅ You are redirected to: `https://attentiq-frontend.railway.app/merci`
- ✅ You see the text **"Merci pour votre achat ! 🎉"**
- ✅ You see the green premium banner

**Step 7** — Verify in Stripe Dashboard:
1. Go to **https://dashboard.stripe.com/test/subscriptions**
2. You should see a new subscription of **€99.00/month** with status **Active**

**TEST 3 RESULT:** ☐ PASS &nbsp;&nbsp; ☐ FAIL

---

### TEST 4 — Cancel Flow (abandon checkout)

**Goal:** Verify that cancelling a payment returns the user to the correct page without errors.

**Step 1** — Open the checkout page:
```
https://attentiq-frontend.railway.app/checkout/rapport-complet
```

**Step 2** — Click the button **"Payer 19€ — Rapport Complet"**
- ✅ You are redirected to the Stripe checkout page

**Step 3** — On the Stripe checkout page, click the **← back arrow** or **"Return to Attentiq"** link (top left of the Stripe page)

**Step 4** — Verify the cancel redirect:
- ✅ You are returned to: `https://attentiq-frontend.railway.app/checkout/rapport-complet`
- ✅ The page loads normally with no error messages
- ✅ The **"Payer 19€ — Rapport Complet"** button is visible and clickable again

**Step 5** — Verify in Stripe Dashboard:
1. Go to **https://dashboard.stripe.com/test/payments**
2. You may see an **Incomplete** or **Expired** session — this is correct and expected
3. There should be **no** "Succeeded" payment for this cancelled session

**TEST 4 RESULT:** ☐ PASS &nbsp;&nbsp; ☐ FAIL

---

## PART 5 — Final Validation Checklist

### Setup Checklist

- ☐ Stripe account created and email verified
- ☐ Test mode is ON in Stripe Dashboard
- ☐ Publishable key (`pk_test_...`) copied
- ☐ Secret key (`sk_test_...`) copied
- ☐ Product 1 created: **Rapport Complet** — €19.00 — One-time
- ☐ Product 2 created: **5 Rapports/mois** — €49.00 — Monthly
- ☐ Product 3 created: **Illimité/mois** — €99.00 — Monthly
- ☐ All 3 Price IDs copied (`price_1...`)
- ☐ All 5 Railway variables set with exact names
- ☐ Railway deployment shows **Active** status

### Test Results Checklist

| Test | Checkout page loads | Stripe redirect works | Payment succeeds | /merci page loads | Premium banner shows |
|------|--------------------|-----------------------|-----------------|-------------------|----------------------|
| TEST 1 — 19€ one-time | ☐ | ☐ | ☐ | ☐ | ☐ |
| TEST 2 — 49€/month | ☐ | ☐ | ☐ | ☐ | ☐ |
| TEST 3 — 99€/month | ☐ | ☐ | ☐ | ☐ | ☐ |
| TEST 4 — Cancel flow | ☐ | ☐ | ☐ (N/A) | ☐ (N/A) | ☐ (N/A) |

### Stripe Dashboard Verification

- ☐ Payment of €19.00 visible in **Payments** with status **Succeeded**
- ☐ Subscription of €49.00/month visible in **Subscriptions** with status **Active**
- ☐ Subscription of €99.00/month visible in **Subscriptions** with status **Active**
- ☐ Cancelled session visible as **Incomplete** (not Succeeded)

---

### Sign-off

> All 4 tests passed. Stripe integration is validated and ready for production.

| Field | Value |
|-------|-------|
| Validated by | __________________ |
| Date | __________________ |
| Stripe Account ID | `acct_...` (visible in Dashboard → Settings → Account details) |
| Railway Deployment URL | `https://attentiq-frontend.railway.app` |
| Block 1 Status | ✅ VALIDATED |

---

## Troubleshooting

### "Stripe non disponible" error on the checkout page
- The `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` variable is missing or incorrect on Railway.
- Go to Railway → Variables → verify the key starts with `pk_test_`.
- Redeploy after fixing.

### "Failed to create checkout session" error after clicking the button
- The `STRIPE_SECRET_KEY` variable is missing or incorrect on Railway.
- Go to Railway → Variables → verify the key starts with `sk_test_`.
- Also verify the Price IDs are correct — they must start with `price_` and match the products you created.

### Button spins forever and never redirects
- Open browser DevTools (F12) → Console tab → look for red error messages.
- Open browser DevTools → Network tab → look for a failed request to `/api/checkout`.
- The response body will contain the exact Stripe error message.

### Redirected to /merci but no premium banner
- This is a cookie timing issue. Refresh the page once — the banner should appear.
- If it still doesn't appear, check the Network tab for a failed request to `/api/set-premium`.

### Stripe checkout page shows wrong currency or amount
- The Price ID you set in Railway does not match the product you created.
- Go to Stripe Dashboard → Products → click the product → copy the Price ID again.
- Update the corresponding Railway variable and redeploy.

### "Your card was declined" during testing
- Make sure you are using the test card `4242 4242 4242 4242` (not a real card).
- Make sure Test Mode is ON in the Stripe Dashboard.

---

## Reference: Environment Variable Names (exact)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PRICE_ID_19
NEXT_PUBLIC_STRIPE_PRICE_ID_49
NEXT_PUBLIC_STRIPE_PRICE_ID_99
```

## Reference: Application URLs

```
Home page          : https://attentiq-frontend.railway.app/
Analyze page       : https://attentiq-frontend.railway.app/analyze
Checkout — 19€     : https://attentiq-frontend.railway.app/checkout/rapport-complet
Checkout — 49€     : https://attentiq-frontend.railway.app/checkout/5-rapports
Checkout — 99€     : https://attentiq-frontend.railway.app/checkout/illimite
Success page       : https://attentiq-frontend.railway.app/merci
Railway project    : https://railway.app/project/8d3cc4a0-8229-4f06-aad1-7dfdf86c4abf
Stripe Dashboard   : https://dashboard.stripe.com/test/dashboard
Stripe Payments    : https://dashboard.stripe.com/test/payments
Stripe Subscriptions: https://dashboard.stripe.com/test/subscriptions
Stripe Products    : https://dashboard.stripe.com/test/products
```
