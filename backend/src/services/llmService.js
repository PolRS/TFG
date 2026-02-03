import fetch from 'node-fetch';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export async function callLLM(prompt, context = "", options = {}) {
  const { temperature = 0.7, model = "mistral-small-latest" } = options;

  let systemMessage = "Ets un assistent útil i amable que respon en Català.";
  if (context) {
    systemMessage += `\n\nCONTEXT DELS DOCUMENTS:\n${context}\n\nINSTRUCCIONS: Si la pregunta és sobre els documents, respon basant-te PRIORITÀRIAMENT en el context proporcionat. Si no ho saps o no hi ha prou informació al context, digues-ho. Si la pregunta és una salutació o és general, respon amb cordialitat.`;
  }

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      temperature: temperature,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error LLM:", res.status, text);
    throw new Error("Error fent la crida a Mistral");
  }

  const data = await res.json();

  return data.choices[0].message.content;
}

export async function generateSummary(documents) {
  // documents és array de { nom, content_text }

  let instructions = `
    Analitza els següents documents proporcionats i crea un resum complet i estructurat.
    El resum ha de integrar la informació de tots els documents de manera coherent.
    Si hi ha contradiccions, menciona-les.
    Fes servir format Markdown per a títols i llistes.
  `;

  let context = "";
  documents.forEach((doc, index) => {
    context += `\n--- DOCUMENT ${index + 1}: ${doc.nom} ---\n${doc.content_text || "(Sense text extret)"}\n`;
  });

  // Limitem el context si és massa llarg (aprox per tokens, molt simple)
  if (context.length > 50000) {
    context = context.substring(0, 50000) + "\n...(truncat)...";
  }

  const prompt = "Genera el resum basat en el context proporcionat.";

  return await callLLM(prompt, instructions + "\n\n" + context);
}

export async function generateDiagram(documents) {
  let instructions = `
    Analitza els següents documents i genera un codi de diagrama MERMAID que representi l'estructura o els conceptes clau.
    Pots fer servir 'graph TD', 'mindmap', o el que s'adapti millor.
    
    IMPORTANT - REGLES DE SINTAXI:
    1. Si fas servir text dins de nodes, fes servir SEMPRE cometes dobles i escapa els caràcters especials.
    2. Exemple CORRECTE: id["Text amb (parèntesis) i [claudàtors]"]
    3. Exemple INCORRECTE: id(Text amb (parèntesis))
    4. Evita caràcters molt complexos si no són necessaris.
    5. RETORNA NOMÉS EL CODI MERMAID, sense explicacions ni blocs de codi (\`\`\`).
  `;

  let context = "";
  documents.forEach((doc, index) => {
    context += `\n--- DOCUMENT ${index + 1}: ${doc.nom} ---\n${doc.content_text || "(Sense text)"}\n`;
  });

  if (context.length > 50000) {
    context = context.substring(0, 50000) + "\n...(truncat)...";
  }

  const prompt = "Genera el codi Mermaid per a aquests documents.";
  let content = await callLLM(prompt, instructions + "\n\n" + context);

  // Neteja blocs de codi si n'hi ha
  content = content.replace(/```mermaid/g, "").replace(/```/g, "").trim();

  return content;
}

// 4. Generate Test (JSON)
export async function generateTest(documents) {
  // Extract text from documents array properly
  const context = documents.map(d => `--- DOCUMENT: ${d.nom} ---\n${d.content_text || ""}`).join("\n\n");

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

  const prompt = `
    Basant-te en els següents documents, genera un test de 5 a 10 preguntes d'opció múltiple (A, B, C, D) per avaluar la comprensió.
    
    Retorna NOMÉS un objecte JSON amb aquest format (sense markdown, sense text extra, sense \`\`\`json):
    [
      {
        "question": "Pregunta 1?",
        "options": ["Opció A", "Opció B", "Opció C", "Opció D"],
        "correctAnswer": 0
      },
      ...
    ]
    * "correctAnswer" és l'índex de l'opció correcta (0=A, 1=B, etc).

    DOCUMENTS:
    ${context}
  `;

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: [{ role: "system", content: "Ets un expert generant tests educatius en JSON." }, { role: "user", content: prompt }],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Neteja per si el LLM posa markdown
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return content; // Should be a JSON string
  } catch (error) {
    console.error("Error generating test:", error);
    throw error;
  }
}

/**
 * Generates a comprehensive and professional report based on the provided documents.
 * @param {Array} documents - Array of document objects { nom, content_text }
 * @returns {Promise<string>} Markdown-formatted report
 */
export async function generateReport(documents) {
  let instructions = `
    Actua com un analista expert. Genera un INFORME detallat, exhaustiu i professional basat en els documents proporcionats.
    L'informe ha de ser coherent, ben estructurat i integrar la informació de tots els fitxers.
    
    ESTRUCTURA DE L'INFORME:
    1. Resum Executiu (Breu visió general).
    2. Troballes Clau (Punts més importants detectats).
    3. Anàlisi Detallat (Desenvolupament per temàtiques o seccions).
    4. Conclusions i Recomanacions.

    Fes servir format Markdown per a títols, negretes, taules (si escau) i llistes.
    Si hi ha dades contradictòries o mancances en els documents, comenta-ho.
  `;

  let context = "";
  documents.forEach((doc, index) => {
    context += `\n--- DOCUMENT ${index + 1}: ${doc.nom} ---\n${doc.content_text || "(Sense text)"}\n`;
  });

  if (context.length > 50000) {
    context = context.substring(0, 50000) + "\n...(context truncat per límits de tokens)...";
  }

  const prompt = "Genera l'informe professional complet seguint l'estructura definida.";

  return await callLLM(prompt, instructions + "\n\n" + context);
}