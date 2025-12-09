import express from "express";
import { consultaDocument } from "../controllers/chatController.js";

const router = express.Router();

router.post("/query", consultaDocument);

export default router;
