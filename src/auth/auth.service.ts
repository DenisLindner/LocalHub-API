import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types/tokens';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService, 
        private readonly hashingService: HashingService, 
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(dto: RegisterDto): Promise<Tokens> {
        const userExisting = await this.usersService.findByEmail(dto.email);

        if (userExisting) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await this.hashingService.hash(dto.password);
        const user = await this.usersService.create(dto, passwordHash);
        const tokens = await this.generateTokens(user.id, user.email);

        return tokens;
    }

    async login(dto: LoginDto): Promise<Tokens> {
        const user = await this.usersService.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await this.hashingService.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = await this.generateTokens(user.id, user.email);


        return tokens;
    }

    private async generateTokens(userId: string, email: string): Promise<Tokens> {
        const payload = { sub: userId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow<string>('auth.accessSecret'),
                expiresIn: this.configService.getOrThrow('auth.refreshSecret'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow<string>('auth.expireAccess'),
                expiresIn: this.configService.getOrThrow('auth.expireRefresh'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
}
