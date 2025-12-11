# 🚀 VERCEL DEPLOYMENT CHECKLIST

## Pre-Deployment Verification

### 1. Local Environment Setup
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] Git configured (if using git-based deployment)
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] All project dependencies installed (`npm install`)

### 2. Project Configuration
- [ ] `vercel.json` exists and is properly formatted
- [ ] `package.json` contains all required dependencies:
  - [ ] @tensorflow/tfjs ^4.11.0
  - [ ] @tensorflow-models/mobilenet ^2.1.0
  - [ ] @tensorflow-models/coco-ssd ^2.2.3
  - [ ] express, mongoose, bcrypt, cors, dotenv, nodemailer
- [ ] Build script configured in `package.json`: `"build": "tsc"`
- [ ] No TypeScript errors: `npm run build`

### 3. Frontend Assets
- [ ] `/src/dist/warehouse-compact.html` exists
- [ ] `/src/dist/ml-hub.html` exists
- [ ] All assets load correctly locally
- [ ] No console errors in browser DevTools
- [ ] Images and external resources load properly

### 4. Backend API Setup
- [ ] `/src/api/index.ts` configured correctly
- [ ] `/src/api/ml-routes.ts` contains all 7 endpoints
- [ ] Environment variable placeholders in code (not hardcoded)
- [ ] Error handling implemented for all routes
- [ ] No console.log() statements with sensitive data

### 5. Environment Variables Ready
- [ ] Credentials prepared:
  - [ ] MongoDB connection string (MongoDB Atlas)
  - [ ] Email credentials (if using email features)
  - [ ] Gemini API key (if using AI features)
- [ ] `.env.local` file exists with placeholder values (DO NOT COMMIT)
- [ ] `.gitignore` includes `.env` files

### 6. Security Check
- [ ] No hardcoded API keys or passwords in code
- [ ] No sensitive data in package.json
- [ ] `.env*` files are in .gitignore
- [ ] Database credentials use environment variables
- [ ] CORS configuration is appropriate

### 7. Testing Checklist
- [ ] Local tests pass: `npm test` (if applicable)
- [ ] API endpoints respond on localhost:3000
- [ ] ML Hub dashboard loads and functions
- [ ] Warehouse dashboard loads and renders
- [ ] Image classification works locally
- [ ] Database connection works locally

## Deployment Steps

### Step 1: Verify Local Setup
```powershell
cd c:\Users\HP\Downloads\StockMater_ss
npm install
npm run build
echo "✓ Local setup verified"
```

### Step 2: Authenticate with Vercel
```powershell
vercel login
# Follow the prompts to authenticate with your Vercel account
```

### Step 3: Deploy Preview (Recommended First)
```powershell
vercel
# This creates a preview URL for testing
# Check the output for the deployment URL
```

### Step 4: Test Preview Deployment
- [ ] Access preview URL from deployment output
- [ ] Test main app functionality
- [ ] Check ML Hub dashboard loads
- [ ] Verify warehouse visualization renders
- [ ] Check browser console for errors

### Step 5: Configure Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (StockMaster ML)
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DB_CONNECT_STRING` | `mongodb+srv://user:pass@cluster.mongodb.net/stockmaster` | Production, Preview, Development |
| `EMAIL_USER` | Your Gmail address | Production, Preview, Development |
| `EMAIL_PASS` | Gmail App Password | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Gemini API key | Production, Preview, Development |

5. Click "Save"

### Step 6: Redeploy with Environment Variables
```powershell
vercel --prod --skip-build
# This redeploys with the new environment variables
# --skip-build flag prevents unnecessary rebuild
```

### Step 7: Verify Production Deployment
- [ ] Production URL is accessible
- [ ] All features work correctly
- [ ] No 502 or 503 errors
- [ ] API endpoints return expected responses
- [ ] ML models load successfully
- [ ] Database queries work (if applicable)

## Post-Deployment Verification

### API Endpoints Test
```bash
# Test API health
curl https://your-project.vercel.app/api/health

# Test ML model info
curl https://your-project.vercel.app/api/ml/model-info

# Test with sample data
curl -X POST https://your-project.vercel.app/api/ml/classify \
  -H "Content-Type: application/json" \
  -d '{"imageData":"base64_encoded_image"}'
```

