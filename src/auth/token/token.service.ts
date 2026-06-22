import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/prisma.service';
import ms, { StringValue } from 'ms';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(tokenHash: string, userId: string) {
    try {
      await this.prisma.refreshToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt: this.getRefreshTokenExpiresAt(),
        },
      });
    } catch (error) {
      console.log('Error saving Refresh Token: ' + error);
      throw new InternalServerErrorException('Error saving Refresh Token');
    }
  }

  async findByTokenHash(tokenHash: string) {
    try {
      return await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        select: {
          tokenHash: true,
          expiresAt: true,
          revokedAt: true,
          userId: true,
        },
      });
    } catch (error) {
      console.log('Error getting Refresh Token: ' + error);
      throw new InternalServerErrorException('Error getting Refresh Token');
    }
  }

  async revokeToken(tokenHash: string) {
    const revokedAt = new Date(Date.now());
    try {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: {
          revokedAt,
        },
      });
    } catch (error) {
      console.log('Error updating Refresh Token: ' + error);
      throw new InternalServerErrorException('Error updating Refresh Token');
    }
  }

  private getRefreshTokenExpiresAt(): Date {
    const expiresIn =
      this.configService.getOrThrow<StringValue>('auth.expireRefresh');

    const milliseconds = ms(expiresIn);

    if (typeof milliseconds !== 'number') {
      throw new InternalServerErrorException('Invalid JWT Refresh Expires');
    }

    return new Date(Date.now() + Number(milliseconds));
  }
}
