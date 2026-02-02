import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { EmbeddingService } from "./services/embedding.service";
import { EmbedTextDto, EmbedWebsiteDto, EmbedFileDto } from "./dto";

const multerOptions = {
  storage: diskStorage({
    destination: "./uploads",
    filename: (_, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (
    _: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedExtensions = [".pdf", ".txt"];
    const ext = extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new BadRequestException("Only PDF and TXT files are allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@Controller("embed")
export class EmbeddingController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Post("text")
  @HttpCode(HttpStatus.OK)
  async embedText(@Body() dto: EmbedTextDto) {
    const result = await this.embeddingService.embedText(
      dto.collectionId,
      dto.text,
      dto.metadata,
    );

    return {
      message: `${result.chunksProcessed} chunks embedded successfully`,
      ...result,
    };
  }

  @Post("pdf")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async embedPDF(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: EmbedFileDto,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const result = await this.embeddingService.embedPDF(
      dto.collectionId,
      file.path,
      file.originalname,
    );

    return {
      message: `PDF processed: ${result.chunksProcessed} chunks embedded`,
      ...result,
    };
  }

  @Post("txt")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async embedTXT(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: EmbedFileDto,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const result = await this.embeddingService.embedTXT(
      dto.collectionId,
      file.path,
      file.originalname,
    );

    return {
      message: `TXT file processed: ${result.chunksProcessed} chunks embedded`,
      ...result,
    };
  }

  @Post("website")
  @HttpCode(HttpStatus.OK)
  async embedWebsite(@Body() dto: EmbedWebsiteDto) {
    const result = await this.embeddingService.embedWebsite(
      dto.collectionId,
      dto.url,
      dto.metadata,
    );

    return {
      message: `Website processed: ${result.chunksProcessed} chunks embedded`,
      ...result,
    };
  }
}
