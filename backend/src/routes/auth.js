import express from "express";
import { redirectToGoogle, googleCallback } from "../controllers/authController.js";

const router = express.Router();
router.get("/google", redirectToGoogle);
router.get("/google/callback", googleCallback);

export default router;