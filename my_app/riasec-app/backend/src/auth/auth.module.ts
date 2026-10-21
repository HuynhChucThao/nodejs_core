import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthCoreModule } from '@myriasec/core-api';
import { PrismaModule } from '../prisma.module';
import { AuthController } from './auth.controller';
import { PrismaUserStore } from './prisma-user.store';

@Module({
  imports: [
    AuthCoreModule.forRootAsync({
      imports: [ConfigModule, PrismaModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        jwtSecret: config.getOrThrow<string>('JWT_SECRET'),
      }),
      userStore: PrismaUserStore,
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}