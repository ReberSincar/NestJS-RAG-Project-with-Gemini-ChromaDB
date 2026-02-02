import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { EmbeddingController } from "./embedding.controller";
import {
  EmbeddingService,
  GeminiService,
  ChromaService,
  ContentExtractorService,
} from "./services";

@Module({
  imports: [
    MulterModule.register({
      dest: "./uploads",
    }),
  ],
  controllers: [EmbeddingController],
  providers: [
    EmbeddingService,
    GeminiService,
    ChromaService,
    ContentExtractorService,
  ],
  exports: [EmbeddingService, GeminiService, ChromaService],
})
export class EmbeddingModule {}
