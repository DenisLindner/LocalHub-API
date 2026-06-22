import { Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: RegisterDto, passwordHash: string) {
    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
        },
      });
    } catch (error) {
      console.log('Error creating user: ' + error);
      throw new Error('Error creating user');
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          status: true,
        },
      });
    } catch (error) {
      console.log('Error finding user by email: ' + error);
      throw new Error('Error finding user by email');
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          status: true,
        },
      });
    } catch (error) {
      console.log('Error finding user by email: ' + error);
      throw new Error('Error finding user by email');
    }
  }
}
