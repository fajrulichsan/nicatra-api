import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpStatus,
  Res,
  Patch,
  Req
} from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as jwt from 'jsonwebtoken';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Not logged in',
        data: null,
        acknowledge: false,
      });
    }

    try {
      const decoded = jwt.verify(token, 'jwt_secret_key');
      return res.status(HttpStatus.OK).json({
        message: 'User authenticated',
        data: decoded,
        acknowledge: true,
      });
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid token',
        data: null,
        acknowledge: false,
      });
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    // Menghapus cookie access_token
    console.log('Logging out, clearing access_token cookie'); 
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,      
      sameSite: 'lax',   
    });

    return res.status(HttpStatus.OK).json({
      message: 'Logged out successfully',
      acknowledge: true,
    });
  }

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
      secure: true, // Set to true in production
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
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
