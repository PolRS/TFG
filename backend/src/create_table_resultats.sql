CREATE TABLE IF NOT EXISTS resultats_ia (
  id SERIAL PRIMARY KEY,
  carpeta_id INTEGER REFERENCES carpetes(id) ON DELETE CASCADE,
  tipus VARCHAR(50) NOT NULL CHECK (tipus IN ('resum', 'diagrama')),
  contingut TEXT NOT NULL,
  data_creacio TIMESTAMP DEFAULT NOW()
);
