import pool from "../db.js";
import fs from "fs/promises";

/**
 * Retorna totes les carpetes d’un usuari
 */
export async function getCarpetesByUserId(userId) {
  const query = `
    SELECT c.id, c.nom, c.data_creacio
    FROM carpetes AS c
    WHERE c.user_id = $1
    ORDER BY c.data_creacio DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
}

/**
 * Crea una nova carpeta associada a un usuari
 */
export async function creaCarpeta(userId, nom) {
  const query = `
    INSERT INTO carpetes (user_id, nom)
    VALUES ($1, $2)
    RETURNING id, nom, data_creacio
  `;
  const { rows } = await pool.query(query, [userId, nom]);
  return rows[0];
}

export async function eliminaCarpeta(userId, carpetaId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Comprovem que la carpeta pertany a l’usuari
    const { rows: check } = await client.query(
      `SELECT id FROM carpetes WHERE id = $1 AND user_id = $2`,
      [carpetaId, userId]
    );

    if (check.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // Obtenim TOTS els fitxers associats
    const { rows: docs } = await client.query(
      `SELECT d.id, d.path
       FROM documents d
       JOIN carpetes_documents cd ON cd.document_id = d.id
       WHERE cd.carpeta_id = $1`,
      [carpetaId]
    );

    // Eliminem relacions carpeta-document
    await client.query(
      `DELETE FROM carpetes_documents WHERE carpeta_id = $1`,
      [carpetaId]
    );

    // Eliminem els documents de la BD
    await client.query(
      `DELETE FROM documents
       WHERE id IN (
         SELECT document_id FROM carpetes_documents WHERE carpeta_id = $1
       )`,
      [carpetaId]
    );

    // Eliminem la carpeta
    await client.query(
      `DELETE FROM carpetes WHERE id = $1`,
      [carpetaId]
    );

    await client.query("COMMIT");

    // Eliminem fitxers físics
    for (const doc of docs) {
      try {
        await fs.unlink(doc.path);
        console.log("Fitxer eliminat:", doc.path);
      } catch (err) {
        console.warn("⚠️ No s'ha pogut eliminar el fitxer:", err);
      }
    }

    return true;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}