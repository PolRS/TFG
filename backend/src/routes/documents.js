import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { llistaDocuments, afegeixDocument, eliminaDocument } from "../controllers/documentsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { generarResum, generarDiagrama, getResultats, eliminaResultat, getDocument, generarTest, generarInforme } from "../controllers/documentsController.js";

const router = express.Router();


// Ruta absoluta correcta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, "..", "uploads", "documents");

// Crear carpeta si no existeix
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("Carpeta creada:", uploadPath);
}

console.log("Multer desarà fitxers a:", uploadPath);

// Multer configuració
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
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

// Generar Resum
router.post("/:carpetaId/resum", generarResum);
// Generar Diagrama
router.post("/:carpetaId/diagrama", generarDiagrama);
// Generar Test
router.post("/:carpetaId/test", generarTest);
// Generar Informe
router.post("/:carpetaId/informe", generarInforme);

// Obtenir Resultats Guardats
router.get("/:carpetaId/resultats", getResultats);

// Eliminar Resultat
router.delete("/:carpetaId/resultats/:resultatId", eliminaResultat);

// Obtenir contingut un document
router.get("/:carpetaId/:documentId", getDocument);

export default router;
