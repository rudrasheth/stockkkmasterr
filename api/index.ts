import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());

const saltRounds = 10; 

// --- DATABASE CONNECTION & MODELS ---

// Use the environment variable key established during troubleshooting
const DB_CONNECT_STRING = process.env.DB_CONNECT_STRING; 

if (DB_CONNECT_STRING) {
    // Initiate the connection. Mongoose buffers operations until successful.
    mongoose.connect(DB_CONNECT_STRING)
      .then(() => console.log("✅ MongoDB Connection Initiated"))
      .catch(err => console.error("❌ MongoDB Error on initial connect:", err));

    // Listen for connection errors
    mongoose.connection.on('error', err => {
        console.error('❌ Mongoose runtime connection error:', err);
    });
} else {
    console.error("❌ DB_CONNECT_STRING is not defined. FATAL!");
}


// Schemas 
const UserSchema = new mongoose.Schema({ name: String, email: { type: String, required: true, unique: true }, password: String, role: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const ProductSchema = new mongoose.Schema({ name: String, category: String, price: Number, stock: { type: Number, default: 0 }, unit: String, reorderPoint: { type: Number, default: 10 } });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', new mongoose.Schema({ name: String, email: String, phone: String, address: String }));
const Location = mongoose.models.Location || mongoose.model('Location', new mongoose.Schema({ name: String, type: String, capacity: String }));
const Receipt = mongoose.models.Receipt || mongoose.models.Receipt || mongoose.model('Receipt', new mongoose.Schema({ receiptNo: String, vendorId: String, date: { type: Date, default: Date.now }, status: { type: String, default: 'Done' }, items: [{ productId: String, quantity: Number, cost: Number }] }));
const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', new mongoose.Schema({ deliveryNo: String, customer: String, date: { type: Date, default: Date.now }, status: { type: String, default: 'Done' }, items: [{ productId: String, quantity: Number }] }));
const Transfer = mongoose.models.Transfer || mongoose.model('Transfer', new mongoose.Schema({ reference: String, fromLocation: String, toLocation: String, date: { type: Date, default: Date.now }, status: { type: String, default: 'Done' } }));


// --- CONFIGURATIONS ---
// Ensure EMAIL_USER and EMAIL_PASS are set correctly in your environment for Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER || 'stockmaster577@gmail.com', 
    pass: process.env.EMAIL_PASS || 'obuauvyjlerywxke' 
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDuat8vTYX9BsD4QEvspwy8R-idSsW9-6o");


// --- API ROUTES ---

app.get('/', (req, res) => { res.json({ status: "StockMaster Backend is Live & Connected!" }); });

// 1. SIGNUP 
app.post('/api/signup', async (req, res) => {
   const { name, email, password, role } = req.body;
   try {
       const existing = await User.findOne({ email });
       if (existing) return res.status(400).json({ message: "User already exists" });

       const hashedPassword = await bcrypt.hash(password, saltRounds);

       await User.create({ name, email, password: hashedPassword, role });
       res.status(201).json({ message: "User Created" });
   } catch (e) { 
        console.error("Signup error:", e);
        res.status(500).json({ message: "Error creating user" }); 
    }
});

// 2. LOGIN 
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });

      if (user && user.password && await bcrypt.compare(password, user.password)) {
          const token = `t-${user._id}`;
          
          res.json({ message: "Login OK", token: token, user }); 
      } else {
          res.status(401).json({ message: "Invalid credentials" });
      }
  } catch (e) { 
    console.error("Login error:", e);
    res.status(500).json({ message: "Login failed due to server error" }); 
  }
});

