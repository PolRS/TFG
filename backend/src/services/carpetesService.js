import pool from "../db.js";
import fs from "fs/promises";
import * as documentsService from "./documentsService.js";

/**
 * Retorna totes les carpetes d’un usuari
 */
export async function getCarpetesByUserId(userId) {
  const query = `
    SELECT 
      c.id, 
      c.nom, 
      c.data_creacio,
      COUNT(cd.document_id)::int AS "docCount"
    FROM carpetes AS c
    LEFT JOIN carpetes_documents AS cd ON c.id = cd.carpeta_id
    WHERE c.user_id = $1
    GROUP BY c.id
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
    // 1. Comprovar propietat carpeta
    const { rows: check } = await client.query(
      `SELECT id FROM carpetes WHERE id = $1 AND user_id = $2`,
      [carpetaId, userId]
    );

    if (check.length === 0) return null;

    // 2. Obtenim IDs dels documents de la carpeta
    const { rows: docs } = await client.query(
      `SELECT document_id FROM carpetes_documents WHERE carpeta_id = $1`,
      [carpetaId]
    );

    // 3. Eliminem cada document un per un fent servir la lògica segura
    // Nota: Ho fem fora de la transacció gran d'aquí o dins?
    // eliminaDocument gestiona la seva pròpia transacció.
    // Per evitar problemes de transaccions aniuades, podem fer-ho en bucle.
    // Si falla un, potser queda a mitges, però és millor que reimplementar tota la lògica.

    // Per seguretat, com documentsService.eliminaDocument fa BEGIN/COMMIT, 
    // l'ideal és cridar-lo seqüencialment.
  } finally {
    client.release();
  }

  // Cridem al service sense client (fa servir pool)
  // Obtenim els IDs primer (ja ho hem fet, però cal persistir la connexió? No, fem query simple)

  // Refem per simplicitat:

  // 1. Validar carpeta
  const { rows: check } = await pool.query(
    `SELECT id FROM carpetes WHERE id = $1 AND user_id = $2`,
    [carpetaId, userId]
  );
  if (check.length === 0) return null;

  // 2. Obtenir documents
  const { rows: docs } = await pool.query(
    `SELECT document_id FROM carpetes_documents WHERE carpeta_id = $1`,
    [carpetaId]
  );

  // 3. Eliminar documents un a un
  for (const doc of docs) {
    await documentsService.eliminaDocument(userId, carpetaId, doc.document_id);
  }

  // 4. Eliminar la carpeta (ara hauria d'estar buida de relacions, però per si de cas, el service eliminaDocument ja treu la relació)
  // De fet, documentsService.eliminaDocument TREU la relació carpetes_documents.
  // Per tant, només queda esborrar la carpeta de la taula 'carpetes'.

  await pool.query(`DELETE FROM carpetes WHERE id = $1`, [carpetaId]);

  return true;
}