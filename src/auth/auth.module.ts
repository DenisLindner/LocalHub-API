import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [UsersModule, JwtModule.register({}), DatabaseModule],
  providers: [AuthService, { provide: HashingService, useClass: BcryptService }],
  controllers: [AuthController]
})
export class AuthModule {}
