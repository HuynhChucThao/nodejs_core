import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CoreAuthService, CurrentUser, JwtAuthGuard } from '@myriasec/core-api';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: CoreAuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register({...dto});
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
