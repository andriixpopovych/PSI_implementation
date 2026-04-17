import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { ListingStatus } from '../../generated/prisma/enums';

export class UpdateObjectStatusDto {
  @IsEnum(ListingStatus)
  status!: ListingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
