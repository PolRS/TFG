
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fetch from "node-fetch";
import pool from "../db.js";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// 1. Generate Embeddings using Mistral API
export async function generateEmbedding(text) {
    try {
        const response = await fetch("https://api.mistral.ai/v1/embeddings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "mistral-embed",
                input: [text],
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Mistral Embedding API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        return data.data[0].embedding; // Array of numbers (float8[])
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

// 2. Store Document Chunks
export async function storeDocumentChunks(documentId, fullText) {
    console.log(`Chunking document ${documentId}...`);

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });
    const chunks = await splitter.createDocuments([fullText]);

    console.log(`Generated ${chunks.length} chunks. Generating embeddings...`);

    // Process chunks sequentially to avoid rate limits
    for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i].pageContent;
        const embedding = await generateEmbedding(chunkContent);

        // Save to DB (using standard INSERT with float array)
        await pool.query(
            `INSERT INTO document_chunks (document_id, content_chunk, chunk_index, embedding)
       VALUES ($1, $2, $3, $4)`,
            [documentId, chunkContent, i, embedding]
        );
    }

    console.log(`Stored ${chunks.length} chunks for document ${documentId}.`);
}

// 3. Search Similar Context (Manual Cosine Similarity)
export async function searchSimilarContext(queryText, limit = 5, filterDocumentIds = null) {
    const queryEmbedding = await generateEmbedding(queryText);

    // SQL Magic: Calculate Cosine Similarity Manually
    const vectorString = `ARRAY[${queryEmbedding.join(",")}]::float8[]`;

    let filterClause = "";
    const params = [limit];

    if (filterDocumentIds && Array.isArray(filterDocumentIds) && filterDocumentIds.length > 0) {
        params.push(filterDocumentIds);
        filterClause = `WHERE document_id = ANY($2)`;
    }

    const sql = `
    SELECT id, document_id, content_chunk, 
           (
             SELECT SUM(v * q) 
             FROM unnest(embedding) WITH ORDINALITY As v_opt(v, i) 
             JOIN unnest(${vectorString}) WITH ORDINALITY As q_opt(q, j) 
             ON v_opt.i = q_opt.j
           ) as similarity
    FROM document_chunks
    ${filterClause}
    ORDER BY similarity DESC
    LIMIT $1;
  `;

    const { rows } = await pool.query(sql, params);
    return rows;
}
