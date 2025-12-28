
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export interface StudyHelpResponse {
  text: string;
  citations?: { title: string; uri: string }[];
}

export const getStudyHelp = async (question: string, context: string): Promise<StudyHelpResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert academic tutor for HSC (Higher Secondary Certificate) students in Bangladesh. 
      The student is currently studying: ${context}. 
      
      User's Question: ${question}
      
      Instructions:
      1. Provide a clear, step-by-step explanation.
      2. If it's a math or science problem, show the formulas and logic.
      3. Use a friendly, encouraging tone in a mix of Bengali and English (Banglish) where appropriate for a Bangladeshi student.
      4. Use recent academic standards.
      5. If you use external information, the search tool will provide grounding.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const citations = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    })).filter((c: any) => c.uri !== "#");

    return { text, citations };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "সার্ভারে সমস্যা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" };
  }
};
