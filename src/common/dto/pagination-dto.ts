import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  limit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @ApiProperty({
    example: 0,
    description: 'Number of items to skip',
    required: false,
  })
  offset: number;
}
