import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

dotenv.config();

const googleMapsApiKey = process.env.GOOGLEMAPS_API_KEY;
const firebaseApiKey = process.env.API_KEY;
const firebaseAppId = process.env.APP_ID;
const customApiKey = process.env.CUSTOM_API_KEY;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/firebase-config", (req, res) => {
  if (customApiKey) {
    res.status(200).json({
      apiKey: firebaseApiKey,
      appId: firebaseAppId,
    });
  } else {
    res.status(500).json({ message: "API key not found" });
  }
});

app.get("/api/google-maps-config", (req, res) => {
  if (customApiKey) {
    res.status(200).json({
      apiKey: googleMapsApiKey,
    });
  } else {
    res.status(500).json({ message: "API key not found" });
  }
});

export default app;
