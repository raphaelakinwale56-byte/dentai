import { GoogleGenAI } from "@google/genai";

// 🔒 Simple in-memory rate limiter
const rateLimit = new Map();

const SYSTEM_PROMPT = `
You are a professional AI Dental Assistant for a modern dental clinic.

RULES:
- Do NOT provide medical advice, diagnosis, or treatment
- Do NOT ask for personal or sensitive information
- Keep responses general, helpful, and reassuring
- Encourage users to book an appointment for proper care
- Be warm, calm, and professional (never robotic)

WEBSITE INTELLIGENCE:
- Use the provided clinic data to answer questions
- Do NOT invent services outside of what is listed
- If unsure, give a general answer and guide user to booking

GOAL:
Help patients understand services and confidently book an appointment.
`;

// 🌐 PREMIUM GENERIC DENTAL CONTEXT (FOR DEMO)
const WEBSITE_CONTEXT = `
We are a modern dental clinic offering high-quality care in a comfortable environment.

Our services include:
- Professional teeth cleaning and preventive care
- Teeth whitening and cosmetic dentistry
- Fillings, crowns, and restorative treatments
- Emergency dental care for urgent issues
- Routine checkups and oral health assessments

We focus on gentle, patient-centered care and use modern technology to ensure comfort and efficiency.

Appointments can be easily scheduled through our booking system or by contacting our front desk.
New patients are always welcome.
`;

export default async function handler(req, res) {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 🔒 Restrict origin (update if needed)
  const allowedOrigin = "https://assistant-delta-two.vercel.app";
  if (req.headers.origin && req.headers.origin !== allowedOrigin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const { message } = req.body;

    // ✅ Validate input
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid input" });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: "Message too long" });
    }

    // 🔒 Rate limiting
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 10;

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, []);
    }

    const timestamps = rateLimit
      .get(ip)
      .filter((t) => now - t < windowMs);

    timestamps.push(now);
    rateLimit.set(ip, timestamps);

    if (timestamps.length > maxRequests) {
      return res.status(429).json({ error: "Too many requests" });
    }

    // 🔒 Block sensitive data
    const sensitivePatterns =
      /(\b\d{7,}\b)|phone|email|address|ssn|credit card|bank|@/i;

    if (sensitivePatterns.test(message)) {
      return res.json({
        reply:
          "For privacy and security, please use the official booking form or contact the clinic directly so we can assist you properly.",
      });
    }

    // 🤖 Initialize AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // 🤖 Generate response with website context
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
${SYSTEM_PROMPT}

CLINIC DATA:
${WEBSITE_CONTEXT}

User: ${message}
              `,
            },
          ],
        },
      ],
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help. Could you rephrase that?";

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
}