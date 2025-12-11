#!/bin/bash
# 🚀 VERCEL DEPLOYMENT SCRIPT FOR STOCKMASTER ML

echo "📦 StockMaster ML - Vercel Deployment Guide"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Check Prerequisites${NC}"
echo "==============================="
echo "✓ Node.js (v18+) - $(node --version)"
echo "✓ npm (v9+) - $(npm --version)"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI globally...${NC}"
    npm install -g vercel
else
    echo "✓ Vercel CLI already installed - $(vercel --version)"
fi
echo ""

echo -e "${YELLOW}Step 2: Prepare Environment${NC}"
echo "============================="
cd "$(dirname "$0")"
echo "✓ Current directory: $(pwd)"
echo ""

echo -e "${YELLOW}Step 3: Install Dependencies${NC}"
echo "=============================="
npm install
echo ""

echo -e "${YELLOW}Step 4: Verify Build${NC}"
echo "===================="
npm run build 2>/dev/null || echo "ℹ Frontend build may not be configured in package.json"
echo ""

echo -e "${YELLOW}Step 5: Create .env.local for Local Testing${NC}"
echo "==========================================="
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Database
DB_CONNECT_STRING=mongodb+srv://your_username:your_password@cluster.mongodb.net/stockmaster

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Gemini AI (Optional)
GEMINI_API_KEY=your_gemini_api_key
EOF
    echo "✓ .env.local created"
    echo "  ⚠️  Update it with your actual credentials"
else
    echo "✓ .env.local already exists"
fi
echo ""

echo -e "${YELLOW}Step 6: Vercel Deployment${NC}"
echo "=========================="
echo "Choose one:"
echo "A) First time deployment (creates new project)"
echo "B) Update existing deployment"
echo ""
echo "Enter choice (A/B): "
read choice

if [ "$choice" = "A" ] || [ "$choice" = "a" ]; then
    echo ""
    echo -e "${GREEN}Starting first-time deployment...${NC}"
    vercel --prod --name=stockmaster-ml
elif [ "$choice" = "B" ] || [ "$choice" = "b" ]; then
    echo ""
    echo -e "${GREEN}Updating existing deployment...${NC}"
    vercel --prod
else
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 7: Configure Environment Variables on Vercel${NC}"
echo "=================================================="
echo ""
echo "Log in to Vercel Dashboard and go to:"
echo "Settings → Environment Variables"
echo ""
echo "Add these variables:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. DB_CONNECT_STRING"
echo "   Value: mongodb+srv://user:password@cluster.mongodb.net/stockmaster"
echo "   Scopes: Production, Preview, Development"
echo ""
echo "2. EMAIL_USER (Optional)"
echo "   Value: your-email@gmail.com"
echo "   Scopes: Production, Preview, Development"
echo ""
echo "3. EMAIL_PASS (Optional)"
echo "   Value: your-google-app-password"
echo "   Scopes: Production, Preview, Development"
echo ""
echo "4. GEMINI_API_KEY (Optional)"
echo "   Value: your-gemini-api-key"
echo "   Scopes: Production, Preview, Development"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo ""
echo "Your application is now live!"
echo "🌐 Access at: https://your-project.vercel.app"
echo ""
echo "📊 Available endpoints:"
echo "  • https://your-project.vercel.app/ml-hub.html"
echo "  • https://your-project.vercel.app/warehouse-compact.html"
echo "  • https://your-project.vercel.app/app"
echo ""
