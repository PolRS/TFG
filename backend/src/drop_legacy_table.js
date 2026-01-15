import pool from "./db.js";

async function dropLegacyTable() {
    const client = await pool.connect();
    try {
        console.log("Dropping table 'documents_resultats_ia' if it exists...");
        await client.query("DROP TABLE IF EXISTS documents_resultats_ia CASCADE;");
        console.log("Table dropped successfully.");
    } catch (err) {
        console.error("Error dropping table:", err);
    } finally {
        client.release();
        pool.end();
    }
}

dropLegacyTable();
