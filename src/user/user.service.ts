import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Registering user with email: ${dto.email}`);

      // Check if email already exists
      const existingUser = await this.userRepo.findOne({ where: { email: dto.email, statusData: true } });
      if (existingUser) {
        this.logger.warn(`Email already registered: ${dto.email}`);
        throw new HttpException('Email already registered', HttpStatus.CONFLICT);        
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
      throw error;
    }
  }

  async login(dto: LoginUserDto): Promise<{ access_token: string }> {
    try {
      this.logger.log(`Login attempt for email: ${dto.email}`);
  
      const user = await this.userRepo.findOne({ where: { email: dto.email } });
  
      if (!user) {
        this.logger.warn(`Login failed: User not found for email ${dto.email}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);        
      }
  
      // 🔒 Validasi statusData dan isVerified
      if (!user.statusData) {
        this.logger.warn(`Login blocked: User statusData is false for ${dto.email}`);
        throw new HttpException('User is not active', HttpStatus.CONFLICT);
      }
  
      if (!user.isVerified) {
        this.logger.warn(`Login blocked: User not verified for ${dto.email}`);
        throw new HttpException('User is not verified', HttpStatus.CONFLICT);
      }
  
      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        this.logger.warn(`Login failed: Incorrect password for ${dto.email}`);
        throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
      }
  
      const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
      const token = this.jwtService.sign(payload);
  
      this.logger.log(`User logged in successfully: ${user.email}`);
      return { access_token: token };
    } catch (error) {
      this.logger.error(`Login error for ${dto.email}: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Retrieving all active users');
      return await this.userRepo.find({
        where: { statusData: true },
        order: {
          isVerified: 'ASC',
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      throw error;
    }
  }
  

  async findById(id: number): Promise<User> {
    try {
      this.logger.log(`Retrieving user by ID: ${id}`);
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error retrieving user ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Soft deleting user with ID: ${id}`);
  
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      user.statusData = false;
      await this.userRepo.save(user);
  
      this.logger.log(`User with ID ${id} marked as inactive (soft deleted)`);
    } catch (error) {
      this.logger.error(`Error soft deleting user ${id}: ${error.message}`);
      throw error;
    }
  }

  async approve(id: number): Promise<User> {
    try {
      this.logger.log(`Approving user with ID: ${id}`);
      
      // Cari user berdasarkan ID
      const user = await this.userRepo.findOne({ where: { id } });
      
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      // Cek apakah user sudah terverifikasi
      if (user.isVerified) {
        this.logger.warn(`User with ID ${id} is already verified`);
        throw new HttpException('User is already verified', HttpStatus.CONFLICT);
      }
  
      // Ubah status isVerified menjadi true
      user.isVerified = true;
  
      // Simpan perubahan ke database
      await this.userRepo.save(user);
      
      this.logger.log(`User with ID ${id} has been successfully approved`);
  
      // Kirim email notifikasi approval
      try {
        await this.emailService.sendAccountApproval(
          user.email,
          user.name,
          'https://nicatra.my.id' // Ganti dengan URL login aplikasi Anda
        );
        this.logger.log(`Approval email sent successfully to ${user.email}`);
      } catch (emailError) {
        // Log error tapi jangan gagalkan proses approval
        this.logger.error(`Failed to send approval email to ${user.email}: ${emailError.message}`);
      }
  
      return user; // Kembalikan user yang sudah diperbarui
    } catch (error) {
      this.logger.error(`Error approving user with ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
