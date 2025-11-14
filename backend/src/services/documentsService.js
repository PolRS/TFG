import pool from "../db.js";
import path from "path"
import fs from "fs/promises";

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

  // Inserim el document
  const insertDocQuery = `
    INSERT INTO documents (nom, tipus, mida, path)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nom, tipus, mida, path, data_pujada
  `;
  const docValues = [originalname, mimetype, size, filePath];

  const { rows: docRows } = await pool.query(insertDocQuery, docValues);
  const document = docRows[0];

  // Inserim la relació carpeta-document
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
    await client.query(`DELETE FROM carpetes_documents WHERE document_id = $1`, [documentId]);

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