import express from "express";
import { 
    redirectToGoogle, 
    handleGoogleCallback,
    verifyToken,
    getUser,
    logout
 } from "../controllers/authController.js";

const router = express.Router();

router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback); // 👈 POST
router.get("/verify", verifyToken)
router.get("/user", getUser); 
router.post("/logout", logout);

export default router;