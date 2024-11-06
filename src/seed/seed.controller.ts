import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('seed')
@ApiTags('Seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({summary: 'Initialize the database with the default roles and users'})
  @ApiResponse({status: 200, description: 'Seed executed'})
  executeSeed() {
    return this.seedService.executeSeed();
  }
}
