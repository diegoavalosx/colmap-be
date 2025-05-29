import app from "./app";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import express from "express";

const { onRequest } = functions.https;

if (!admin.apps.length) {
  admin.initializeApp();
}

const sendContactApp = express();

sendContactApp.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  next();
});

sendContactApp.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

sendContactApp.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("Missing fields");
  }

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: "oohyeahmedia@protonmail.com",
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending mail:", error);
    return res.status(500).send("Failed to send email");
  }
});

export const sendContactEmail = onRequest(
  {
    secrets: ["EMAIL_USER", "EMAIL_PASS"],
    region: "us-central1",
  },
  sendContactApp
);

exports.app = functions.https.onRequest(app);

exports.createUser = functions.https.onCall(async (request) => {
  const { email, password, displayName } = request.data;

  if (!email || !password || !displayName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email, password, and displayName are required."
    );
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    const userDoc = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: displayName,
      role: "user",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: userRecord.emailVerified,
    };

    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set(userDoc);

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new functions.https.HttpsError("internal", "Failed to create user.");
  }
});

exports.syncUserDeletionFromFirestore = functions.firestore.onDocumentDeleted(
  "users/{uid}",
  async (event) => {
    const uid = event.params.uid;

    if (!uid) {
      console.error("No UID found in event params");
      return;
    }

    try {
      await admin.auth().deleteUser(uid);
      console.log(`Successfully deleted user with UID: ${uid}`);
    } catch (error) {
      console.error("Error deleting user from Firebase Authentication:", error);
    }
  }
);
