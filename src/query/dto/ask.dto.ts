import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
} from "class-validator";

export class AskDto {
  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  nResults?: number = 3;
}
