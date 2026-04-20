import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { PlacementVariantType } from "../../generated/prisma/enums";

export class UpdatePlacementVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @IsUrl({
    require_tld: false,
  })
  @MaxLength(1000)
  photoUrl?: string;

  @IsOptional()
  @IsEnum(PlacementVariantType)
  type?: PlacementVariantType;

  @IsOptional()
  @IsInt()
  @Min(1)
  guests?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pricePerNight?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pricePerMonth?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
