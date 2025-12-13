// backend/src/services/chatService.js
import pool from "../db.js";

export async function getMessagesByCarpeta(carpetaId, limit = 200) {
  const { rows } = await pool.query(
    `
    SELECT id, carpeta_id, role, content, sources, created_at
    FROM chat_messages
    WHERE carpeta_id = $1
    ORDER BY created_at ASC
    LIMIT $2
    `,
    [carpetaId, limit]
  );
  return rows;
}

export async function addMessage({ carpetaId, role, content, sources = [] }) {
  const { rows } = await pool.query(
    `
    INSERT INTO chat_messages (carpeta_id, role, content, sources)
    VALUES ($1, $2, $3, $4::jsonb)
    RETURNING id, carpeta_id, role, content, sources, created_at
    `,
    [carpetaId, role, content, JSON.stringify(sources)]
  );
  return rows[0];
}
