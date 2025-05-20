// create-user.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty() 
  name: string;

  @IsNotEmpty() 
  nipp: string;

  @IsNotEmpty() 
  position: string;

  @IsEmail() 
  email: string;

  @IsNotEmpty() 
  password: string;
}
