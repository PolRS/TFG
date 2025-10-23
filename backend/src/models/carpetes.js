import pool from "../db.js"

export async function getCarpetaByUserId(userId) {
    const res = await pool.query(
        "SELECT id, nom FROM carpetes WHERE user_id = $1 ORDER BY data_creacio DESC",
        [userId]
    )
    return res.rows
}

export async function creaCarpeta(userId, nom) {
    const res = await pool.query(
        "INSERT INTO carpetes (user_id, nom) VALUES ($1, $2) RETURNING id, nom, data_creacio",
        [userId, nom]
    )
    return res.rows[0]
}