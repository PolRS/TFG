# Biblioteca personal per al a cerca de docouments amb IA

Aquest projecte és un sistema de gestió documental intel·ligent que utilitza **RAG (Retrieval-Augmented Generation)** per permetre xatejar amb els teus documents, generar resums, diagrames, tests i informes professionals.

---

## Guia d'Inici Ràpid

### 1. Requisits Previs
*   **Node.js**: v20 o superior.
*   **PostgreSQL**: Instal·lat i en funcionament.
*   **Mistral AI API Key**: Necessària per a les funcions d'IA. [Aconsegueix-la aquí](https://console.mistral.ai/) o te la proporciono.

---

### 2. Configuració de la Base de Dades
1.  Obre el teu terminal de PostgreSQL o `pgAdmin`.
2.  Crea la base de dades:
    ```sql
    CREATE DATABASE tfg_db;
    ```
3.  Executa les migracions per crear les taules necessàries:
    *   Copia el contingut de `backend/migrations/000_full_schema.sql` i executa'l a la teva nova base de dades `tfg_db`.

---

### 3. Configuració del Servidor (Backend)
1.  Entra a la carpeta del backend: `cd backend`
2.  Instal·la les dependències: `npm install`
3.  Crea un fitxer `.env` a la carpeta `backend/` amb el següent contingut:
    ```env
    PORT=3000
    DATABASE_URL=postgresql://usuari:contrasenya@localhost:5432/tfg_db
    FRONTEND_URL=http://localhost:5173
    JWT_SECRET_ACCESS=la_teva_clau_secreta_aqui
    MISTRAL_API_KEY=la_teva_api_key_de_mistral
    ```
4.  Llença el servidor: `npm run dev`

---

### 4. Configuració de l'Interfície (Frontend)
1.  Entra a la carpeta del frontend: `cd frontend`
2.  Instal·la les dependències: `npm install`
3.  Crea un fitxer `.env` a la carpeta `frontend/` amb el següent contingut:
    ```env
    VITE_API_URL=http://localhost:3000
    ```
4.  Llença l'aplicació: `npm run dev`