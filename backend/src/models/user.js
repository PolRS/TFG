import pool from "../db.js";

export async function findOrCreateUser(googleUser) {
  const { id, email, name, picture } = googleUser;
  const existing = await pool.query("SELECT * FROM users WHERE google_id = $1", [id]);

  if (existing.rows.length > 0) 
    return existing.rows[0];

  const inserted = await pool.query(
    "INSERT INTO users (google_id, email, nom, avatar_url) VALUES ($1,$2,$3,$4) RETURNING *",
    [id, email, name, picture]
  );

  return inserted.rows[0];
}