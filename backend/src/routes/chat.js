import express from "express";
import { getHistory, consultaDocument } from "../controllers/chatController.js";

const router = express.Router();

router.get("/history", getHistory);
router.post("/query", consultaDocument);

export default router;
