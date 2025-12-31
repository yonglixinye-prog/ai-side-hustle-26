
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getEditorAdvice = async (userProfile: string, question: string) => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Context: You are a world-class editor and AI strategy consultant. 
      You are helping a reader who wants to start an AI side hustle in 2026 based on the provided article content.
      
      Reader's Profile: ${userProfile}
      Reader's Question: ${question}
      
      Task: Provide encouraging, professional, and practical advice on how they can leverage AI for a side hustle, 
      referencing the "2026 Government AI Strategy" (which emphasizes safe, practical, and human-centric usage over cutting-edge tech).
      Keep the tone friendly (polite Japanese/Keigo).
    `,
    config: {
      temperature: 0.7,
      topP: 0.95,
    }
  });

  const response = await model;
  return response.text;
};
