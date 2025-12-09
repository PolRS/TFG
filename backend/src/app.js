import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import carpetesRoutes from "./routes/home.js"
import documentsRoutes from "./routes/documents.js"
import chatRouter from "./routes/chat.js";
import cookieParser from "cookie-parser";
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser()); 

app.use("/auth", authRoutes);
app.use("/home", requireAuth, carpetesRoutes)
app.use("/carpeta", requireAuth, documentsRoutes)
app.use("/uploads", express.static("uploads"));
app.use("/api/chat", chatRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));