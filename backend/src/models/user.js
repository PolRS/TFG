import pool from "../db.js";

export async function findOrCreateUser(googleUser) {
  const { id, email, name, picture } = googleUser;

  //Comprova si ja existeix l'usuari
  const existing = await pool.query(
    "SELECT * FROM usuaris WHERE google_id = $1",
    [id]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  //Si no existeix, crea un nou registre
  const inserted = await pool.query(
    `INSERT INTO usuaris (google_id, email, nom, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, email, name, picture]
  );

  return inserted.rows[0];
}
