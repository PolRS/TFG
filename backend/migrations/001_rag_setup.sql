-- Create table for document chunks using standard arrays (no pgvector)
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    chunk_index INTEGER,
    embedding FLOAT8[] -- Standard PostgreSQL array for embeddings
);

-- Note: No index on embedding because we will do full table scan with exact calculation.
-- For TFG scale (< 100k chunks) this is fast enough.
