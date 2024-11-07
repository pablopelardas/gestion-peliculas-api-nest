import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('movies')
@Unique('UQ_TITLE_DIRECTOR',['title', 'director'])
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    example: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
    description: 'Unique identifier',
  })
  id: string;

  @Column('text')
  @ApiProperty({
    example: 'Inception',
    description: 'Movie title',
    required: true,
  })
  title: string;

  @Column('text')
  @ApiProperty({
    example: 'Christopher Nolan',
    description: 'Movie director',
    required: true,
  })
  director: string;

  @Column('text', {
    nullable: true,
  })
  @ApiProperty({
    description: 'Movie opening',
    example: 'Inception is a science fiction film directed by Christopher Nolan and released in 2010.',
  })
  opening: string;

  @ApiProperty({
    description: 'Movie producer',
    example: 'Warner Bros.',
  })
  @Column('text', {
    nullable: true,
  })
  producer: string;

  @Column('text')
  @ApiProperty({
    description: 'Movie release date',
    example: '2010-01-01',
    required: true,
  })
  releaseDate: string;

  @ApiProperty({
    description: 'Movie created date',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Movie updated date',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Movie deleted date',
    example: '2023-01-01T00:00:00.000Z',
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
