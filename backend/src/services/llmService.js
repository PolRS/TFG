import fetch from 'node-fetch';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

export async function callLLM(prompt, context = "") {
  let systemMessage = "Ets un assistent que respon preguntes.";
  if (context) {
    systemMessage += ` Fes servir NOMÉS el següent context per respondre. Si no ho saps, digues-ho.\n\nCONTEXT:\n${context}`;
  }

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
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