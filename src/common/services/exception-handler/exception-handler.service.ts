import { ConflictException, Injectable } from '@nestjs/common';

const DUPLICATE_ENTRY_CODE = '23505';

@Injectable()
export class ExceptionHandlerService {
  handleException(exception: any) {
    if (exception.code === DUPLICATE_ENTRY_CODE) {
      throw new ConflictException(exception.detail);
    }
    throw exception;
  }
}
