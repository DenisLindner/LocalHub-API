import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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

  async rotateToken(tokenRevoke: string, tokenCreate: string, userId: string) {
    const now = new Date(Date.now());
    await this.prisma.$transaction(async (tx) => {
      const revokedToken = await tx.refreshToken.updateMany({
        where: {
          tokenHash: tokenRevoke,
          userId,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          revokedAt: now,
        },
      });

      if (revokedToken.count !== 1) {
        throw new UnauthorizedException('Refresh token invalid');
      }

      await tx.refreshToken.create({
        data: {
          userId,
          tokenHash: tokenCreate,
          expiresAt: this.getRefreshTokenExpiresAt(),
        },
      });
    });
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
