
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getClinicalInsights = async (disease: string, findings: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a brief medical insight and suggested next steps for a patient with the following:
      Diagnosis: ${disease}
      Findings: ${findings}
      
      Format the response as a short bulleted list of suggested doctor's comments.`,
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI insights. Please try manual entry.";
  }
};
