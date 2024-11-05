import express from "express";
import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import cors from "cors";
import helmet from "helmet";
import * as functions from "firebase-functions";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Use Helmet to set various HTTP headers for security
app.use(helmet());

// Enable CORS to allow cross-origin requests
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your front-end app's URL
    methods: ["GET", "POST"], // Specify allowed HTTP methods if needed
    credentials: true, // If you need to support credentials (cookies, etc.)
  })
);

// Middleware to parse JSON
app.use(express.json());

// Route to handle API key protection (example route)
app.get("/api/firebase-config", (req, res) => {
  if (process.env.CUSTOM_API_KEY) {
    res.status(200).json({
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      appId: process.env.VITE_FIREBASE_APP_ID,
    });
  } else {
    res.status(500).json({ message: "API key not found" });
  }
});

app.get("/api/google-maps-config", (req, res) => {
  if (process.env.CUSTOM_API_KEY) {
    res.status(200).json({
      apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY,
    });
  } else {
    res.status(500).json({ message: "API key not found" });
  }
});

// Export the app for Firebase Functions
exports.app = functions.https.onRequest(app);
