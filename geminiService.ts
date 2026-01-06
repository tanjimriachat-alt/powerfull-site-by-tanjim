
import { GoogleGenAI } from "@google/genai";

export interface StudyHelpResponse {
  text: string;
  citations?: { title: string; uri: string }[];
}

export const getStudyHelp = async (question: string, context: string): Promise<StudyHelpResponse> => {
  // Fallback to hardcoded key if process.env fails in browser
  // This fixes the "API Key must be set" error
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) 
    ? process.env.API_KEY 
    : "AIzaSyB5q1Uw6zFMOlw4NFgiSEiN8DyMBqWuGE0";

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user',
        parts: [{
          text: `Context: Academic Nexus Study Portal (${context})

Question: ${question}

Instructions:
1. Identity: You are "Nexus AI", created by the visionary developer Riachat Tanjim Omar (Tanjim).
2. Style: Extremely short, concise, and friendly. Use "Banglish" (Bengali + English terms).
3. Role: Expert tutor for HSC students. Explain concepts simply.
4. Signature: End with a short appreciation for Tanjim.
`
        }]
      }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const text = response.text || "দুঃখিত, আমি উত্তরটি তৈরি করতে পারছি না। আবার চেষ্টা করুন।";
    
    // Check for grounding
    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const citations = groundingChunks
      .map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title || "Web Source", uri: chunk.web.uri };
        }
        return null;
      })
      .filter((c: any) => c !== null);

    return { text, citations };
  } catch (error) {
    console.error("AI Error:", error);
    return { text: "সার্ভারে সমস্যা হচ্ছে। ইন্টারনেট কানেকশন চেক করুন অথবা কিছুক্ষণ পর চেষ্টা করুন।" };
  }
};
