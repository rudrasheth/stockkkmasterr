# 🚀 Quick Start: Setting Up API Keys

Your app is deployed at: **https://y-oapff1493-rudrasheth2201-8352s-projects.vercel.app**

## Step 1: Get Razorpay Test Keys (Free - 2 minutes)

1. Visit: https://dashboard.razorpay.com/signup
2. Sign up with email (no credit card needed for test mode)
3. After login, go to **Settings** → **API Keys**
4. Click **"Generate Test Key"**
5. Copy both:
   - `Key ID` (starts with `rzp_test_`)
   - `Key Secret`

## Step 2: Get Mapbox Token (Free - 1 minute)

1. Visit: https://account.mapbox.com/auth/signup/
2. Sign up (50,000 free map loads/month)
3. Go to **Account** → **Access Tokens**
4. Copy your **Default public token** (starts with `pk.`)

## Step 3: Add to Vercel

1. Open: https://vercel.com/rudrasheth2201-8352s-projects/y/settings/environment-variables
2. Add these three variables:

   **Variable 1:**
   - Name: `RAZORPAY_KEY_ID`
   - Value: `rzp_test_your_actual_key_here`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `RAZORPAY_KEY_SECRET`
   - Value: `your_actual_secret_here`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 3:**
   - Name: `MAPBOX_ACCESS_TOKEN`
   - Value: `pk.your_actual_token_here`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. Click **Save** for each
4. Go to **Deployments** tab
5. Click the **"..."** menu on latest deployment → **Redeploy**

## Step 4: Test It Out!

### Test Payment Gateway
1. Go to **Payments** section
2. Fill Quick Checkout form
3. Click **"Pay with Razorpay"**
4. Use test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/25` (any future date)
   - CVV: `123` (any 3 digits)
   - Name: `Test User`
5. ✅ Payment recorded automatically!

### Test Map
1. Go to **Locations** section
2. See interactive Mapbox map with warehouse markers
3. Click markers to see location details
4. Add new locations and watch them appear on map

## Already Set Up?

If you already added the keys:
- Just check the deployment is using them (redeploy if needed)
- Maps and payments should work immediately
- No code changes needed!

## Need Help?

- Razorpay docs: https://razorpay.com/docs/payments/
- Mapbox docs: https://docs.mapbox.com/
- All keys are FREE for testing and development
