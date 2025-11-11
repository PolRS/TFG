import pool from "../db.js";

export async function getDocumentsByCarpeta(userId, carpetaId) {
  const { rows } = await pool.query(
    `
    SELECT d.id, d.nom, d.tipus, d.path_fitxer, d.data_creacio
    FROM documents d
    JOIN carpetes_documents cd ON cd.document_id = d.id
    JOIN carpetes c ON c.id = cd.carpeta_id
    WHERE c.id = $1 AND c.user_id = $2
    ORDER BY d.data_creacio DESC
    `,
    [carpetaId, userId]
  );
  return rows;
}

export async function creaDocument(userId, carpetaId, nom, tipus, path_fitxer) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Inserta el document
    const { rows: docRows } = await client.query(
      `INSERT INTO documents (user_id, nom, tipus, path_fitxer)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nom, tipus, path_fitxer, data_creacio`,
      [userId, nom, tipus, path_fitxer]
    );

    const document = docRows[0];

    // Relaciona amb la carpeta
    await client.query(
      `INSERT INTO carpetes_documents (carpeta_id, document_id)
       VALUES ($1, $2)`,
      [carpetaId, document.id]
    );

    await client.query("COMMIT");
    return document;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function eliminaDocument(userId, carpetaId, documentId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Comprovem que el document pertanyi a l'usuari
    const { rows: check } = await client.query(
      `SELECT d.path_fitxer
       FROM documents d
       JOIN carpetes_documents cd ON cd.document_id = d.id
       JOIN carpetes c ON c.id = cd.carpeta_id
       WHERE d.id = $1 AND c.id = $2 AND c.user_id = $3`,
      [documentId, carpetaId, userId]
    );

    if (check.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const path_fitxer = check[0].path_fitxer;

    // Eliminem la relació i el document
    await client.query(`DELETE FROM carpetes_documents WHERE document_id = $1`, [documentId]);
    await client.query(`DELETE FROM documents WHERE id = $1`, [documentId]);

    await client.query("COMMIT");
    return { id: documentId, path_fitxer };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
