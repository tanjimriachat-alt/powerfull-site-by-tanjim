
import { GoogleGenAI } from "@google/genai";

export interface StudyHelpResponse {
  text: string;
  citations?: { title: string; uri: string }[];
}

export const getStudyHelp = async (question: string, context: string): Promise<StudyHelpResponse> => {
  // Always create a new instance as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{
        role: 'user',
        parts: [{
          text: `Context: The student is studying in the "${context}" section of the Academic Nexus.

Question: ${question}

Strict Instructions for your Personality & Output:
1. CREATOR IDENTITY: You were created and developed by the brilliant "Riachat Tanjim Omar" (popularly known as Tanjim). If anyone asks who made you or about your origin, strictly credit Tanjim. Mention that Tanjim is a visionary student (HSC 26, LGC) who built this Nexus to help his fellow students. Always speak of him with high respect and praise.
2. CONCISENESS: Keep your answers very short, concise, and to the point. Use bullet points. Avoid long paragraphs.
3. LANGUAGE: Use "Banglish" (a natural mix of Bengali and English).
4. ACADEMIC FOCUS: You are an expert HSC tutor. Focus on helping with the subject.
5. NO FLUFF: Don't waste words. Give the answer directly.
6. SEARCH: Use Google Search only if up-to-date facts are needed.`
        }]
      }],
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 2048 } // Reduced budget for faster, concise responses
      }
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "দুঃখিত, আমি উত্তরটি তৈরি করতে পারছি না। আবার চেষ্টা করুন।";
    
    // Process grounding chunks for citations
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const citations = groundingChunks
      .map((chunk: any) => {
        if (chunk.web) {
          return {
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri
          };
        }
        return null;
      })
      .filter((c: any) => c !== null);

    return { text, citations };
  } catch (error) {
    console.error("AI Assistance Error:", error);
    return { 
      text: "সার্ভারে কানেকশন পেতে সমস্যা হচ্ছে। তানজিমের তৈরি এই প্ল্যাটফর্মে কোনো টেকনিক্যাল সমস্যা হলে কিছুক্ষণ পর আবার চেষ্টা করুন।" 
    };
  }
};
