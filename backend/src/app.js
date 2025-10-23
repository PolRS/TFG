import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import carpetesRoutes from "./routes/carpetes.js"
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/home", requireAuth, carpetesRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));