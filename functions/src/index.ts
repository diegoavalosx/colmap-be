import app from "./app";
import * as functions from "firebase-functions";
exports.app = functions.https.onRequest(app);
