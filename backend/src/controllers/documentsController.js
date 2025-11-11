import * as documentsService from "../services/documentsService.js";
import fs from "fs";

export async function llistaDocuments(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId } = req.params;

    const documents = await documentsService.getDocumentsByCarpeta(userId, carpetaId);
    res.json({ documents });
  } catch (err) {
    console.error("❌ Error recuperant documents:", err);
    res.status(500).json({ error: "Error recuperant documents" });
  }
}

export async function afegeixDocument(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Cal pujar un fitxer" });
    }

    const nom = req.file.originalname;
    const tipus = req.file.mimetype;
    const pathFitxer = req.file.path;

    const document = await documentsService.creaDocument(userId, carpetaId, nom, tipus, pathFitxer);
    res.status(201).json({ document });
  } catch (err) {
    console.error("❌ Error pujant document:", err);
    res.status(500).json({ error: "Error pujant document" });
  }
}

export async function eliminaDocument(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId, documentId } = req.params;

    const deleted = await documentsService.eliminaDocument(userId, carpetaId, documentId);

    if (!deleted) return res.status(404).json({ error: "Document no trobat" });

    // Esborrem el fitxer físic
    if (deleted.path_fitxer) {
      fs.unlink(deleted.path_fitxer, err => {
        if (err) console.warn("⚠️ No s'ha pogut eliminar el fitxer:", err);
      });
    }

    res.json({ missatge: "Document eliminat correctament" });
  } catch (err) {
    console.error("❌ Error eliminant document:", err);
    res.status(500).json({ error: "Error eliminant document" });
  }
}
