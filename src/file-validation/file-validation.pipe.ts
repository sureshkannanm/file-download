import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.mimetype !== 'application/json') {
      throw new HttpException('Not a valid file', HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}
