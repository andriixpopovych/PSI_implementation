import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { PropertyType } from '../../generated/prisma/enums';

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
}
