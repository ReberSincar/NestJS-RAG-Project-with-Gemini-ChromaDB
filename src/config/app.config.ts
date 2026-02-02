import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  chromaUrl: process.env.CHROMA_URL || "http://localhost:8000",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
}));
