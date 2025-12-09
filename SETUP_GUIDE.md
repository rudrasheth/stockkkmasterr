# StockMaster Setup Guide

## Required API Keys (Free Tier)

### 1. Razorpay (Payment Gateway)
1. Go to https://dashboard.razorpay.com/signup
2. Sign up for a free account
3. After login, go to Settings → API Keys
4. Click "Generate Test Key" (No credit card required for test mode)
5. Copy the `Key ID` and `Key Secret`

**Add to Vercel Environment Variables:**
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

**Test Cards:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

### 2. Mapbox (Maps & Geolocation)
1. Go to https://account.mapbox.com/auth/signup/
2. Sign up for a free account (50,000 free map loads/month)
3. After login, go to Account → Access Tokens
4. Copy your default public token (starts with `pk.`)

**Add to Vercel Environment Variables:**
```
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNtM3kwam15MjBhODRqcHk4YnJwOWt2ZyJ9.xxxxxxxxxxxxx
```

## How to Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click Settings → Environment Variables
3. Add each variable:
   - Name: `RAZORPAY_KEY_ID`
   - Value: Your Razorpay test key
   - Environment: Production, Preview, Development
4. Click Save
5. Repeat for `RAZORPAY_KEY_SECRET` and `MAPBOX_ACCESS_TOKEN`
6. Redeploy your project

## Features Enabled

✅ **Real Payment Gateway** - Razorpay integration with test mode
- Accept payments via Cards, UPI, Net Banking
- Automatic payment verification and signature validation
- Transaction records saved to database

✅ **Interactive Maps** - Mapbox GL JS integration
- Visual representation of warehouse locations
- Clickable markers with location details
- Pan, zoom, and navigation controls
- Automatic marker placement for all locations

## Usage

### Making a Payment
1. Go to Payments section
2. Fill Quick Checkout form with invoice details
3. Click "Pay with Razorpay"
4. Use test card: `4111 1111 1111 1111`
5. Payment will be recorded automatically

### Viewing Locations on Map
1. Go to Locations section
2. Interactive map shows all warehouse locations
3. Click any marker to see location details
4. Add new locations and they appear on the map automatically

## Notes
- All credentials are for TEST MODE (no real money)
- Razorpay test mode works without KYC or business verification
- Mapbox free tier includes 50,000 monthly map loads
- Map markers are randomly placed around India (can be customized with real lat/long)
