import { Module } from "@nestjs/common";
import { QueryController } from "./query.controller";
import { EmbeddingModule } from "../embedding/embedding.module";

@Module({
  imports: [EmbeddingModule],
  controllers: [QueryController],
})
export class QueryModule {}
