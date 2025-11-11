import express from "express";
import multer from "multer";
import path from "path";
import { llistaDocuments, afegeixDocument, eliminaDocument } from "../controllers/documentsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📁 Configuració de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/documents/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.use(requireAuth);

// Llistar documents d’una carpeta
router.get("/:carpetaId", llistaDocuments);

// Pujar document (accepta fitxer)
router.post("/:carpetaId", upload.single("fitxer"), afegeixDocument);

// Eliminar document
router.delete("/:carpetaId/:documentId", eliminaDocument);

export default router;
