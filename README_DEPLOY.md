Deployment Guide

This repository contains a Vite frontend and a TypeScript Node backend (serverless functions in `/api`). Both are configured to deploy together on **Vercel**.

## Setup Before Deploying

1. Create a MongoDB instance (recommended: MongoDB Atlas free tier at https://www.mongodb.com/cloud/atlas)
2. Note your MongoDB connection string
3. (Optional) Set up Gmail App Password for email features
4. (Optional) Get a Google Generative AI API key from https://ai.google.dev

## Required Environment Variables (set in Vercel dashboard)
- `DB_CONNECT_STRING` — MongoDB connection string (format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
- `EMAIL_USER` — (optional) Gmail address for sending OTPs and password resets
- `EMAIL_PASS` — (optional) Gmail App Password (not your regular password)
- `GEMINI_API_KEY` — (optional) Google Generative AI API key for AI chat features

Option A — Separate frontend (Vercel) + backend (Render/Railway)
1. Frontend (Vercel)
   - In Vercel, create a new project and point to this repo.
   - Set the Root Directory to `src`.
   - Build command: `npm install && npm run build`
   - Output Directory: `dist`
   - Deploy — Vercel will serve the static site.
   - Set the Root Directory to `src` (important).
   - Build command: `npm install && npm run build`
   - Output Directory: `dist`
   - Deploy — Vercel will serve the static site from the `dist` directory.

   Quick CLI deploy (from project root):
   ```powershell
   cd 'C:\Users\HP\Downloads\StockMater_ss\\src'
   # Install Vercel CLI once if you haven't already:
   # npm i -g vercel
   vercel login
   vercel --prod
   ```

   Notes on the backend API:
   - If your backend will be hosted on another provider (Render, Railway, etc.), configure the backend URL in the frontend.
   - Preferred pattern: create an environment variable `VITE_API_URL` in Vercel and update frontend code to call `${import.meta.env.VITE_API_URL}/api/...`.
   - If your frontend currently uses relative `/api/...` endpoints, you can either host the backend at the same domain (one server) or change the frontend to use `VITE_API_URL`.

2. Backend (Render / Railway / Heroku)
   - Create a new Web Service.
   - Point the service to the repo and set the Root Directory to `src/api`.
   - Build command: `npm install && npm run build`
   - Start command: `npm start` (this runs `node dist/index.js`)
   - Set the required environment variables in your provider's dashboard.

Option B — Single Docker image (recommended when you want a single deploy)
1. Build the Docker image locally:
```powershell
cd 'C:\Users\HP\Downloads\StockMater_ss'
docker build -t stockmaster:latest .
```
2. Run the container:
```powershell
docker run -e DB_CONNECT_STRING="your_mongo_uri" -p 5000:5000 stockmaster:latest
```
This image builds the frontend and backend and places the frontend `dist` into the backend, which serves it if present.

Option C — Render (Single service building both)
- On Render you can create a Web Service and set the Root to the repository root. Use build command:
  - `cd src && npm ci && npm run build && cd api && npm ci && npm run build`
  - Start command: `cd api && npm start`
- Add environment variables in Render dashboard.

Security notes
- Do NOT commit `.env` or secrets to the repository.
- I removed hard-coded API keys in code and added `.env.example` in `src/api`. Use it as a template.

If you want, I can:
- Remove any remaining test/demo credentials from the codebase.
- Set up a GitHub Action to build the frontend and push the `dist` to a branch or deploy automatically.
- Prepare a Render or Docker Compose manifest for one-click deploy.

 If you'd like, I can update the frontend to read `import.meta.env.VITE_API_URL` for all API calls and add instructions for setting that env var in Vercel (recommended). Tell me if you want frontend-only deploy (Vercel) or both frontend+backend on Vercel (the backend would need serverless function conversion).

Tell me which provider you'd like to deploy to and I will produce step-by-step instructions and any additional files (service templates, CI config) you want.