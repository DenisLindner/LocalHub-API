import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { RefreshTokenPayload } from './types/refresh-token-payload';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: RefreshTokenPayload) {
    return this.authService.refresh(user);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  async logout(@CurrentUser('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
