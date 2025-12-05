# Vercel Deployment Guide

This project is configured to deploy **both frontend and backend** on **Vercel** as serverless functions.

## Architecture

- **Frontend**: Vite React app in `/src` → builds to `/src/dist`
- **Backend**: Express API converted to serverless functions in `/api` → Vercel route handlers
- **Database**: MongoDB (Atlas recommended)

## Prerequisites

1. **GitHub Account** (to connect your repo to Vercel)
2. **MongoDB Instance** (create free tier at https://www.mongodb.com/cloud/atlas)
3. **Gmail Account** (optional, for password reset emails)
4. **Google Generative AI API Key** (optional, for AI chat features at https://ai.google.dev)

## Step 1: Get Your MongoDB Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / log in and create a free cluster
3. Click "Connect" and select "Drivers"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
5. Keep this safe — you'll need it for Vercel env vars

## Step 2: Push Code to GitHub

```powershell
git add .
git commit -m "Ready for Vercel: serverless API and Vite frontend"
git push origin main
```

## Step 3: Deploy to Vercel (Dashboard)

1. Go to https://vercel.com and sign up / log in
2. Click **"New Project"**
3. Select your GitHub repository (`stockkkmasterr` or your repo name)
4. Vercel will auto-detect the setup. Confirm:
   - Root Directory: (leave blank)
   - Framework Preset: Other
   - Build Command: `cd src && npm install && npm run build`
   - Output Directory: `src/dist`
5. **Before deploying**, click **"Environment Variables"** and add:
   - Key: `DB_CONNECT_STRING` → Value: your MongoDB connection string from Step 1
   - Key: `EMAIL_USER` → Value: your Gmail address (optional)
   - Key: `EMAIL_PASS` → Value: your Gmail App Password (optional)
   - Key: `GEMINI_API_KEY` → Value: your Google AI key (optional)
6. Click **"Deploy"**

Vercel will:
- Build frontend from `src/` into `src/dist`
- Deploy serverless handlers from `/api`
- Route requests intelligently (API calls → serverless functions, static files → CDN)

Your app will be live at: `https://your-project-name.vercel.app` ✅

## Step 4 (Optional): Set Up Custom Domain

In Vercel dashboard → Project Settings → Domains → Add custom domain

## Troubleshooting

### "DB_CONNECT_STRING is not defined"
- Go to Vercel Project Settings → Environment Variables
- Confirm `DB_CONNECT_STRING` is set and saved
- Redeploy the project

### Frontend calls fail with 404
- Verify all `.ts` handler files exist in `/api` directory
- Check Vercel build logs for errors

### Email features not working
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct (use Gmail App Password, not regular password)
- Go to https://myaccount.google.com/apppasswords and create an App Password if you haven't already

## Local Development (Optional)

To test before deploying:

```powershell
# Frontend
cd src
npm install
npm run dev

# Backend (in another terminal)
npm install -g vercel
vercel dev
```

## Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| `DB_CONNECT_STRING` | ✅ Yes | `mongodb+srv://user:pass@cluster.mongodb.net/stock` |
| `EMAIL_USER` | ❌ No | `your-email@gmail.com` |
| `EMAIL_PASS` | ❌ No | (Gmail App Password) |
| `GEMINI_API_KEY` | ❌ No | (Google Generative AI key) |

If optional variables are not set, their features are disabled (email returns 503, AI chat returns 503).

## Project Structure

```
.
├── src/                 # Frontend (Vite React)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── api/                 # Serverless handlers (auto-deployed by Vercel)
│   ├── signup.ts
│   ├── login.ts
│   ├── forgot-password.ts
│   ├── products.ts
│   ├── chat.ts
│   └── ... (other endpoints)
├── lib/                 # Shared utilities
│   ├── db.ts           # MongoDB connection
│   ├── schemas.ts      # Mongoose schemas
│   ├── email.ts        # Nodemailer config
│   └── ai.ts           # Generative AI config
├── vercel.json         # Vercel deployment config
└── package.json        # Root deps (serverless handler deps)
```

Done! Your full-stack app is now deployed on Vercel. 🚀
