import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role])
  ],
  exports: [
    TypeOrmModule
  ]
})
export class AuthModule {}
