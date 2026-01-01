import { PartialType } from '@nestjs/mapped-types';
import { RegisterAuthDto } from './auth-registeration.dto';

export class UpdateAuthDto extends PartialType(RegisterAuthDto) {}
