// services/mistral.js
import { Mistral } from '@mistralai/mistralai';

// ⚠️ Pon aquí tu API KEY real de Mistral entre las comillas
const API_KEY = "bSJ9FpFxEVb2R84Gwl7wra86l9x97nwO"; 

const client = new Mistral({ apiKey: API_KEY });

export const MistralService = {
  generateRoutine: async (profile) => {
    try {
      console.log("=== 1. Conectando con MISTRAL AI ===");

      const response = await client.chat.complete({
        model: "mistral-large-latest", 
        messages: [
          {
            role: "system",
            content: `Eres un entrenador personal. Responde ÚNICAMENTE con un objeto JSON.
            No agregues saludos, no digas "Aquí tienes tu rutina", ni pongas marcas de código como \`\`\`json. Solo el JSON plano.
            
            Formato exacto que debes seguir:
            {
              "consejo_inicial": "Cuidado con las lesiones y limitaciones reportadas.",
              "ejercicios": [
                { "nombre": "Caminata", "series": 3, "repes": "10 min", "descanso": "60s", "nota": "Suave" }
              ]
            }`
          },
          {
            role: "user",
            content: `Genera una rutina segura basada en: Objetivo ${profile.goal}, Lesiones: ${profile.injuries}`
          }
        ],
        responseFormat: { type: "json_object" } 
      });

      console.log("=== 2. Respuesta cruda recibida de Mistral ===");
      const responseText = response.choices[0].message.content;
      
      return JSON.parse(responseText);

    } catch (error) {
      console.error("❌ ERROR REAL DE MISTRAL AI:", error);
      
      return {
        consejo_inicial: "Error de conexión con Mistral. Cargando rutina local de emergencia.",
        ejercicios: [
          { nombre: "Sentadillas al aire (Modo Respaldo)", series: 3, repes: "12", descanso: "45s", nota: "La API falló. Revisa tu saldo o la terminal de comandos." },
          { nombre: "Flexiones de brazos / Lagartijas", series: 3, repes: "10", descanso: "45s", nota: "Asegúrate de haber instalado la librería de Mistral." }
        ]
      };
    }
  }
};