import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly embeddingModel: GenerativeModel;
  private readonly chatModel: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: "text-embedding-004",
    });
    this.chatModel = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are a knowledge assistant. 
      Your task is to answer user questions based ONLY on the provided CONTEXT.
      
      RULES:
      1. If the answer is not in the CONTEXT, politely state that you do not know.
      2. Never use general knowledge outside the CONTEXT.
      3. Keep your answers always professional, helpful, and concise.
      4. Cite the source (PDF, website, etc.)
      5. ALWAYS detect the language of the user's question and answer in that SAME language.`,
    });

    this.logger.log("Gemini AI service initialized");
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  async generateResponse(context: string, question: string): Promise<string> {
    const prompt = `
    Context Information:
    ${context}

    User Question:
    ${question}

    Task:
    Answer the user's question using the context above.
    CRITICAL: Regardless of the language of the Context, you MUST answer in the same language as the "User Question".
    If the question is in English, answer in English.
    If the question is in Turkish, answer in Turkish.
    
    Answer:`;
    const result = await this.chatModel.generateContent(prompt);
    return result.response.text();
  }
}
