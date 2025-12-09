// backend/src/controllers/chatController.js
import { callLLM } from "../services/llmService.js";
import { getDocumentById } from "../services/documentsService.js";

export async function consultaDocument(req, res) {
  try {
    // Si encara no tens auth muntada, pots comentar aquestes dues línies
    // const userId = req.user?.id;
    // if (!userId) return res.status(401).json({ error: "Usuari no autenticat" });

    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res
        .status(400)
        .json({ error: "documentId i message són obligatoris" });
    }

    // 1) Recuperar document
    const doc = await getDocumentById(documentId);
    if (!doc) {
      return res.status(404).json({ error: "Document no trobat" });
    }

    if (!doc.content_text || !doc.content_text.trim()) {
      return res
        .status(400)
        .json({ error: "Aquest document no té text associat (content_text buit)" });
    }

    // 2) Limitar longitud del text
    const MAX_LENGTH = 8000; // ajustable
    const truncatedText = doc.content_text.slice(0, MAX_LENGTH);

    // 3) Construir prompt
    const prompt = `
T'he proporcionat el contingut d'un document. Respon ÚNICAMENT basant-te en aquest document.

NOM DEL DOCUMENT: ${doc.nom}

DOCUMENT:
"""
${truncatedText}
"""

PREGUNTA:
"${message}"

Respon de forma clara i concisa, en el mateix idioma que la pregunta.
    `.trim();

    // 4) Cridar Mistral (mistral-small-latest)
    const answer = await callLLM(prompt);

    // 5) Retornar la resposta
    return res.json({
      answer,
      document: {
        id: doc.id,
        nom: doc.nom,
        tipus: doc.tipus,
        mida: doc.mida,
        path: doc.path,
        data_pujada: doc.data_pujada,
      },
    });
  } catch (err) {
    console.error("Error a consultaDocument:", err);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
}
