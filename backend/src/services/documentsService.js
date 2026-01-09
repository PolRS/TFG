import pool from "../db.js";
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as ragService from "./ragService.js";
import officeParser from "officeparser";

async function extractContentText(filePath, mimetype) {
  try {
    let extension = path.extname(filePath).toLowerCase();

    // Si el mimetype és genèric, intentem detectar-lo millor amb 'file'
    if (mimetype === "application/octet-stream") {
      const realMime = await detectRealMimeType(filePath);
      if (realMime) {
        console.log(`Tipus detectat per OS: ${realMime} (era ${mimetype})`);
        mimetype = realMime;
      }
    }

    const isPdf =
      mimetype === "application/pdf" || mimetype.includes("pdf") || extension === ".pdf";

    const isPptx =
      mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      mimetype === "application/vnd.ms-powerpoint" ||
      extension === ".pptx" ||
      extension === ".ppt";

    // 1) Text pla
    if (mimetype.startsWith("text/") || extension === ".txt" || extension === ".md" || extension === ".csv") {
      return await fs.readFile(filePath, "utf8");
    }

    // 2) PDF (PDF.js)
    if (isPdf) {
      const buffer = await fs.readFile(filePath);
      const text = await extractTextFromPdf(buffer);
      return text || "";
    }

    // 3) DOCX
    if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === ".docx"
    ) {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    // 4) PPTX (officeparser)
    if (isPptx) {
      try {
        const text = await officeParser.parseOfficeAsync(filePath);
        return text || "";
      } catch (err) {
        console.error("Error extraient text de PPTX:", err);
        return "";
      }
    }

    // 5) Altres formats -> buit sense OCR
    console.warn(`Format no suportat per a extracció de text: ${mimetype} (${extension})`);
    return "";
  } catch (err) {
    console.error("Error extraient content_text del fitxer:", err);
    return "";
  }
}



async function extractTextFromPdf(buffer) {
  const uint8 = new Uint8Array(buffer); // ✅ Buffer -> Uint8Array

  const loadingTask = pdfjsLib.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => (item.str ? item.str : ""))
      .join(" ");

    fullText += pageText + "\n";
  }

  return fullText.trim();
}


import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Detecta el tipus real del fitxer usant la comanda 'file' (Linux/Unix).
 */
async function detectRealMimeType(filePath) {
  try {
    const { stdout } = await execPromise(`file -b --mime-type "${filePath}"`);
    return stdout.trim();
  } catch (err) {
    console.warn("No s'ha pogut detectar el tipus amb 'file':", err);
    return "";
  }
}




export async function getDocumentById(documentId) {
  const result = await pool.query(
    `SELECT id, nom, tipus, mida, path, data_pujada, content_text
     FROM documents
     WHERE id = $1`,
    [documentId]
  );

  if (result.rowCount === 0) return null;
  return result.rows[0];
}

export async function getDocumentsByCarpeta(userId, carpetaId) {
  const { rows } = await pool.query(
    `
    SELECT d.id, d.nom, d.tipus, d.path, d.data_pujada
    FROM documents d
    JOIN carpetes_documents cd ON cd.document_id = d.id
    JOIN carpetes c ON c.id = cd.carpeta_id
    WHERE c.id = $1 AND c.user_id = $2
    ORDER BY d.data_pujada DESC
    `,
    [carpetaId, userId]
  );
  return rows;
}

export async function getContentFromDocuments(userId, documentIds) {
  // Assegurar que els documents pertanyen a l'usuari (via carpetes linkades o directament)
  // Per simplificar, assumim comprovació de propietat bàsica o confiem en la query
  // Aquí fem una subquery per comprovar que el document està en alguna carpeta de l'usuari
  const query = `
    SELECT d.id, d.nom, d.content_text
    FROM documents d
    JOIN carpetes_documents cd ON cd.document_id = d.id
    JOIN carpetes c ON c.id = cd.carpeta_id
    WHERE d.id = ANY($1) AND c.user_id = $2
    GROUP BY d.id
  `;

  const { rows } = await pool.query(query, [documentIds, userId]);
  return rows; // Retorna array d'objectes { id, nom, content_text }
}

