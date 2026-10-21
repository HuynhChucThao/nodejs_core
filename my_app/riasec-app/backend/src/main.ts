import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureApp } from '@myriasec/core-api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app, {
    // 1. Cấu hình tiền tố toàn cục /api
    globalPrefix: 'api',
    corsOrigins: config.get<string>('FRONTEND_URL'),

  });
  await app.listen(config.get<number>('PORT', 3000))


  // // 2. Kích hoạt Validation tự động cho các DTO
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     transform: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );

  // // 3. Cho phép CORS kết nối từ React Vite Frontend
  // const configuredOrigins = process.env.FRONTEND_URL
  //   ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  //   : [];

  // const defaultOrigins = [
  //   'http://localhost:5173',
  //   'http://127.0.0.1:5173',
  //   'http://localhost:3000',
  // ];

  // app.enableCors({
  //   origin: (origin, callback) => {
  //     if (!origin) return callback(null, true);

  //     const allowedOrigins = [...defaultOrigins, ...configuredOrigins];
  //     const isAllowedList = allowedOrigins.includes(origin);
  //     const isVercelPreview = /\.vercel\.app$/.test(origin);

  //     if (
  //       isAllowedList ||
  //       isVercelPreview ||
  //       process.env.FRONTEND_URL === '*' ||
  //       process.env.NODE_ENV !== 'production'
  //     ) {
  //       return callback(null, true);
  //     }
  //     return callback(new Error(`Origin ${origin} not allowed by CORS`));
  //   },
  //   credentials: true,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type,Accept,Authorization',
  // });

  // const port = process.env.PORT ?? 3000;
  // await app.listen(port);
  // console.log(`RIASEC Backend đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
