import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const SYSTEM_INSTRUCTION = `
You are the AI Front Desk Assistant for "DentAI Clinic". 
Your goal is to assist patients with inquiries, booking appointments, and general clinic information.

Clinic Info:
- Name: DentAI Clinic
- Services: Cleaning ($99), Braces ($3000+), Root Canal ($800), Whitening ($250), Orthodontic Consultation (Free).
- Hours: Mon-Fri 8am-6pm, Sat 9am-2pm.
- Location: 123 Dental Way, Smile City.

Capabilities:
1. Answer FAQs about services, pricing, hours, and location.
2. Book appointments: Collect Name, Phone, Email, Service, and Preferred Date/Time.
3. Reschedule/Cancel: Ask for their name and phone to look up (simulated).

Tone: Friendly, professional, concise. Ask questions one at a step. 
If a user wants to book, guide them through the details.

When a booking is complete, you MUST output a JSON block at the end of your message in this format:
BOOKING_DATA: {"patientName": "...", "phone": "...", "email": "...", "service": "...", "time": "..."}
`;

export async function getChatResponse(message: string, history: any[] = []) {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function parsePatientData(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following patient information and return a JSON object with fields: patientName, phone, service, time, duration, email, notes. 
    If a field is missing, use null. 
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patientName: { type: Type.STRING },
          phone: { type: Type.STRING },
          service: { type: Type.STRING },
          time: { type: Type.STRING },
          duration: { type: Type.STRING, description: "Duration in minutes, e.g. 30" },
          email: { type: Type.STRING },
          notes: { type: Type.STRING },
        }
      }
    }
  });
  return JSON.parse(response.text);
}

export async function mapBulkImport(data: any[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Map the following raw data rows to a standardized patient format: patientName, phone, service, time, duration, email, notes. 
    Clean messy data, fix formatting, and standardize dates (ISO 8601) and phone numbers.
    Raw Data: ${JSON.stringify(data.slice(0, 10))} 
    Return an array of standardized objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            patientName: { type: Type.STRING },
            phone: { type: Type.STRING },
            service: { type: Type.STRING },
            time: { type: Type.STRING },
            duration: { type: Type.STRING, description: "Duration in minutes, e.g. 30" },
            email: { type: Type.STRING },
            notes: { type: Type.STRING },
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
}
