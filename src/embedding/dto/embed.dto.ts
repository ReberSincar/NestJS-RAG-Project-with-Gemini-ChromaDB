import { IsString, IsOptional, IsUrl, IsNotEmpty } from "class-validator";

export class EmbedTextDto {
  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

export class EmbedWebsiteDto {
  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  metadata?: Record<string, string>;
}

export class EmbedFileDto {
  @IsString()
  @IsNotEmpty()
  collectionId: string;
}
