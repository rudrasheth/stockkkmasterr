@echo off
REM 🚀 VERCEL DEPLOYMENT SCRIPT FOR STOCKMASTER ML (Windows)

setlocal enabledelayedexpansion

cls
echo.
echo 📦 StockMaster ML - Vercel Deployment (Windows)
echo ===============================================
echo.

REM Step 1: Check prerequisites
echo [STEP 1] Checking Prerequisites
echo ================================
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js v18+
    pause
    exit /b 1
)
echo ✓ Node.js: & node --version

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found. Please install npm v9+
    pause
    exit /b 1
)
echo ✓ npm: & npm --version
echo.

REM Step 2: Check Vercel CLI
echo [STEP 2] Checking Vercel CLI
echo ============================
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Vercel CLI not found. Installing globally...
    call npm install -g vercel
    echo ✓ Vercel CLI installed
) else (
    echo ✓ Vercel CLI: & vercel --version
)
echo.

REM Step 3: Prepare directory
echo [STEP 3] Preparing Environment
echo ==============================
cd /d "%~dp0"
echo ✓ Working directory: %CD%
echo.

REM Step 4: Install dependencies
echo [STEP 4] Installing Dependencies
echo ================================
call npm install
echo ✓ Dependencies installed
echo.

REM Step 5: Create .env.local if it doesn't exist
echo [STEP 5] Setting Up Environment File
echo ==================================
if not exist ".env.local" (
    (
        echo # Database Configuration
        echo DB_CONNECT_STRING=mongodb+srv://your_username:your_password@cluster.mongodb.net/stockmaster
        echo.
        echo # Email Configuration ^(Optional^)
        echo EMAIL_USER=your_email@gmail.com
        echo EMAIL_PASS=your_app_password
        echo.
        echo # Gemini AI Configuration ^(Optional^)
        echo GEMINI_API_KEY=your_gemini_api_key
    ) > .env.local
    echo ✓ .env.local created
    echo ⚠️  Update it with your actual credentials
) else (
    echo ✓ .env.local already exists
)
echo.

REM Step 6: Deploy to Vercel
echo [STEP 6] Starting Vercel Deployment
echo ===================================
echo.
echo Choose deployment type:
echo A - First time deployment ^(creates new Vercel project^)
echo B - Update existing deployment
echo.
set /p choice="Enter choice (A/B): "

if /i "%choice%"=="A" (
    echo.
    echo 🚀 Starting first-time deployment...
    echo.
    call vercel --prod --name=stockmaster-ml
) else if /i "%choice%"=="B" (
    echo.
    echo 🚀 Updating existing deployment...
    echo.
    call vercel --prod
) else (
    echo ❌ Invalid choice. Exiting.
    pause
    exit /b 1
)
echo.

REM Step 7: Deployment complete
echo [STEP 7] Deployment Successful!
echo ===============================
echo.
echo ✅ Your application has been deployed to Vercel!
echo.
echo 🔧 Next Steps:
echo ===============
echo 1. Log in to Vercel Dashboard: https://vercel.com/dashboard
echo 2. Go to your project settings
echo 3. Navigate to: Settings → Environment Variables
echo 4. Add the following variables with values from step 5:
echo.
echo    • DB_CONNECT_STRING
echo      MongoDB connection string
echo.
echo    • EMAIL_USER (Optional)
echo      Gmail address for sending emails
echo.
echo    • EMAIL_PASS (Optional)
echo      Gmail App Password
echo.
echo    • GEMINI_API_KEY (Optional)
echo      Google Generative AI API key
echo.
echo 5. Re-deploy to apply environment variables:
echo    In Vercel dashboard, click "Redeploy"
echo.
echo 🌐 Access Your Application:
echo ============================
echo • Main App: https://your-project.vercel.app/app
echo • ML Hub: https://your-project.vercel.app/ml-hub.html
echo • Warehouse: https://your-project.vercel.app/warehouse-compact.html
echo • API Health: https://your-project.vercel.app/api/health
echo.
echo 📊 Useful Links:
echo =================
echo • Vercel Dashboard: https://vercel.com/dashboard
echo • Project Analytics: https://vercel.com/dashboard/[project-name]
echo • Logs: Vercel Dashboard → Function Logs
echo • Deployments: Vercel Dashboard → Deployments
echo.
echo 📚 Documentation:
echo ==================
echo • ML Features: Read ML_FEATURES.md
echo • Quick Start: Read QUICK_START_ML.md
echo • Troubleshooting: See DEPLOYMENT_CHECKLIST.md
echo.

pause
echo Done!
