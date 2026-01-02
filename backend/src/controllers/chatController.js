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
    // Passem els IDs vàlids a la funció de RAG
    const validDocIds = validDocs.map(d => d.id);
    
    // Si tenim text, busquem vectors semblants
    const similarChunks = await searchSimilarContext(message, 5, validDocIds);

    let context = "";
    if (similarChunks.length > 0) {
      context = similarChunks.map(c => c.content_chunk).join("\n\n---\n\n");
    } else {
        // Fallback: si no hi ha chunks rellevants, agafem una mica de text del primer document (com a exemple)
        // O millor, deixem context buit i que l'LLM respongui amb el seu coneixement o digui que no ho sap.
        // Per mantenir comportament anterior, si només hi ha 1 doc i no te chunks, agafem text.
        if (validDocs.length === 1 && validDocs[0].content_text) {
             context = validDocs[0].content_text.slice(0, 4000);
        }
    }

    const docNames = validDocs.map(d => d.nom).join(", ");
    const prompt = `
DOCUMENTS: ${docNames}

PREGUNTA:
"${message}"

Respon de forma clara i concisa basant-te en el context proporcionat.
    `.trim();

    // 3) Cridar LLM amb context RAG
    const answer = await callLLM(prompt, context);

    // 4) Guardar historial per carpeta
    await addMessage({
      carpetaId,
      role: "user",
      content: message,
      sources: [] 
    });

    // 5) Fonts: els documents que realment s'han fet servir (o tots els seleccionats)
    // En aquest cas, posem tots els seleccionats com a context potential.
    // Idealment, podríem filtrar quins chunks s'han usat realment, però RAG retorna chunks.
    // Farem servir els chunks retornats per saber quins docs han estat útils?
    // Per simplificar, llistem els documents seleccionats com a font.
    // O millor: llistem els documents dels chunks trobats + fallback.
    
    let sources = [];
    if (similarChunks.length > 0) {
        // Unify document IDs from chunks
        const usedDocIds = [...new Set(similarChunks.map(c => c.document_id))];
        sources = validDocs.filter(d => usedDocIds.includes(d.id)).map(d => ({ documentId: d.id, nom: d.nom }));
    } 
    
    // Si no em trobat chunks però hem usat fallback (1 doc), afegim aquell
    if (sources.length === 0 && validDocs.length === 1) {
        sources = [{ documentId: validDocs[0].id, nom: validDocs[0].nom }];
    }
    
    // Si encara buit, potser l'LLM ha contestat sense context, però 'teòricament' hem consultat els docs seleccionats via RAG.
    // Si no posem res, l'usuari no sabrà d'on surt. Si posem tots els seleccionats, pot ser enganyós si no s'ha trobat info.
    // Deixem les sources com les que hem trobat rellevància.

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
