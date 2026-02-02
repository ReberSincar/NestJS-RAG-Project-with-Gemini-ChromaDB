import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChromaClient, Collection } from "chromadb";

export interface ChunkMetadata {
  source: string;
  part: number;
  timestamp: string;
  filename?: string;
  url?: string;
  [key: string]: string | number | undefined;
}

@Injectable()
export class ChromaService {
  private readonly logger = new Logger(ChromaService.name);
  private readonly client: ChromaClient;

  constructor(private readonly configService: ConfigService) {
    const chromaUrl =
      this.configService.get<string>("CHROMA_URL") || "http://localhost:8000";
    this.client = new ChromaClient({ path: chromaUrl });
    this.logger.log(`ChromaDB client initialized: ${chromaUrl}`);
  }

  async getOrCreateCollection(name: string): Promise<Collection> {
    return this.client.getOrCreateCollection({ name });
  }

  async getCollection(name: string): Promise<Collection> {
    return this.client.getCollection({ name });
  }

  async addDocuments(
    collection: Collection,
    ids: string[],
    embeddings: number[][],
    documents: string[],
    metadatas: ChunkMetadata[],
  ): Promise<void> {
    await collection.add({
      ids,
      embeddings,
      documents,
      metadatas: metadatas as Record<string, string | number>[],
    });
  }

  async query(
    collection: Collection,
    queryEmbedding: number[],
    nResults: number,
  ): Promise<{
    documents: string[][];
    metadatas: Record<string, unknown>[][];
  }> {
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
    });

    return {
      documents: results.documents as string[][],
      metadatas: results.metadatas as Record<string, unknown>[][],
    };
  }

  async listCollections(): Promise<{ name: string }[]> {
    return this.client.listCollections();
  }

  async getCollectionInfo(name: string): Promise<{
    count: number;
    documents: (string | null)[];
    metadatas: (Record<string, unknown> | null)[];
  }> {
    const collection = await this.getCollection(name);
    const count = await collection.count();
    const peek = await collection.peek({ limit: 100 });

    return {
      count,
      documents: peek.documents,
      metadatas: peek.metadatas,
    };
  }

  async deleteCollection(name: string): Promise<void> {
    await this.client.deleteCollection({ name });
    this.logger.log(`Collection '${name}' deleted`);
  }
}
