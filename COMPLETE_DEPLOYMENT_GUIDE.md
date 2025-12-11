# 📚 COMPLETE VERCEL DEPLOYMENT GUIDE

## Overview

This guide walks you through deploying StockMaster ML to Vercel with all features working, including:
- ✅ ML Intelligence Hub dashboard
- ✅ Compact warehouse visualization
- ✅ Image classification and detection
- ✅ Demand forecasting and inventory optimization
- ✅ MongoDB integration
- ✅ Email notifications
- ✅ Gemini AI features

**Estimated Time**: 15-20 minutes

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Vercel Account** - Sign up at https://vercel.com (free tier available)
2. **MongoDB Account** - Sign up at https://www.mongodb.com/cloud/atlas (free tier available)
3. **Node.js v18+** - Download from https://nodejs.org
4. **Git** (optional but recommended) - Download from https://git-scm.com
5. **Gmail Account** (optional for email features) - Any Gmail account

---

## 🔧 Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **Sign in** or **Create free account**
3. Create a new project (e.g., "StockMaster ML")
4. Click **Build a Database** and select **M0 Cluster (Free)**
5. Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
6. Select a region closest to you
7. Click **Create Cluster** (takes ~3-5 minutes)

### 1.2 Set Up Database Access

1. In Atlas Dashboard, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication method
4. Enter username: `stockmaster_user`
5. Generate secure password (or enter custom password)
6. **Save password in safe place** - you'll need it in Step 2
7. Set user privileges to **Built-in Role: Read and write to any database**
8. Click **Add User**

### 1.3 Whitelist IP Address

1. Go to **Network Access** in left sidebar
2. Click **Add IP Address**
3. Choose **Allow access from anywhere** (for Vercel)
4. Enter comment: "Vercel Deployment"
5. Click **Confirm**

> ⚠️ **Security Note**: In production, you should whitelist Vercel's IP addresses instead of allowing all IPs. See [Vercel IP ranges](https://vercel.com/docs/concepts/edge-network/regions-and-edge-middleware#vercel-edge-network).

### 1.4 Get Connection String

1. Click **Connect** button on cluster page
2. Select **Drivers**
3. Copy the connection string shown (looks like: `mongodb+srv://stockmaster_user:<password>@cluster.mongodb.net/stockmaster?retryWrites=true&w=majority`)
4. Replace `<password>` with your actual password
5. Replace database name if needed (default: `test`, change to `stockmaster`)

**Example:**
```
mongodb+srv://stockmaster_user:MyP@ssw0rd123@cluster0.xyz.mongodb.net/stockmaster?retryWrites=true&w=majority
```

---

## 🔐 Step 2: Prepare Credentials

Create a file called `.env.production.local` in your project root with:

```env
# Database Configuration (REQUIRED)
DB_CONNECT_STRING=mongodb+srv://stockmaster_user:MyP@ssw0rd123@cluster0.xyz.mongodb.net/stockmaster?retryWrites=true&w=majority

# Email Configuration (Optional - for sending emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_google_app_password

# Gemini API Configuration (Optional - for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Server Port (Vercel manages this automatically)
# PORT=3000
```

### Email Setup (Optional)

If you want email notifications to work:

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Use this password as `EMAIL_PASS` value
5. Use your Gmail address as `EMAIL_USER`

### Gemini API Setup (Optional)

If you want AI features:

1. Go to https://aistudio.google.com/apikey
2. Click **Create API Key**
3. Choose your Google Cloud project (or create new)
4. Copy the API key and paste as `GEMINI_API_KEY`

---

## 🚀 Step 3: Deploy to Vercel

### Option A: Using the Deployment Script (Windows)

1. Open PowerShell in your project root
2. Run the deployment script:
   ```powershell
   .\DEPLOY_TO_VERCEL.bat
   ```
3. Follow the interactive prompts
4. Choose option "A" for first-time deployment or "B" to update

### Option B: Manual Deployment (All Platforms)

#### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Authenticate with Vercel

```bash
vercel login
```

#### 3.3 Deploy to Preview First (Recommended)

```bash
vercel
```

This creates a preview URL for testing. Check the output for the URL like:
```
Preview: https://stockmaster-ml-xyz.vercel.app
```

#### 3.4 Test Preview Deployment

1. Visit the preview URL
2. Test main features
3. Check browser console for errors (F12)
4. Verify ML Hub loads
5. Verify warehouse visualization renders

#### 3.5 Deploy to Production

```bash
vercel --prod
```

This deploys to your production URL.

---

## ⚙️ Step 4: Configure Environment Variables in Vercel

### 4.1 Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your StockMaster ML project

### 4.2 Set Environment Variables

1. Click **Settings** (top navigation)
2. Go to **Environment Variables** (left sidebar)
3. For each variable below, click **Add New** and enter:

| Name | Value | Environment |
|------|-------|-------------|
| `DB_CONNECT_STRING` | `mongodb+srv://stockmaster_user:MyP@ssw0rd123@cluster0.xyz.mongodb.net/stockmaster` | Production / Preview / Development |
| `EMAIL_USER` | `your-email@gmail.com` | Production / Preview / Development |
| `EMAIL_PASS` | `16-char-app-password` | Production / Preview / Development |
| `GEMINI_API_KEY` | `your-api-key` | Production / Preview / Development |

### 4.3 Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **3-dot menu** → **Redeploy**
4. Click **Redeploy** when prompted

Wait for the redeployment to complete (2-5 minutes).

---

## ✅ Step 5: Verify Production Deployment

### 5.1 Test Application Access

Visit these URLs in your browser:

- **ML Hub**: `https://your-project.vercel.app/ml-hub.html`
- **Warehouse**: `https://your-project.vercel.app/warehouse-compact.html`
- **Main App**: `https://your-project.vercel.app/app`

