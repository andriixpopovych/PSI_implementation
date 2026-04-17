import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from "class-validator";

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(1)
  guestCount!: number;
}
