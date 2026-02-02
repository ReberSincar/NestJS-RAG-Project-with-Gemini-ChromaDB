import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`
╔═══════════════════════════════════════════════════════════╗
║          🚀 NestJS RAG Server Started Successfully        ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        ${String(port).padEnd(42)}║
║  ChromaDB:    ${(process.env.CHROMA_URL || "http://localhost:8000").padEnd(42)}║
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(42)}║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
