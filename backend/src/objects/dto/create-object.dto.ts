import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsArray,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { PlacementVariantType, PropertyType } from '../../generated/prisma/enums';

export class CreatePlacementVariantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @IsUrl({
    require_tld: false,
  })
  @MaxLength(1000)
  photoUrl?: string;

  @IsEnum(PlacementVariantType)
  type!: PlacementVariantType;

  @IsInt()
  @Min(1)
  guests!: number;

  @IsInt()
  @Min(0)
  bedrooms!: number;

  @IsInt()
  @Min(0)
  bathrooms!: number;

  @IsInt()
  @Min(1)
  pricePerNight!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pricePerMonth?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateObjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(PropertyType)
  type!: PropertyType;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  country!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(240)
  address!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePlacementVariantDto)
  initialVariant?: CreatePlacementVariantDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePlacementVariantDto)
  variants?: CreatePlacementVariantDto[];
}