### Frontend Verification
- [ ] ML Hub Dashboard: `/ml-hub.html`
  - [ ] All 6 feature cards visible
  - [ ] Image upload works
  - [ ] Classification results display
  - [ ] Statistics update in real-time
  
- [ ] Warehouse Dashboard: `/warehouse-compact.html`
  - [ ] 3D warehouse renders
  - [ ] 70/30 layout displays correctly
  - [ ] Location filters work
  - [ ] Stats sidebar updates

### Browser Compatibility
- [ ] Chrome/Chromium ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓
- [ ] Mobile browsers (if applicable)

### Performance Check
- [ ] Page load time < 3s
- [ ] ML model initialization < 5s
- [ ] API responses < 1s
- [ ] No memory leaks in DevTools
- [ ] No console errors or warnings

## Troubleshooting

### Issue: "Cannot find module" Error
**Solution**: 
- [ ] Run `npm install` locally
- [ ] Delete `node_modules` and `package-lock.json`
- [ ] Run `npm install` again
- [ ] Verify `package.json` has all dependencies
- [ ] Rebuild and redeploy

### Issue: Environment Variables Not Working
**Solution**:
- [ ] Variables must be set in Vercel Dashboard (not .env files)
- [ ] Redeploy after adding variables
- [ ] Check variable names match exactly (case-sensitive)
- [ ] Ensure variables are set for correct environment (Production)

### Issue: Database Connection Error
**Solution**:
- [ ] Verify MongoDB URI is correct
- [ ] Check IP address is whitelisted in MongoDB Atlas
- [ ] Test connection string locally first
- [ ] Ensure DB_CONNECT_STRING is set in Vercel

### Issue: 404 Not Found for HTML Files
**Solution**:
- [ ] Check routes in `vercel.json` are correct
- [ ] Verify file paths in routes match actual file locations
- [ ] Ensure files are in `src/dist/` directory
- [ ] Rebuild and redeploy

### Issue: TensorFlow Models Not Loading
**Solution**:
- [ ] Check browser console for CORS errors
- [ ] Verify CDN links are accessible
- [ ] Ensure `.wasm` files are properly served
- [ ] Check network tab for failed requests
- [ ] Clear browser cache and retry

### Issue: Slow Performance or Timeouts
**Solution**:
- [ ] Check API response times in server logs
- [ ] Verify database queries are optimized
- [ ] Reduce image size before classification
- [ ] Enable caching for static assets
- [ ] Check Vercel analytics for bottlenecks

## Rollback Plan

If deployment fails or issues arise:

### Quick Rollback (Using Vercel Dashboard)
1. Go to **Deployments** tab
2. Find the previous successful deployment
3. Click the deployment
4. Select **Promote to Production**

### Full Rollback
```powershell
# Redeploy with previous commit
vercel --prod --yes
```

## Success Indicators

✅ **Green Checkmarks** on all of these:
- [ ] Vercel deployment shows "Ready"
- [ ] No errors in Vercel Function Logs
- [ ] All API endpoints return 2xx status codes
- [ ] ML models load and initialize successfully
- [ ] Database connection established
- [ ] Frontend assets load without 404s
- [ ] User can access ML Hub dashboard
- [ ] User can view warehouse visualization
- [ ] Image classification processes images
- [ ] No security warnings in browser

## Final Steps

1. **Update DNS** (if using custom domain):
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation (24-48 hours)

2. **Enable Vercel Analytics**:
   - Vercel Dashboard → Settings → Analytics
   - Track page performance and errors

3. **Set Up Monitoring**:
   - Configure alerts in Vercel
   - Monitor API response times
   - Track error rates

4. **Document Changes**:
   - Update README with live URL
   - Document any configuration differences
   - Share deployment URL with team

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Deployment Troubleshooting**: https://vercel.com/docs/platform/deployments
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **TensorFlow.js**: https://www.tensorflow.org/js

---

**Last Updated**: 2024
**Status**: Ready for Production Deployment
**Estimated Deployment Time**: 5-10 minutes

🚀 **You're ready to deploy!** Follow the steps above for a successful production deployment.
