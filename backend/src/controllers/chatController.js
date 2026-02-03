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
    const { carpetaId, documentId, documentIds, message } = req.body;

    if (!carpetaId || (!documentId && (!documentIds || documentIds.length === 0)) || !message) {
      return res
        .status(400)
        .json({ error: "carpetaId, documentIds (o documentId) i message són obligatoris" });
    }

    // Normalize documentIds to an array
    let targetDocIds = [];
    if (documentIds && Array.isArray(documentIds)) {
      targetDocIds = documentIds;
    } else if (documentId) {
      targetDocIds = [documentId];
    }

    // 1) Validar documents i agafar informació bàsica
    // Necessitem assegurar que TOTS els documents pertanyen a la carpeta
    // Podem fer un bucle o una query 'IN'. Farem bucle per reutilitzar getDocumentInCarpeta
    // o millor, fer queries per separat per assegurar.

    const validDocs = [];
    for (const id of targetDocIds) {
      const doc = await getDocumentInCarpeta(carpetaId, id);
      if (doc) {
        validDocs.push(doc);
      }
    }

    if (validDocs.length === 0) {
      return res.status(404).json({ error: "Cap document trobat dins la carpeta" });
    }

    // 2) Buscar context rellevant (RAG) filtrant pels documents seleccionats
    const validDocIds = validDocs.map(d => d.id);

    // INTENT DETECTION
    const msgLower = message.toLowerCase();
    const isSummary = /resum|summary|de què va|explica'm|explica|resumen/.test(msgLower);
    const isReport = /informe|report/.test(msgLower);
    const isTest = /test|examen|preguntes|preguntas/.test(msgLower);
    const isDiagram = /diagrama|esquema|mermaid|mapa mental/.test(msgLower);

    let answer = "";
    let sources = [];
    let similarChunks = [];

    if (isSummary || isReport || isTest || isDiagram) {
      // Use full text (limited) for specialized intents
      const docsWithText = validDocs.filter(d => d.content_text);
      if (docsWithText.length > 0) {
        if (isSummary) {
          answer = await callLLM("Genera un resum complet dels documents.", docsWithText.map(d => `--- ${d.nom} ---\n${d.content_text}`).join("\n\n").slice(0, 50000));
        } else if (isReport) {
          // We use the already defined generateReport but adapted for chat
          answer = await callLLM("Genera un informe detallat dels documents seguint aquesta estructura: 1. Resum Executiu, 2. Troballes Clau, 3. Anàlisi Detallat, 4. Conclusions.", docsWithText.map(d => `--- ${d.nom} ---\n${d.content_text}`).join("\n\n").slice(0, 50000));
        } else if (isTest) {
          const testRaw = await callLLM("Genera 5 preguntes de test sobre el contingut.", docsWithText.map(d => `--- ${d.nom} ---\n${d.content_text}`).join("\n\n").slice(0, 50000));
          answer = testRaw;
        } else if (isDiagram) {
          const diagRaw = await callLLM("Genera un diagrama Mermaid resumint el contingut. Retorna NOMÉS el codi.", docsWithText.map(d => `--- ${d.nom} ---\n${d.content_text}`).join("\n\n").slice(0, 50000));
          answer = "Aquí tens un diagrama del contingut:\n\n```mermaid\n" + diagRaw.replace(/```mermaid/g, "").replace(/```/g, "").trim() + "\n```";
        }
        sources = docsWithText.map(d => ({ documentId: d.id, nom: d.nom }));
      } else {
        answer = "Ho sento, no he trobat text als documents per processar la teva petició.";
      }
    } else {
      // STANDARD RAG FLOW
      similarChunks = await searchSimilarContext(message, 5, validDocIds);

      let context = "";
      if (similarChunks.length > 0) {
        context = similarChunks.map(c => c.content_chunk).join("\n\n---\n\n");
      } else {
        if (validDocs.length === 1 && validDocs[0].content_text) {
          context = validDocs[0].content_text.slice(0, 4000);
        }
      }

      const docNames = validDocs.map(d => d.nom).join(", ");
      const prompt = `DOCUMENTS: ${docNames}\n\nPREGUNTA:\n"${message}"\n\nRespon de forma clara i concisa basant-te en el context proporcionat si és rellevant.`;

      answer = await callLLM(prompt, context);

      if (similarChunks.length > 0) {
        const usedDocIds = [...new Set(similarChunks.map(c => c.document_id))];
        sources = validDocs.filter(d => usedDocIds.includes(d.id)).map(d => ({ documentId: d.id, nom: d.nom }));
      } else if (validDocs.length === 1) {
        sources = [{ documentId: validDocs[0].id, nom: validDocs[0].nom }];
      }
    }

    // 4) Guardar historial
    await addMessage({
      carpetaId,
      role: "user",
      content: message,
      sources: []
    });

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
