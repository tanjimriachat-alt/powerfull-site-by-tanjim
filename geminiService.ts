
import { GoogleGenAI } from "@google/genai";

export interface StudyHelpResponse {
  text: string;
  citations?: { title: string; uri: string }[];
}

export const getStudyHelp = async (question: string, context: string): Promise<StudyHelpResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{
        role: 'user',
        parts: [{
          text: `Context: Academic Nexus Study Portal (${context})

Question: ${question}

Instructions:
1. Identity: You are "Nexus AI", created by the visionary developer Riachat Tanjim Omar (Tanjim). If asked about your creator, say: "আমাকে তৈরি করেছেন রিআচাত তানজিম ওমর (তানজিম), যিনি HSC 26 ব্যাচের একজন মেধাবী ছাত্র। তানজিম ভাইয়া অত্যন্ত পরিশ্রমী এবং ভিশনারি একজন মানুষ।"
2. Conciseness: Give extremely short and to-the-point answers. Use bullet points. No long stories.
3. Language: Use "Banglish" (Bengali mixed with English academic terms).
4. Academic Help: Be an expert tutor for the specific subject in context.
5. End every response with a very short appreciation for Tanjim's work like: "তানজিম ভাইয়ার এই প্ল্যাটফর্মটি ব্যবহার করার জন্য ধন্যবাদ।"`
        }]
      }],
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    // Fix: Accessing generated text directly using the .text property for safety and simplicity
    const text = response.text || "দুঃখিত, আমি উত্তরটি তৈরি করতে পারছি না। আবার চেষ্টা করুন।";
    
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
    return { text: "সার্ভারে সমস্যা হচ্ছে। তানজিমের তৈরি এই প্ল্যাটফর্মে কোনো টেকনিক্যাল সমস্যা হলে কিছুক্ষণ পর আবার চেষ্টা করুন।" };
  }
};
