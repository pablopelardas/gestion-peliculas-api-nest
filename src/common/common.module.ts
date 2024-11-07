import { Module } from '@nestjs/common';
import { ExceptionHandlerService } from './services/exception-handler/exception-handler.service';

@Module({
  providers: [ExceptionHandlerService],
  exports: [ExceptionHandlerService],
})
export class CommonModule {}
