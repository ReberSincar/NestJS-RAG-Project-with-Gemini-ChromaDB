import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmbeddingModule } from "./embedding/embedding.module";
import { CollectionModule } from "./collection/collection.module";
import { QueryModule } from "./query/query.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    EmbeddingModule,
    CollectionModule,
    QueryModule,
  ],
})
export class AppModule {}
