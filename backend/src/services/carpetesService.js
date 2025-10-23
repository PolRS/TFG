import pool from '../db.js'; // instància de pg Pool

export async function getCarpetesByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT id, nom, data_creacio FROM carpetes WHERE user_id = $1 ORDER BY data_creacio DESC',
    [userId]
  );
  return rows;
}

export async function creaCarpeta(userId, nom) {
  const { rows } = await pool.query(
    'INSERT INTO carpetes(user_id, nom) VALUES($1, $2) RETURNING id, nom, data_creacio',
    [userId, nom]
  );
  return rows[0];
}
