import express from "express";
import { llistaCarpetes, afegeixCarpeta } from "../controllers/carpetaController.js";

const router = express.Router();

router.get("/", llistaCarpetes);
router.post("/", afegeixCarpeta);

export default router;