import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Registering user with email: ${dto.email}`);

      // Check if email already exists
      const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existingUser) {
        this.logger.warn(`Email already registered: ${dto.email}`);
        throw new ConflictException('Email already registered');
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = this.userRepo.create({ ...dto, password: hashedPassword });

      // Save the new user
      const savedUser = await this.userRepo.save(user);

      this.logger.log(`User registered successfully: ${savedUser.email}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Register error for ${dto.email}: ${error.message}`);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(dto: LoginUserDto): Promise<{ access_token: string }> {
    try {
      this.logger.log(`Login attempt for email: ${dto.email}`);
  
      const user = await this.userRepo.findOne({ where: { email: dto.email } });
  
      if (!user) {
        this.logger.warn(`Login failed: User not found for email ${dto.email}`);
        throw new UnauthorizedException('User not found');
      }
  
      // 🔒 Validasi statusData dan isVerified
      if (!user.statusData) {
        this.logger.warn(`Login blocked: User statusData is false for ${dto.email}`);
        throw new UnauthorizedException('User is not active');
      }
  
      if (!user.isVerified) {
        this.logger.warn(`Login blocked: User not verified for ${dto.email}`);
        throw new UnauthorizedException('User is not verified');
      }
  
      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        this.logger.warn(`Login failed: Incorrect password for ${dto.email}`);
        throw new UnauthorizedException('Invalid password');
      }
  
      const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
      const token = this.jwtService.sign(payload);
  
      this.logger.log(`User logged in successfully: ${user.email}`);
      return { access_token: token };
    } catch (error) {
      this.logger.error(`Login error for ${dto.email}: ${error.message}`);
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('Login failed');
    }
  }


  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Retrieving all active users');
      return await this.userRepo.find({
        where: { statusData: true },
      });
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      throw new InternalServerErrorException('Could not fetch users');
    }
  }
  

  async findById(id: number): Promise<User> {
    try {
      this.logger.log(`Retrieving user by ID: ${id}`);
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(`Error retrieving user ${id}: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Could not fetch user');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Soft deleting user with ID: ${id}`);
  
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException('User not found');
      }
  
      user.statusData = false;
      await this.userRepo.save(user);
  
      this.logger.log(`User with ID ${id} marked as inactive (soft deleted)`);
    } catch (error) {
      this.logger.error(`Error soft deleting user ${id}: ${error.message}`);
      throw new InternalServerErrorException('Could not remove user');
    }
  }
  
}
