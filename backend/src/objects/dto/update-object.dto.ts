import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateObjectDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(240)
  address?: string;
}
