import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/common/email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'jwt_secret_key', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserService, EmailService],
  controllers: [UserController],
})
export class UserModule {}
