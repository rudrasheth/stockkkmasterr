# 🚀 VERCEL DEPLOYMENT - QUICK REFERENCE CARD

## One-Page Deployment Summary

### Prerequisites Checklist ✓
```
✓ Node.js v18+ installed
✓ Vercel account created (vercel.com)
✓ MongoDB Atlas account + cluster created
✓ MongoDB database user created with password
✓ MongoDB IP whitelist configured for "anywhere"
✓ MongoDB connection string copied
```

---

## 3-Step Deployment Process

### STEP 1: Run Deployment Script (2 min)
```powershell
# Navigate to project directory
cd c:\Users\HP\Downloads\StockMater_ss

# Run the deployment script
.\DEPLOY_TO_VERCEL.bat

# Or manually:
npm install
vercel login
```

### STEP 2: Set Environment Variables (3 min)
In **Vercel Dashboard → Settings → Environment Variables**, add:

```
DB_CONNECT_STRING = mongodb+srv://user:pass@cluster.mongodb.net/stockmaster
EMAIL_USER = your-email@gmail.com (optional)
EMAIL_PASS = your-app-password (optional)
GEMINI_API_KEY = your-api-key (optional)
```

Set each variable to: **Production, Preview, Development**

### STEP 3: Redeploy (2 min)
In **Vercel Dashboard → Deployments**:
1. Find latest deployment
2. Click 3-dot menu → Redeploy
3. Wait for completion

---

## Deployment URLs

```
Preview:  https://your-project.vercel.app (test before prod)
Production: https://your-project.vercel.app (after env vars set)

Features:
  ML Hub Dashboard: https://your-project.vercel.app/ml-hub.html
  Warehouse Viewer: https://your-project.vercel.app/warehouse-compact.html
  API Health: https://your-project.vercel.app/api/health
```

---

## Environment Variables Reference

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DB_CONNECT_STRING` | MongoDB connection | ✅ YES | `mongodb+srv://user:pass@...` |
| `EMAIL_USER` | Gmail for notifications | ⭕ No | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | ⭕ No | `abcd efgh ijkl mnop` |
| `GEMINI_API_KEY` | Google AI features | ⭕ No | `AIzaSy...` |

---

## MongoDB Setup Quick Reference

### Get Connection String
1. MongoDB Atlas → Cluster → Connect
2. Choose "Drivers" 
3. Copy connection string
4. Replace `<password>` with actual password
5. Use as `DB_CONNECT_STRING`

### Common Issues
| Issue | Solution |
|-------|----------|
| Connection timeout | Whitelist IP to "anywhere" in Atlas |
| Auth failed | Check password in connection string |
| Database not found | Create database first in Atlas |

---

## Troubleshooting Quick Guide

### ❌ Error: "Cannot find module"
```bash
rm -r node_modules package-lock.json
npm install
vercel --prod
```

### ❌ Error: "Database connection failed"
- Check `DB_CONNECT_STRING` in Vercel env vars
- Verify MongoDB cluster is running
- Whitelist IP in MongoDB Atlas

### ❌ Error: "404 Not Found" for /ml-hub.html
- Check `vercel.json` routes
- Verify files in `src/dist/` directory
- Run `npm run build` and redeploy

### ❌ Error: "TensorFlow models not loading"
- Check browser console (F12)
- Verify CORS is allowed
- Ensure `.wasm` files exist
- Clear browser cache

---

## File Reference

| File | Purpose | Location |
|------|---------|----------|
| `DEPLOY_TO_VERCEL.bat` | Interactive deployment script | Project root |
| `COMPLETE_DEPLOYMENT_GUIDE.md` | Full step-by-step guide | Project root |
| `VERCEL_DEPLOYMENT_CHECKLIST.md` | Pre & post deployment checklist | Project root |
| `vercel.json` | Vercel configuration | Project root |
| `package.json` | Dependencies + build scripts | Project root |
| `.env.local` | Local credentials (DO NOT COMMIT) | Project root |

---

## Test Deployment (In Browser Console)

```javascript
// Test API connection
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log('✓ API Works:', data))
  .catch(err => console.error('✗ API Error:', err))

// Test ML model
fetch('/api/ml/model-info')
  .then(r => r.json())
  .then(data => console.log('✓ ML Models:', data))
  .catch(err => console.error('✗ ML Error:', err))
```

---

## Common Commands Cheatsheet

```bash
# Install dependencies
npm install

# Build project
npm run build

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Redeploy without rebuild
vercel --prod --skip-build

# Check Vercel status
vercel list
```

---

## Post-Deployment Checklist

- [ ] Visit production URL in browser
- [ ] ML Hub dashboard loads
- [ ] Warehouse visualization renders
- [ ] Image upload works in ML Hub
- [ ] Try uploading a test image
- [ ] Check browser console (F12) for errors
- [ ] Test API endpoints in console
- [ ] Verify database connection working
- [ ] Share URL with team
- [ ] Monitor Vercel logs for errors

---

## Help & Support

**Need Help?**
1. Check `COMPLETE_DEPLOYMENT_GUIDE.md` - Full detailed guide
2. Check `VERCEL_DEPLOYMENT_CHECKLIST.md` - Complete checklist
3. Check browser console (F12) for errors
4. Check Vercel Function Logs (Dashboard → Deployments)

**External Resources**
- Vercel Docs: https://vercel.com/docs
- MongoDB Help: https://docs.mongodb.com/community
- TensorFlow.js: https://www.tensorflow.org/js

---

## Important URLs

| Service | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas |
| Gmail App Passwords | https://myaccount.google.com/apppasswords |
| Gemini API Console | https://aistudio.google.com/apikey |

---

## Success Indicators ✅

When deployment is successful, you should see:
- ✅ Vercel shows "Ready" status
- ✅ Production URL is accessible
- ✅ ML Hub dashboard loads
- ✅ No red errors in browser console
- ✅ API endpoints return data
- ✅ Images can be uploaded and classified
- ✅ Warehouse visualization renders
- ✅ Database connection established

---

**Status**: Ready for Deployment 🚀
**Estimated Time**: 15-20 minutes
**Difficulty**: Easy (follow script prompts)

**Next Action**: Run `.\DEPLOY_TO_VERCEL.bat` to begin deployment!
