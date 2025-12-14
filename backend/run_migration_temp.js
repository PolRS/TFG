import fs from 'fs';
import path from 'path';
import { pool } from './src/db.js';

async function runMigration() {
    console.log('Starting migration script...');
    if (!process.env.DATABASE_URL) {
        console.error('ERROR: DATABASE_URL is not defined in environment.');
    } else {
        console.log('DATABASE_URL is set (length: ' + process.env.DATABASE_URL.length + ')');
    }

    try {
        const sqlPath = path.join(process.cwd(), 'migrations', '001_rag_setup.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Migration file not found at: ${sqlPath}`);
        }
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running migration from:', sqlPath);
        await pool.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed details:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
