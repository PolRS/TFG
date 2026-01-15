import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("Updating CHECK constraint on resultats_ia...");

        // First drop the old constraint
        await client.query(`
      ALTER TABLE resultats_ia 
      DROP CONSTRAINT IF EXISTS resultats_ia_tipus_check;
    `);

        // Add the new constraint including 'test'
        await client.query(`
      ALTER TABLE resultats_ia 
      ADD CONSTRAINT resultats_ia_tipus_check 
      CHECK (tipus IN ('resum', 'diagrama', 'test', 'informe'));
    `);

        console.log("Constraint updated successfully!");
    } catch (err) {
        console.error("Error updating constraint:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
