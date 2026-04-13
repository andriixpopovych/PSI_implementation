import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
} from "class-validator";

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(1)
  guestCount!: number;
}
