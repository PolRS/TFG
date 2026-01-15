-- Taula d'Usuaris
CREATE TABLE IF NOT EXISTS usuaris (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    nom VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taula de Carpetes
CREATE TABLE IF NOT EXISTS carpetes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuaris(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    data_creacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taula de Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    tipus VARCHAR(100), -- mimetype
    mida BIGINT,
    path TEXT NOT NULL, -- ruta al fitxer físic
    content_text TEXT, -- text extret per a RAG
    data_pujada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relació Carpetes <-> Documents
CREATE TABLE IF NOT EXISTS carpetes_documents (
    carpeta_id INTEGER REFERENCES carpetes(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (carpeta_id, document_id)
);

-- Historial del Xat
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    carpeta_id INTEGER REFERENCES carpetes(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user' o 'assistant'
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]', -- Citacions del RAG
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RAG: Trossos i Embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    chunk_index INTEGER,
    embedding FLOAT8[] -- Array de vectors (1024 dimensions per Mistral)
);
-- 7. Resultats de la IA (Resums, Diagrames, Tests, Informes)
CREATE TABLE IF NOT EXISTS resultats_ia (
    id SERIAL PRIMARY KEY,
    carpeta_id INTEGER REFERENCES carpetes(id) ON DELETE CASCADE,
    tipus VARCHAR(50) CHECK (tipus IN ('resum', 'diagrama', 'test', 'informe')),
    contingut TEXT NOT NULL,
    data_creacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
