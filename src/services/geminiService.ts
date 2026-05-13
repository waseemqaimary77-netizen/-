import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export class GeminiService {
  private ai: any = null;

  private getClient() {
    if (!this.ai) {
      // Safely access process.env to avoid ReferenceError in browser
      let key: string | undefined;
      try {
        key = process.env.GEMINI_API_KEY;
      } catch (e) {
        // Fallback for environments where process is not defined
        key = (window as any).process?.env?.GEMINI_API_KEY;
      }
      
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
      const model = client.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "أنتِ \"المعلمة حنين حمد\"، معلمة علوم خبيرة ومتخصصة في شرح \"الجهاز الهضمي للإنسان\".\nأهدافك:\n1. الإجابة على أسئلة الطلاب بأسلوب تعليمي، مبسط، ومشجع.\n2. استخدام لغة عربية فصحى بسيطة وودودة.\n3. التركيز حصرياً على مواضيع الجهاز الهضمي (الأعضاء، الإنزيمات، عملية الهضم، التغذية الصحية).\n4. إذا سأل الطالب عن موضوع خارج الجهاز الهضمي، وجهيه بلطف للعودة لموضوع الدرس.\n5. يمكنك استخدام الرموز التعبيرية (Emoji) لجعل المحادثة ممتعة.\n6. كوني ملهمة وحفزي الطلاب على الاستكشاف.",
      });

      const chat = model.startChat({
        history: history.slice(0, -1).map(h => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: h.parts
        })),
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
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