// 3. FORGOT PASSWORD (Fixed OTP logic)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    
    const mailInfo = await transporter.sendMail({
      from: '"StockMaster" <no-reply@stockmaster.com>',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is: ${otp}`
    });
    
    console.log("Email sent successfully. Message ID:", mailInfo.messageId);

    res.json({ message: "OTP sent successfully.", debugOtp: otp });
} catch (e) { 
    console.error("NODEMAILER ERROR:", e); 
    
    // Check for authentication failure
    if (e && typeof e === 'object' && 'code' in e && e.code === 'EAUTH') {
        return res.status(500).json({ message: "Email service authentication failed. Check EMAIL_USER/PASS." });
    }
    
    // Final generic server error return
    return res.status(500).json({ message: "Failed to send OTP due to server error." }); 
}
});

app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await User.updateOne({ email }, { password: hashedPassword });
        res.json({ message: "Password updated" });
    } catch (e) { res.status(500).json({ message: "Update failed" }); }
});

// CORE DATA & OPERATIONS

app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/products', async (req, res) => {
  try { res.status(201).json(await Product.create({ ...req.body, stock: Number(req.body.initialStock) || 0 })); } catch (e) { res.status(500).json({ message: "Error" }); }
});

app.get('/api/vendors', async (req, res) => res.json(await Vendor.find()));
app.post('/api/vendors', async (req, res) => res.status(201).json(await Vendor.create(req.body)));

app.get('/api/locations', async (req, res) => res.json(await Location.find()));
app.post('/api/locations', async (req, res) => res.status(201).json(await Location.create(req.body)));

// RECEIPTS (Increases Stock)
app.get('/api/receipts', async (req, res) => res.json(await Receipt.find()));
app.post('/api/receipts', async (req, res) => {
    try {
        const receipt = await Receipt.create(req.body);
        if (req.body.items && req.body.items.length > 0) {
            for (const item of req.body.items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: Number(item.quantity) } });
            }
        }
        res.status(201).json(receipt);
    } catch (e) { res.status(500).json({ message: "Error" }); }
});

// DELIVERIES (Decreases Stock)
app.get('/api/deliveries', async (req, res) => res.json(await Delivery.find()));
app.post('/api/deliveries', async (req, res) => {
    try {
        const delivery = await Delivery.create(req.body);
        if (req.body.items && req.body.items.length > 0) {
            for (const item of req.body.items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -Number(item.quantity) } });
            }
        }
        res.status(201).json(delivery);
    } catch (e) { res.status(500).json({ message: "Error" }); }
});

// Transfers, Dashboard & AI
app.get('/api/transfers', async (req, res) => res.json(await Transfer.find()));
app.post('/api/transfers', async (req, res) => res.status(201).json(await Transfer.create(req.body)));

// Dashboard Stats (Used by DashboardPage.tsx)
app.get('/api/dashboard-stats', async (req, res) => {
   try {
       const products = await Product.find();
       const receiptsCount = await Receipt.countDocuments();
       const deliveriesCount = await Delivery.countDocuments();
       const transfersCount = await Transfer.countDocuments();

       res.json({ 
           totalProducts: products.length, 
           lowStock: products.filter(p => (p.stock || 0) <= (p.reorderPoint || 10) && (p.stock || 0) > 0).length, 
           outOfStock: products.filter(p => (p.stock || 0) === 0).length,
           pendingReceipts: receiptsCount, 
           pendingDeliveries: deliveriesCount, 
           scheduledTransfers: transfersCount 
       });
   } catch (e) { res.json({ totalProducts: 0 }); }
});

// AI CHATBOT (Used by DashboardPage.tsx AI Card)
app.post('/api/chat', async (req, res) => {
   const { message } = req.body;
   try {
       // Fetch current product data
       const products = await Product.find().select('name stock reorderPoint');
       const productList = products.map(p => 
           `Name: ${p.name}, Stock: ${p.stock}, Reorder: ${p.reorderPoint}`
       ).join('; ');

        // Clean: Define the model instance 
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash"
        });
       
       const prompt = `You are StockBot, an expert inventory and supply chain analyst for StockMaster. 
You must analyze the user's request based on the CURRENT INVENTORY DATA provided below. 
If the user asks about stock, identify critical shortages (stock <= reorder point). 
If the user asks for a summary, provide actionable steps (e.g., "Recommend ordering more Steel Rods"). 
Be concise and professional.

CURRENT INVENTORY DATA: [${productList}]
USER QUERY: ${message}`;
       
       const result = await model.generateContent(prompt);
       res.json({ reply: await result.response.text() });

   } catch (e) { res.status(500).json({ reply: "AI Error: Could not process request." }); }
});

// Recent Activity (Used by DashboardPage.tsx Live Activity/Heatmap)
app.get('/api/recent-activity', async (req, res) => {
    try {
        const deliveries = await Delivery.find()
            .sort({ date: -1 })
            .limit(10)
            .select('deliveryNo date items');

        const receipts = await Receipt.find()
            .sort({ date: -1 })
            .limit(10)
            .select('receiptNo date items');

        // Combine and sort by date to get the true latest activity
        const combinedActivity = [
            ...deliveries.map(d => ({ 
                type: 'Delivery', 
                ref: d.deliveryNo, 
                date: d.date, 
                items: d.items 
            })),
            ...receipts.map(r => ({ 
                type: 'Receipt', 
                ref: r.receiptNo, 
                date: r.date, 
                items: r.items 
            })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime())
         .slice(0, 10); 

        // Placeholder/Sample Heatmap data for the frontend component
        const heatmapData = [
            { location: 'Zone A', movement: 85, status: 'Hot' },
            { location: 'Zone B', movement: 40, status: 'Normal' },
            { location: 'Zone C', movement: 10, status: 'Cold' },
        ];
        
        res.json({ activity: combinedActivity, heatmap: heatmapData });

    } catch (e) {
        console.error("Recent Activity error:", e);
        res.status(500).json({ message: "Failed to fetch activity data." });
    }
});


export default app;