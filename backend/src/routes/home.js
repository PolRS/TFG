import express from "express";
import { llistaCarpetes, afegeixCarpeta, eliminaCarpeta } from "../controllers/carpetaController.js";

const router = express.Router();

router.get("/", llistaCarpetes);
router.post("/", afegeixCarpeta);
router.delete("/:carpetaId", eliminaCarpeta);


export default router;