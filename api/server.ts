// --- server.ts (The application ENTRY POINT) ---

// NOTE: Ensure your tsconfig.json is set to NodeNext/ESM 
// and the import path matches your index file location.
import app from './index.js'; 
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_CONNECT_STRING = process.env.DB_CONNECT_STRING;

/**
 * Waits for the Mongoose connection to open before starting the HTTP server.
 */
function startServer() {
    // Check if the connection is already established 
    if (mongoose.connection.readyState === 1) {
        console.log("✅ MongoDB already connected. Starting Express Server...");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        return;
    }

    // Wait for the connection to open
    mongoose.connection.once('open', () => {
        console.log("✅ MongoDB connection successful. Starting Express Server...");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });

    // Handle connection failures
    mongoose.connection.on('error', (err) => {
        console.error("❌ Mongoose fatal connection error after connect attempt:", err);
        process.exit(1);
    });
}

// Start the process
if (DB_CONNECT_STRING) {
    startServer();
} else {
    console.error("❌ DB_CONNECT_STRING environment variable is missing. Cannot start server.");
    process.exit(1);
}