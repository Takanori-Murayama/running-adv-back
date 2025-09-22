import { PartialType } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/create-user.dto';

export class AuthUserDto extends PartialType(UserDto) {}
