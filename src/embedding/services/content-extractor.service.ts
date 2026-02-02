import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

// pdf-parse uses CommonJS
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

@Injectable()
export class ContentExtractorService {
  private readonly logger = new Logger(ContentExtractorService.name);

  async extractFromPDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return this.cleanText(data.text);
  }

  extractFromTXT(filePath: string): string {
    const content = fs.readFileSync(filePath, "utf-8");
    return this.cleanText(content);
  }

  async extractFromWebsite(url: string): Promise<string> {
    this.logger.log(`Extracting content from: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Remove non-content elements
    $(
      "script, style, nav, footer, header, aside, iframe, noscript, svg, img",
    ).remove();

    const textParts: string[] = [];

    // Get meta description
    const metaDesc = $('meta[name="description"]').attr("content");
    if (metaDesc) textParts.push(metaDesc);

    // Get title
    const title = $("title").text().trim();
    if (title) textParts.push(title);

    // Get main content areas
    $(
      "article, main, .content, #content, p, h1, h2, h3, h4, h5, h6, li, td, th",
    ).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) {
        textParts.push(text);
      }
    });

    const uniqueParts = [...new Set(textParts)];
    return this.cleanText(uniqueParts.join("\n"));
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
    const chunks: string[] = [];
    const cleanedText = text.replace(/\s+/g, " ").trim();

    if (cleanedText.length === 0) return [];

    let start = 0;
    while (start < cleanedText.length) {
      const end = Math.min(start + chunkSize, cleanedText.length);
      chunks.push(cleanedText.substring(start, end));

      if (end === cleanedText.length) break;
      start = end - overlap;
      if (start <= 0) break;
    }

    return chunks.filter((chunk) => chunk.length > 20);
  }

  safeDeleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
    }
  }
}
