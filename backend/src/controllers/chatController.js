// backend/src/controllers/chatController.js
import { callLLM } from "../services/llmService.js";
import { getDocumentById } from "../services/documentsService.js";
import { getMessagesByCarpeta, addMessage } from "../services/chatServices.js";
import { getDocumentInCarpeta } from "../services/documentsService.js";
import { searchSimilarContext } from "../services/ragService.js";

export async function getHistory(req, res) {
  try {
    const { carpetaId } = req.query;

    if (!carpetaId) {
      return res.status(400).json({ error: "carpetaId és obligatori" });
    }

    const messages = await getMessagesByCarpeta(carpetaId, 200);
    return res.json({ messages });
  } catch (err) {
    console.error("Error a getHistory:", err);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
}

export async function consultaDocument(req, res) {
  try {
    const { carpetaId, documentId, message } = req.body;

    if (!carpetaId || !documentId || !message) {
      return res
        .status(400)
        .json({ error: "carpetaId, documentId i message són obligatoris" });
    }

    // 1) Agafar document però assegurant que és dins la carpeta
    const doc = await getDocumentInCarpeta(carpetaId, documentId);
    if (!doc) {
      return res.status(404).json({ error: "Document no trobat dins la carpeta" });
    }

    if (!doc.content_text?.trim()) {
      return res.status(400).json({ error: "Aquest document no té text associat" });
    }

    // 2) Buscar context rellevant (RAG)
    let context = "";

    // Si tenim text, busquem vectors semblants
    const similarChunks = await searchSimilarContext(message, 3);

    // Filtrar només chunks d'aquest document concret
    // Nota: en una implementació real podríem buscar en TOTS els documents de la carpeta,
    // però aquí mantenim la lògica de "xat amb un document" si documentId ve informat.
    const relevantChunks = similarChunks.filter(c => c.document_id === doc.id);

    if (relevantChunks.length > 0) {
      context = relevantChunks.map(c => c.content_chunk).join("\n\n---\n\n");
    } else {
      // Fallback: si no hi ha chunks (doc antic buit?), agafem primers 4000 chars
      context = doc.content_text ? doc.content_text.slice(0, 4000) : "";
    }

    const prompt = `
DOCUMENT: ${doc.nom}

PREGUNTA:
"${message}"

Respon de forma clara i concisa.
    `.trim();

    // 3) Cridar LLM
    // 3) Cridar LLM amb context RAG
    const answer = await callLLM(prompt, context);

    // 4) Guardar historial per carpeta
    await addMessage({
      carpetaId,
      role: "user",
      content: message,
      sources: [] // missatge usuari no té fonts
    });

    // 5) Fonts: en aquesta fase, la font és el document seleccionat
    const sources = [{ documentId: doc.id, nom: doc.nom }];

    const assistantMsg = await addMessage({
      carpetaId,
      role: "assistant",
      content: answer,
      sources
    });

    return res.json({
      answer,
      sources: assistantMsg.sources
    });
  } catch (err) {
    console.error("Error a consultaDocument:", err);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
}
