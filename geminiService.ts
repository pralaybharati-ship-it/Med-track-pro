
import { GoogleGenAI } from "@google/genai";

// Fix: Initialize GoogleGenAI with a named parameter and use process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getClinicalInsights = async (disease: string, findings: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a brief medical insight and suggested next steps for a patient with the following:
      Diagnosis: ${disease}
      Findings: ${findings}
      
      Format the response as a short bulleted list of suggested doctor's comments.`,
      config: {
        // Fix: Removed maxOutputTokens to avoid reaching token limits and follow recommendations.
        temperature: 0.7,
      },
    });
    // Fix: Directly access the .text property of the response object.
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI insights. Please try manual entry.";
  }
};
