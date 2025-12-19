# 🚀 StockMaster - AI-Powered Inventory Management System

A full-stack inventory management application with advanced ML capabilities, real-time analytics, and intelligent automation.

## 🌐 Live Demo
**[https://stockmaster-live.vercel.app](https://stockmaster-live.vercel.app)**

## 📋 Features

### 🤖 AI & Machine Learning
- **Image Classification**: Gemini Vision API for product identification
- **Stock Prediction**: 30-day ML-powered demand forecasting
- **Anomaly Detection**: Automated inventory issue scanning
- **Batch Processing**: Process multiple product images simultaneously
- **Smart Chatbot**: AI assistant with real-time inventory insights

### 📊 Analytics & Reporting
- **Real-time Dashboard**: Live inventory tracking and metrics
- **ABC Analysis**: Product value classification
- **Stock Health Monitoring**: Visual health indicators
- **Movement Analytics**: Inbound/outbound tracking
- **CSV Export**: Comprehensive data export capabilities

### 🗺️ Location Management
- **Interactive Maps**: Leaflet-powered warehouse visualization
- **Multi-location Support**: Mumbai, New York, Dubai locations
- **Real-time Tracking**: Live stock levels per location

### 💼 Core Features
- **Product Management**: Full CRUD operations
- **Vendor Management**: Supplier tracking and management
- **Receipt & Delivery Tracking**: Complete transaction history
- **Transfer Management**: Inter-location stock transfers
- **Payment Integration**: Razorpay payment gateway (demo + production)

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for data visualization
- Leaflet for interactive maps
- Three.js for 3D warehouse visualization

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB (with Mongoose ODM)
- Google Generative AI (Gemini 1.5 Flash)

### Deployment
- Vercel (Serverless Functions)
- GitHub for version control

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/rudrasheth/stockkkmasterr.git

# Navigate to project directory
cd stockkkmasterr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your MongoDB URI and API keys

# Run development server
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file with:

```env
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key (optional)
RAZORPAY_KEY_SECRET=your_razorpay_secret (optional)
```

## 🚀 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### ML & Analytics
- `POST /api/ml/classify` - Image classification
- `POST /api/ml/batch-classify` - Batch image processing
- `GET /api/ml/forecast` - Demand forecasting
- `POST /api/ml/predict-stock` - 30-day stock prediction
- `GET /api/ml/detect-anomalies` - Anomaly detection
- `GET /api/ml/abc-analysis` - ABC inventory analysis
- `GET /api/analytics/stock-health` - Stock health metrics
- `GET /api/analytics/categories` - Category performance
- `GET /api/export/analytics-csv` - Export CSV report

### Chat
- `POST /api/chat` - AI chatbot queries

## 📱 Pages

- `/` - Login page
- `/app` - Main dashboard
- `/ml-hub` - ML Intelligence Hub
- `/warehouse3d` - 3D warehouse visualization
- `/locations-map` - Interactive location map

## 🎓 Project Highlights (For Resume)

- **Full-stack Development**: MERN stack with TypeScript
- **AI/ML Integration**: Google Gemini API for computer vision
- **Real-time Analytics**: Live dashboards and predictions
- **Scalable Architecture**: Serverless deployment on Vercel
- **Database Design**: MongoDB with optimized schemas
- **RESTful API**: Clean, documented API design
- **Responsive UI**: Mobile-friendly interface
- **Advanced Features**: Batch processing, anomaly detection, forecasting

## 📊 Features Showcase

### ML Hub Capabilities
1. **Product Image Classification** - Identify products from images
2. **Demand Forecasting** - 7-day prediction with action recommendations
3. **ABC Analysis** - Classify inventory by value
4. **Stock Prediction** - 30-day forecast with trend analysis
5. **Anomaly Detection** - Automated issue identification
6. **Batch Processing** - Handle 5+ images at once
7. **Warehouse Detection** - Multi-object recognition
8. **Smart Recommendations** - AI-driven optimization

### Analytics Dashboard
- Stock health distribution (Doughnut chart)
- Inventory movement trends (Bar chart)
- Top products by value
- Category performance analysis
- Real-time metrics

## 🔧 Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

**Rudra Sheth**
- GitHub: [@rudrasheth](https://github.com/rudrasheth)
- Project: [StockMaster](https://stockmaster-live.vercel.app)

## 🙏 Acknowledgments

- Google Generative AI for ML capabilities
- MongoDB for database services
- Vercel for hosting
- Leaflet for mapping solutions
