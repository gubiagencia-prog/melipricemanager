import { GoogleGenAI, Type } from "@google/genai";
import { Product, AISuggestion } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPricingStrategy = async (product: Product, goal: string): Promise<AISuggestion> => {
  try {
    const prompt = `
      Actúa como un experto en e-commerce y precios para Mercado Libre México.
      Tengo el siguiente producto:
      Nombre: ${product.title}
      Precio Actual: $${product.originalPrice} MXN
      Categoría: ${product.category}
      Stock: ${product.stock}

      Mi objetivo es: "${goal}".

      Sugiere una estrategia de "Oferta Relámpago" (Flash Sale).
      Devuelve SOLO un objeto JSON con la sugerencia.
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING, description: "Breve explicación de la estrategia (máx 15 palabras)" },
            suggestedType: { type: Type.STRING, enum: ["percentage", "fixed"] },
            suggestedValue: { type: Type.NUMBER, description: "Valor del descuento (ej: 20 para 20%, o monto en pesos)" },
            suggestedDurationHours: { type: Type.NUMBER, description: "Duración sugerida en horas" }
          },
          required: ["reasoning", "suggestedType", "suggestedValue", "suggestedDurationHours"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AISuggestion;
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Error fetching AI strategy:", error);
    // Fallback if API fails or key is missing
    return {
      reasoning: "Estrategia conservadora por defecto (API Error)",
      suggestedType: "percentage",
      suggestedValue: 10,
      suggestedDurationHours: 4
    };
  }
};