### 5.2 Test API Endpoints

Open your browser console (F12) and run:

```javascript
// Test ML model info
fetch('https://your-project.vercel.app/api/ml/model-info')
  .then(r => r.json())
  .then(console.log)

// Test database connection
fetch('https://your-project.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

### 5.3 Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **Deployments**
4. Click the latest deployment
5. Scroll down to **Function Logs**
6. Look for any errors (red text)

### 5.4 Browser Console Check

Press F12 in browser and check for:
- ❌ No red error messages
- ❌ No network failures (404, 500, etc.)
- ✅ ML models load successfully
- ✅ API endpoints respond with data

---

## 📱 Access Your Deployed App

After successful deployment, your app is available at:

```
https://your-project-name.vercel.app
```

### Key URLs

| Feature | URL |
|---------|-----|
| ML Hub Dashboard | `/ml-hub.html` |
| Warehouse Viewer | `/warehouse-compact.html` |
| Main App | `/app` |
| API Health Check | `/api/health` |
| API ML Routes | `/api/ml/*` |

### Test Image Classification

1. Go to ML Hub: `https://your-project.vercel.app/ml-hub.html`
2. Click "Upload Image" for product classification
3. Select any image file (JPG, PNG)
4. Click "Classify"
5. See results: Product name, confidence score, category

---

## 🔍 Troubleshooting Common Issues

### Issue 1: "Cannot find module" Errors

**Error Message**: `Cannot find module '@tensorflow/tfjs'`

**Solution**:
```bash
# Delete dependencies and reinstall
rm -r node_modules package-lock.json
npm install
npm run build
vercel --prod
```

### Issue 2: Environment Variables Not Working

**Symptoms**: 
- API returns "Database connection error"
- Email sending fails
- AI features don't work

**Solution**:
1. Verify variables are set in Vercel Dashboard
2. Check spelling (case-sensitive)
3. Redeploy with `vercel --prod`
4. Wait 2-3 minutes for changes to take effect

### Issue 3: Database Connection Failed

**Error**: `MongoNetworkError` or `Connection refused`

**Solution**:
1. Verify MongoDB URI in Vercel environment variables
2. Check MongoDB cluster is running in Atlas
3. Verify IP address is whitelisted in MongoDB Atlas
4. Test connection string locally: `mongosh "your_connection_string"`

### Issue 4: TensorFlow Models Not Loading

**Symptoms**:
- ML Hub dashboard blank
- Console errors about WASM files
- Image classification doesn't work

**Solution**:
```javascript
// Check model loading in browser console
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// This should complete without errors
const net = await mobilenet.load();
console.log('Model loaded successfully!');
```

### Issue 5: 404 Not Found for HTML Files

**Error**: `Cannot GET /ml-hub.html`

**Solution**:
1. Check `vercel.json` routes are correct
2. Verify files exist in `src/dist/` directory
3. Rebuild: `npm run build`
4. Redeploy: `vercel --prod`

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files to Git
- [ ] No hardcoded API keys in source code
- [ ] Environment variables are set in Vercel (not `.env` files)
- [ ] MongoDB password is strong and unique
- [ ] IP whitelist is configured in MongoDB
- [ ] CORS is configured appropriately
- [ ] No console.log of sensitive data
- [ ] Database backups are enabled in MongoDB Atlas

---

## 📊 Monitor Your Deployment

### Enable Analytics

1. Vercel Dashboard → Settings → Analytics
2. Turn on **Web Analytics**
3. Monitor page performance

### View Function Logs

1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Scroll to **Function Logs**
4. See real-time API execution logs

### Set Up Alerts

1. Vercel Dashboard → Settings → Alerts
2. Configure notifications for:
   - Failed deployments
   - High error rate
   - Performance degradation

---

## 🎯 Next Steps After Deployment

1. **Test all features thoroughly**
   - Upload images to ML Hub
   - Generate forecasts
   - View warehouse visualization
   - Test API endpoints

2. **Set up custom domain** (optional)
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records

3. **Enable auto-deployment** (optional)
   - Connect GitHub repository
   - Enable "Auto-deploy on Push"
   - Every commit deploys automatically

4. **Monitor performance**
   - Check API response times
   - Monitor database queries
   - Optimize hot paths if needed

5. **Backup your data**
   - Enable MongoDB automatic backups
   - Create monthly exports
   - Store securely

---

## 📞 Support & Resources

### Documentation
- **ML Features**: Read `ML_FEATURES.md` in project
- **Quick Start**: Read `QUICK_START_ML.md` in project
- **Integration Guide**: Read `ML_INTEGRATION_EXAMPLES.md` in project

### External Resources
- **Vercel Help**: https://vercel.com/help
- **MongoDB Documentation**: https://docs.mongodb.com
- **TensorFlow.js Guide**: https://www.tensorflow.org/js/guide
- **Express.js Docs**: https://expressjs.com

### Getting Help
If deployment fails:
1. Check error messages in Vercel Function Logs
2. Review browser console (F12)
3. Re-read "Troubleshooting" section above
4. Check Vercel status: https://www.vercel-status.com

---

## 🎉 Success!

You've successfully deployed StockMaster ML to Vercel! 

Your application is now live with:
- ✅ ML-powered inventory optimization
- ✅ Real-time warehouse visualization
- ✅ Image classification for products
- ✅ Demand forecasting algorithms
- ✅ ABC inventory analysis
- ✅ Safety stock calculations
- ✅ Smart recommendations engine

**Deployment URL**: `https://your-project-name.vercel.app`

Share this URL with your team, and start using StockMaster ML in production!

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready ✅
