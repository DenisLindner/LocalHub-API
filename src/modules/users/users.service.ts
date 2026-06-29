import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

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
      this.logger.error('Error creating user: ' + error);
      throw new InternalServerErrorException('Error creating user');
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
      this.logger.error('Error finding user by email: ' + error);
      throw new InternalServerErrorException('Error finding user by email');
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
      this.logger.error('Error finding user by email: ' + error);
      throw new InternalServerErrorException('Error finding user by email');
    }
  }
}
