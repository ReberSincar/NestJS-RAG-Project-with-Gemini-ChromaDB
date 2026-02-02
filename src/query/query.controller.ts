import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { EmbeddingService } from "../embedding/services/embedding.service";
import { AskDto } from "./dto/ask.dto";

@Controller()
export class QueryController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Post("ask")
  @HttpCode(HttpStatus.OK)
  async ask(@Body() dto: AskDto) {
    const result = await this.embeddingService.ask(
      dto.collectionId,
      dto.question,
      dto.nResults,
    );

    return result;
  }
}
