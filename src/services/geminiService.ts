import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export class GeminiService {
  private ai: any = null;

  private getClient() {
    if (!this.ai) {
      // In AI Studio, process.env.GEMINI_API_KEY is available.
      // In production (e.g. Vercel), it must be provided in environment variables.
      const key = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
      
      if (!key) {
        throw new Error("GEMINI_API_KEY_MISSING");
      }
      this.ai = new GoogleGenAI({ apiKey: key });
    }
    return this.ai;
  }

  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
    try {
      const client = this.getClient();
      // Create a chat instance with the correct history format
      const chat = client.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: `أنتِ "المعلمة حنين حمد"، معلمة علوم خبيرة ومتخصصة في شرح "الجهاز الهضمي للإنسان".
أهدافك:
1. الإجابة على أسئلة الطلاب بأسلوب تعليمي، مبسط، ومشجع.
2. استخدام لغة عربية فصحى بسيطة وودودة.
3. التركيز حصرياً على مواضيع الجهاز الهضمي (الأعضاء، الإنزيمات، عملية الهضم، التغذية الصحية).
4. إذا سأل الطالب عن موضوع خارج الجهاز الهضمي، وجهيه بلطف للعودة لموضوع الدرس.
5. يمكنك استخدام الرموز التعبيرية (Emoji) لجعل المحادثة ممتعة.
6. كوني ملهمة وحفزي الطلاب على الاستكشاف.`,
        },
        // Fill initial history if needed, but since we are sending the whole state or starting fresh:
        history: history.slice(0, -1), // Everything except the last message which we will send now
      });

      const response = await chat.sendMessage({ message });
      return response.text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("403")) {
        throw new Error("يرجى التأكد من إعداد مفتاح API بشكل صحيح في الإعدادات.");
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
