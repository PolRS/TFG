# Biblioteca personal per al a cerca de docouments amb IA

Aquest projecte és un sistema de gestió documental amb IA (RAG) que permet fer preguntes sobre els teus documents PDF/DOCX.

## Requisits Previs
Abans de començar, necessites tenir instal·lat:
1.  **Node.js** (v18 o superior) - [Descarregar](https://nodejs.org/)
2.  **PostgreSQL** (Base de dades) - [Descarregar](https://www.postgresql.org/download/)
    *   Durant la instal·lació, recorda la contrasenya del superusuari (`postgres`).

---

## Instal·lació (Pas a Pas)

### 1. Preparar la Base de Dades
Obre `pgAdmin` (o el teu terminal SQL) i executa aquestes comandes:

1.  Crear la base de dades:
    ```sql
    CREATE DATABASE tfg_db;
    ```
2.  Executar els scripts de migració (creació de taules). Pots copiar i enganxar el contingut dels fitxers que hi ha a `backend/migrations/*.sql` dins d'una Query Tool a la teva nova base de dades.

### 2. Configurar el Backend

1.  Obre un terminal a la carpeta `/backend`.
2.  Instal·la les dependències:
    ```bash
    npm install
    ```

### 3. Configurar el Frontend

1.  Obre un **nou** terminal a la carpeta `/frontend`.
2.  Instal·la les dependències:
    ```bash
    npm install
    ```

---

## Llançar l'Aplicació

Necessites tenir **dos terminals** oberts alhora:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*(Hauries de veure "Server running on port 3000")*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*(Hauries de veure "Local: http://localhost:5173/")*

Ara obre el navegador a **http://localhost:5173** i ja pots començar! 🚀
