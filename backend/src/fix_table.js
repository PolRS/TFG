import fs from 'fs';
import path from 'path';
import { pool } from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixTable() {
    const client = await pool.connect();
    try {
        console.log('Dropping table resultats_ia...');
        await client.query("DROP TABLE IF EXISTS resultats_ia CASCADE");

        const sqlPath = path.join(__dirname, 'create_table_resultats.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Re-creating table...');
        await client.query(sql);
        console.log('Table resultats_ia recreated successfully.');
    } catch (err) {
        console.error('Error fixing table:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixTable();
