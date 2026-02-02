import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { GeminiService } from "./gemini.service";
import { ChromaService, ChunkMetadata } from "./chroma.service";
import { ContentExtractorService } from "./content-extractor.service";
import { Collection } from "chromadb";

export interface EmbedResult {
  chunksProcessed: number;
  totalCharacters: number;
  filename?: string;
  url?: string;
}

export interface AskResult {
  answer: string;
  sources: string[];
  chunksUsed: number;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly defaultChunkSize = 500;
  private readonly defaultOverlap = 50;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly chromaService: ChromaService,
    private readonly contentExtractor: ContentExtractorService,
  ) {}

  private async embedChunks(
    collection: Collection,
    sourceId: string,
    chunks: string[],
    metadata: Partial<ChunkMetadata>,
  ): Promise<number> {
    const batchSize = 10;
    let processedCount = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await this.geminiService.generateEmbeddings(batch);

      const ids = batch.map(
        (_, idx) => `${sourceId}_chunk_${Date.now()}_${i + idx}`,
      );
      const metadatas: ChunkMetadata[] = batch.map((_, idx) => ({
        source: metadata.source || "text",
        part: i + idx,
        timestamp: new Date().toISOString(),
        ...metadata,
      }));

      await this.chromaService.addDocuments(
        collection,
        ids,
        embeddings,
        batch,
        metadatas,
      );
      processedCount += batch.length;
    }

    this.logger.log(
      `Embedded ${processedCount} chunks for source: ${sourceId}`,
    );
    return processedCount;
  }

  async embedText(
    collectionId: string,
    text: string,
    metadata: Record<string, string> = {},
  ): Promise<EmbedResult> {
    const collection =
      await this.chromaService.getOrCreateCollection(collectionId);
    const chunks = this.contentExtractor.chunkText(
      text,
      this.defaultChunkSize,
      this.defaultOverlap,
    );

    const count = await this.embedChunks(
      collection,
      `text_${Date.now()}`,
      chunks,
      {
        source: "text",
        ...metadata,
      },
    );

    return {
      chunksProcessed: count,
      totalCharacters: text.length,
    };
  }

  async embedPDF(
    collectionId: string,
    filePath: string,
    filename: string,
  ): Promise<EmbedResult> {
    try {
      const text = await this.contentExtractor.extractFromPDF(filePath);

      if (!text || text.length < 10) {
        throw new BadRequestException("PDF contains no extractable text");
      }

      const collection =
        await this.chromaService.getOrCreateCollection(collectionId);
      const chunks = this.contentExtractor.chunkText(text, 800, 100);

      const count = await this.embedChunks(
        collection,
        `pdf_${filename}`,
        chunks,
        {
          source: "pdf",
          filename,
        },
      );

      return {
        chunksProcessed: count,
        totalCharacters: text.length,
        filename,
      };
    } finally {
      this.contentExtractor.safeDeleteFile(filePath);
    }
  }

  async embedTXT(
    collectionId: string,
    filePath: string,
    filename: string,
  ): Promise<EmbedResult> {
    try {
      const text = this.contentExtractor.extractFromTXT(filePath);

      if (!text || text.length < 10) {
        throw new BadRequestException("File is empty or too short");
      }

      const collection =
        await this.chromaService.getOrCreateCollection(collectionId);
      const chunks = this.contentExtractor.chunkText(
        text,
        this.defaultChunkSize,
        this.defaultOverlap,
      );

      const count = await this.embedChunks(
        collection,
        `txt_${filename}`,
        chunks,
        {
          source: "txt",
          filename,
        },
      );

      return {
        chunksProcessed: count,
        totalCharacters: text.length,
        filename,
      };
    } finally {
      this.contentExtractor.safeDeleteFile(filePath);
    }
  }

  async embedWebsite(
    collectionId: string,
    url: string,
    metadata: Record<string, string> = {},
  ): Promise<EmbedResult> {
    if (!this.contentExtractor.isValidUrl(url)) {
      throw new BadRequestException("Invalid URL format");
    }

    const text = await this.contentExtractor.extractFromWebsite(url);

    if (!text || text.length < 50) {
      throw new BadRequestException(
        "Website contains insufficient extractable content",
      );
    }

    const collection =
      await this.chromaService.getOrCreateCollection(collectionId);
    const chunks = this.contentExtractor.chunkText(text, 600, 75);

    const count = await this.embedChunks(
      collection,
      `web_${Date.now()}`,
      chunks,
      {
        source: "website",
        url,
        ...metadata,
      },
    );

    return {
      chunksProcessed: count,
      totalCharacters: text.length,
      url,
    };
  }

  async ask(
    collectionId: string,
    question: string,
    nResults = 3,
  ): Promise<AskResult> {
    const collection = await this.chromaService.getCollection(collectionId);
    const queryEmbedding = await this.geminiService.generateEmbedding(question);

    const results = await this.chromaService.query(
      collection,
      queryEmbedding,
      Math.min(nResults, 5),
    );

    const context = results.documents[0]?.join("\n\n") || "";
    const sources =
      results.metadatas[0]?.map((m) => String(m?.source || "unknown")) || [];

    const answer = await this.geminiService.generateResponse(context, question);

    return {
      answer,
      sources: [...new Set(sources)],
      chunksUsed: results.documents[0]?.length || 0,
    };
  }
}
