import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types/tokens';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token/token.service';
import { UserStatus } from 'src/generated/prisma/enums';
import { hashRefreshToken } from './hashing/sha.service';
import { TokenPayload } from './types/token-payload';
import { RefreshTokenPayload } from './types/refresh-token-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<Tokens> {
    const userExisting = await this.usersService.findByEmail(dto.email);

    if (userExisting) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashingService.hash(dto.password);
    const user = await this.usersService.create(dto, passwordHash);
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    await this.tokenService.create(
      hashRefreshToken(tokens.refreshToken),
      user.id,
    );

    return tokens;
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await this.hashingService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    await this.tokenService.create(
      hashRefreshToken(tokens.refreshToken),
      user.id,
    );

    return tokens;
  }

  async refresh(payload: RefreshTokenPayload): Promise<Tokens> {
    if (!payload.refreshToken) {
      throw new NotFoundException('Refresh token not found');
    }

    const refresh = await this.tokenService.findByTokenHash(
      hashRefreshToken(payload.refreshToken),
    );

    if (!refresh) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (refresh.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (refresh.expiresAt < new Date(Date.now())) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersService.findById(refresh.userId);

    if (!user) {
      throw new UnauthorizedException('Refresh token user invalid');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Refresh token user is not active');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });

    await this.tokenService.rotateToken(
      hashRefreshToken(payload.refreshToken),
      hashRefreshToken(tokens.refreshToken),
      user.id,
    );

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeToken(hashRefreshToken(refreshToken));
  }

  private async generateTokens(payload: TokenPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('auth.accessSecret'),
        expiresIn: this.configService.getOrThrow('auth.expireAccess'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('auth.refreshSecret'),
        expiresIn: this.configService.getOrThrow('auth.expireRefresh'),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
