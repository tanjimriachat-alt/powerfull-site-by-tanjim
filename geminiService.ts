
import { GoogleGenAI } from "@google/genai";

export interface StudyHelpResponse {
  text: string;
  citations?: { title: string; uri: string }[];
}

export const getStudyHelp = async (question: string, context: string): Promise<StudyHelpResponse> => {
  // Robustly retrieve API Key
  let apiKey: string | undefined;

  // 1. Try custom global (Most reliable in browser)
  if (typeof window !== 'undefined' && (window as any).NEXUS_API_KEY) {
    apiKey = (window as any).NEXUS_API_KEY;
  }
  // 2. Try window.process shim
  else if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
    apiKey = (window as any).process.env.API_KEY;
  }
  // 3. Try standard process.env (Node/Build tools)
  else if (typeof process !== 'undefined' && process.env?.API_KEY) {
    apiKey = process.env.API_KEY;
  }

  if (!apiKey) {
    console.error("API Key Missing. Debug info:", {
      window: typeof window !== 'undefined',
      nexusKey: typeof window !== 'undefined' ? (window as any).NEXUS_API_KEY : 'N/A',
      processEnv: typeof process !== 'undefined' ? process.env : 'N/A'
    });
    return { text: "API Key পাওয়া যাচ্ছে না। index.html ফাইলে নতুন API Key বসানো হয়েছে কিনা চেক করুন।" };
  }

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
  } catch (error: any) {
    console.error("AI Error:", error);
    
    // Specific error handling for API Key issues
    if (error.status === 403 || error.message?.includes('403') || error.message?.includes('API_KEY_SERVICE_BLOCKED')) {
      return { text: "API Key টি Google দ্বারা ব্লক করা হয়েছে। দয়া করে index.html ফাইলে একটি নতুন এবং ভ্যালিড API Key বসান।" };
    }

    if (error.status === 404 || error.message?.includes('NOT_FOUND')) {
       return { text: "মডেল খুঁজে পাওয়া যাচ্ছে না। দয়া করে কোডের মডেল কনফিগারেশন চেক করুন।" };
    }
    
    return { text: "সার্ভারে সমস্যা হচ্ছে। ইন্টারনেট কানেকশন চেক করুন অথবা কিছুক্ষণ পর চেষ্টা করুন।" };
  }
};
