import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @IsString()
  @ApiProperty({
    example: 'Inception',
    description: 'Movie title',
    required: true,
  })
  title: string;

  @IsString()
  @ApiProperty({
    example: 'Christopher Nolan',
    description: 'Movie director',
    required: true,
  })
  director: string;

  @IsString()
  @ApiProperty({
    description: 'Movie opening',
    example: 'Inception is a science fiction film directed by Christopher Nolan and released in 2010.',
  })
  opening: string;

  @IsString()
  @ApiProperty({
    description: 'Movie producer',
    example: 'Warner Bros.',
  })
  producer: string;

  @IsString()
  @ApiProperty({
    description: 'Movie release date',
    example: '2010-01-01',
    required: true,
  })
  releaseDate: string;
}
