import pool from "../db.js";

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

/**
 * Elimina una carpeta (i opcionalment les seves relacions)
 */
export async function eliminaCarpeta(carpetaId, userId) {
  const query = `
    DELETE FROM carpetes
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const { rows } = await pool.query(query, [carpetaId, userId]);
  return rows[0];
}
