import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpStatus,
  Res,
  Patch
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('approve/:id')
  async approve(@Param('id') id: number): Promise<any> {
      // Memanggil metode approve dari UserService
      const approvedUser = await this.userService.approve(id);
      
      return {
        acknowledge: true,
        message: 'User successfully approved',
        data: approvedUser,
        statusCode: HttpStatus.OK,
      };
  } 

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const user = await this.userService.register(dto);
    return {
      acknowledge: true,
      message: 'User registered successfully',
      data: user,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.userService.login(dto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false, // Set to true in production
      sameSite: 'lax',
      maxAge: 1 * 60 * 1000, // 1 jam
    });

    return {
      acknowledge: true,
      message: 'Login successful',
      data: null,
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return {
      acknowledge: true,
      message: 'List of users retrieved',
      data: users,
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    const user = await this.userService.findById(id);
    return {
      acknowledge: true,
      message: 'User retrieved successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.userService.remove(id);
    return {
      acknowledge: true,
      message: 'User deleted successfully',
      data: null,
      statusCode: HttpStatus.OK,
    };
  }
}
