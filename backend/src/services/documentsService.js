// backend/src/services/documentService.js
import pool from "../db.js";
import fs from "fs/promises";
import mammoth from "mammoth";
import { createRequire } from "module";

// Necessari per carregar mòduls CommonJS (com pdf-parse) des d'ESM
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

/**
 * Extreu text del fitxer segons el tipus (mimetype).
 * Ara mateix: text/plain, application/pdf, docx.
 */
async function extractContentText(filePath, mimetype) {
  try {
    // 1) Fitxers de text pla
    if (mimetype.startsWith("text/")) {
      const data = await fs.readFile(filePath, "utf8");
      return data;
    }

    // 2) PDF
    if (mimetype === "application/pdf") {
      const buffer = await fs.readFile(filePath);
      const data = await pdf(buffer);
      return data.text || "";
    }

    // 3) DOCX
    if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    // 4) Altres formats encara no suportats -> buit
    console.warn("Mimetype no suportat per extreure text:", mimetype);
    return "";
  } catch (err) {
    console.error("Error extraient content_text del fitxer:", err.message);
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

    // Eliminar relació carpeta-document
    await client.query(
      `DELETE FROM carpetes_documents WHERE document_id = $1`,
      [documentId]
    );

    // Eliminar document
    await client.query(`DELETE FROM documents WHERE id = $1`, [documentId]);

    await client.query("COMMIT");

    const path_fitxer = check[0].path;

    try {
      await fs.unlink(path_fitxer);
    } catch (err) {
      console.warn("No s'ha pogut eliminar el fitxer:", err.message);
    }

    return { id: documentId, path_fitxer };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
