import * as documentsService from "../services/documentsService.js";
import * as llmService from "../services/llmService.js";
import fs from "fs";

export async function llistaDocuments(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId } = req.params;

    const documents = await documentsService.getDocumentsByCarpeta(userId, carpetaId);
    res.json({ documents });
  } catch (err) {
    console.error("Error recuperant documents:", err);
    res.status(500).json({ error: "Error recuperant documents" });
  }
}

export async function afegeixDocument(req, res) {
  try {
    const { carpetaId } = req.params;

    if (!carpetaId) {
      return res.status(400).json({ error: "carpetaId requerit" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Cap fitxer rebut" });
    }

    const document = await documentsService.creaDocument(carpetaId, req.file);

    res.status(201).json({ document });

  } catch (err) {
    console.error("Error pujant document:", err);
    res.status(500).json({ error: "Error pujant document" });
  }
}

export async function eliminaDocument(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId, documentId } = req.params;

    const deleted = await documentsService.eliminaDocument(userId, carpetaId, documentId);

    if (!deleted) return res.status(404).json({ error: "Document no trobat" });

    /*// Esborrem el fitxer físic
    if (deleted.path_fitxer) {
      fs.unlink(deleted.path_fitxer, err => {
        if (err) 
          console.warn("No s'ha pogut eliminar el fitxer:", err);
      });
    }*/

    res.json({ missatge: "Document eliminat correctament" });
  } catch (err) {
    console.error("Error eliminant document:", err);
    res.status(500).json({ error: "Error eliminant document" });
  }
}

export async function generarResum(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId } = req.params; // Ensure to pass carpetaId in route
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: "No s'han proporcionat documents." });
    }

    // 1. Recuperar contingut
    const documents = await documentsService.getContentFromDocuments(userId, documentIds);

    if (documents.length === 0) {
      return res.status(404).json({ error: "No s'han trobat els documents o no tens permís." });
    }

    // 2. Generar resum amb LLM
    const resum = await llmService.generateSummary(documents);

    // 3. Guardar a la DB
    const savedResult = await documentsService.saveResult(carpetaId, 'resum', resum);

    // 4. Retornar resultat
    res.json({ result: savedResult });

  } catch (err) {
    console.error("Error generant resum:", err);
    res.status(500).json({ error: "Error generant el resum." });
  }
}

export async function generarDiagrama(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId } = req.params;
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: "No s'han proporcionat documents." });
    }

    const documents = await documentsService.getContentFromDocuments(userId, documentIds);

    if (documents.length === 0) {
      return res.status(404).json({ error: "No s'han trobat els documents." });
    }

    let diagrama = await llmService.generateDiagram(documents);
    diagrama = diagrama.replace(/```mermaid/g, "").replace(/```/g, "").trim();

    // Guardar a la DB
    const savedResult = await documentsService.saveResult(carpetaId, 'diagrama', diagrama);

    res.json({ result: savedResult });

  } catch (err) {
    console.error("Error generant diagrama:", err);
    res.status(500).json({ error: "Error generant el diagrama." });
  }
}

export async function getResultats(req, res) {
  try {
    const { carpetaId } = req.params;
    const results = await documentsService.getResultsByCarpeta(carpetaId);
    res.json({ results });
  } catch (err) {
    console.error("Error recuperant resultats:", err);
    res.status(500).json({ error: "Error recuperant resultats" });
  }
}

export async function eliminaResultat(req, res) {
  try {
    const { resultatId } = req.params;
    const deleted = await documentsService.deleteResult(resultatId);

    if (!deleted) {
      return res.status(404).json({ error: "Resultat no trobat" });
    }

    res.json({ message: "Eliminat correctament" });
  } catch (err) {
    console.error("Error eliminant resultat:", err);
    res.status(500).json({ error: "Error eliminant resultat" });
  }
}

export async function getDocument(req, res) {
  try {
    const { carpetaId, documentId } = req.params;
    const document = await documentsService.getDocumentInCarpeta(carpetaId, documentId);

    if (!document) {
      return res.status(404).json({ error: "Document no trobat" });
    }

    // Opcional: Si el content_text és molt gran, potser no cal enviar-lo sempre, 
    // però aquí és justament el que volem.
    res.json({ document });
  } catch (err) {
    console.error("Error recuperant document:", err);
    res.status(500).json({ error: "Error recuperant document" });
  }
}

export async function generarTest(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId } = req.params;
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: "No s'han proporcionat documents." });
    }

    const documents = await documentsService.getContentFromDocuments(userId, documentIds);
    if (documents.length === 0) {
      return res.status(404).json({ error: "No s'han trobat els documents." });
    }

    // Generar JSON del test
    const testJson = await llmService.generateTest(documents);

    // Guardar a la DB (tipus='test')
    const savedResult = await documentsService.saveResult(carpetaId, 'test', testJson);

    res.json({ result: savedResult });
  } catch (err) {
    console.error("Error generant test:", err);
    res.status(500).json({ error: "Error generant el test." });
  }
}
