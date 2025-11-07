import express from "express";
import { 
    redirectToGoogle, 
    handleGoogleCallback,
    verifyToken
 } from "../controllers/authController.js";

const router = express.Router();

router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback);
router.get("/verify", verifyToken)

export default router;