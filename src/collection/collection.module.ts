import { Module } from "@nestjs/common";
import { CollectionController } from "./collection.controller";
import { EmbeddingModule } from "../embedding/embedding.module";

@Module({
  imports: [EmbeddingModule],
  controllers: [CollectionController],
})
export class CollectionModule {}
