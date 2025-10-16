import { pool } from "../db.js";

export async function findOrCreateUser(googleId, email, name) {
  const res = await pool.query("SELECT * FROM users WHERE google_id=$1", [googleId]);
  if (res.rows.length > 0) return res.rows[0];

  const insertRes = await pool.query(
    "INSERT INTO users (google_id, email, nom) VALUES ($1, $2, $3) RETURNING *",
    [googleId, email, name]
  );
  return insertRes.rows[0];
}
