import express from "express";
import { redirectToGoogle, handleGoogleCallback } from "../controllers/authController.js";

const router = express.Router();

router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback);

export default router;