export async function creaDocument(carpetaId, file) {
  const { originalname, mimetype, size, path: filePath } = file;

  // 1) Extreure text per guardar-lo a content_text
  const contentText = await extractContentText(filePath, mimetype);

  // 2) Inserim el document (ara també content_text)
  const insertDocQuery = `
    INSERT INTO documents (nom, tipus, mida, path, content_text)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, nom, tipus, mida, path, data_pujada, content_text
  `;
  const docValues = [originalname, mimetype, size, filePath, contentText];

  const { rows: docRows } = await pool.query(insertDocQuery, docValues);
  const document = docRows[0];

  // 3) Inserim la relació carpeta-document
  const linkQuery = `
    INSERT INTO carpetes_documents (carpeta_id, document_id)
    VALUES ($1, $2)
  `;
  await pool.query(linkQuery, [carpetaId, document.id]);

  // 4) Generar Embeddings (RAG) en segon pla
  try {
    if (contentText && contentText.length > 0) {
      // No fem await per no bloquejar la resposta al frontend
      // Però loguegem errors
      ragService.storeDocumentChunks(document.id, contentText)
        .catch(err => console.error("Error background embedding:", err));
    }
  } catch (err) {
    console.error("Error initiating RAG processing:", err);
  }

  return document;
}

export async function eliminaDocument(userId, carpetaId, documentId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que el document pertany a l’usuari
    const { rows: check } = await client.query(
      `SELECT d.path
       FROM documents d
       JOIN carpetes_documents cd ON cd.document_id = d.id
       JOIN carpetes c ON c.id = cd.carpeta_id
       WHERE d.id = $1 AND c.id = $2 AND c.user_id = $3`,
      [documentId, carpetaId, userId]
    );

    if (check.length === 0) {
      await client.query("ROLLBACK");
      return null; // no autoritzat
    }

    // Eliminar relació NOMÉS d’aquesta carpeta
    await client.query(
      `DELETE FROM carpetes_documents WHERE carpeta_id = $1 AND document_id = $2`,
      [carpetaId, documentId]
    );

    // Comprovar si el document encara està linkat a altres carpetes
    const { rows: links } = await client.query(
      `SELECT 1 FROM carpetes_documents WHERE document_id = $1 LIMIT 1`,
      [documentId]
    );

    if (links.length === 0) {
      // Ja no està linkat enlloc: eliminar document
      await client.query(`DELETE FROM documents WHERE id = $1`, [documentId]);
    }


    await client.query("COMMIT");

    const path_fitxer = check[0].path;

    try {
      if (links.length === 0) {
        await fs.unlink(path_fitxer);
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        console.warn("Fitxer ja eliminat o inexistent:", path_fitxer);
      } else {
        console.warn("No s'ha pogut eliminar el fitxer:", err.message);
      }
    }

    return { id: documentId, path_fitxer: links.length === 0 ? path_fitxer : null };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getDocumentInCarpeta(carpetaId, documentId) {
  const { rows } = await pool.query(
    `
    SELECT d.id, d.nom, d.tipus, d.mida, d.path, d.data_pujada, d.content_text
    FROM documents d
    JOIN carpetes_documents cd ON cd.document_id = d.id
    WHERE cd.carpeta_id = $1 AND d.id = $2
    `,
    [carpetaId, documentId]
  );

  return rows[0] || null;
}

export async function saveResult(carpetaId, tipus, contingut) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO resultats_ia (carpeta_id, tipus, contingut)
      VALUES ($1, $2, $3)
      RETURNING id, tipus, contingut, to_char(data_creacio, 'DD/MM/YYYY HH24:MI') as date
    `;
    const { rows } = await client.query(query, [carpetaId, tipus, contingut]);
    return rows[0];
  } catch (err) {
    console.error("Error saving result:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function getResultsByCarpeta(carpetaId) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT id, tipus, contingut, to_char(data_creacio, 'DD/MM/YYYY HH24:MI') as date
      FROM resultats_ia
      WHERE carpeta_id = $1
      ORDER BY data_creacio DESC
    `;
    const { rows } = await client.query(query, [carpetaId]);
    return rows;
  } catch (err) {
    console.error("Error getting results:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteResult(resultId) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM resultats_ia WHERE id = $1 RETURNING id";
    const { rows } = await client.query(query, [resultId]);
    return rows.length > 0;
  } catch (err) {
    console.error("Error deleting result:", err);
    throw err;
  } finally {
    client.release();
  }
}