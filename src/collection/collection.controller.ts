import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ChromaService } from "../embedding/services/chroma.service";

@Controller("collections")
export class CollectionController {
  constructor(private readonly chromaService: ChromaService) {}

  @Get(":id")
  async getCollectionInfo(@Param("id") id: string) {
    const info = await this.chromaService.getCollectionInfo(id);

    return {
      name: id,
      documentCount: info.count,
      sampleDocuments: info.documents,
      sampleMetadata: info.metadatas,
    };
  }

  @Get()
  async listCollections() {
    const collections = await this.chromaService.listCollections();
    return { collections };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async deleteCollection(@Param("id") id: string) {
    await this.chromaService.deleteCollection(id);
    return { message: `Collection '${id}' deleted` };
  }
}
