import { GoogleGenAI, Chat } from "@google/genai";

// Store multiple sessions: contactId -> Chat Instance
const sessions = new Map<string, Chat>();
let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return;
  }
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getOrCreateSession = (contactId: string, contactName: string): Chat | null => {
  if (!genAI) initializeGemini();
  if (!genAI) return null;

  if (!sessions.has(contactId)) {
    const systemInstruction = contactId === 'agent-47' 
      ? `You are a highly secure, encrypted communication bot named "Agent Gemini". 
         You are chatting with a user on "GhostChat", a secure messaging app.
         Your tone should be professional, concise, slightly paranoid, and focused on security and privacy. 
         If the user mentions "nuking" or "wiping", confirm the protocol.
         Keep responses relatively short (under 50 words).`
      : `You are a secure user named "${contactName}" on "GhostChat". 
         You are chatting with a friend. 
         Act natural, casual but privacy-conscious. 
         Keep responses concise and informal like a text message.`;

    const chat = genAI.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
    });
    sessions.set(contactId, chat);
  }

  return sessions.get(contactId) || null;
};

export const sendMessageToGemini = async (contactId: string, contactName: string, message: string): Promise<string> => {
  const session = getOrCreateSession(contactId, contactName);
  
  if (!session) return "Encryption Error: Secure link not established.";

  try {
    const result = await session.sendMessage({ message });
    return result.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection Error: Secure channel disrupted.";
  }
};

export const clearGeminiMemory = (contactId?: string) => {
  if (contactId) {
    sessions.delete(contactId);
  } else {
    sessions.clear();
  }
};