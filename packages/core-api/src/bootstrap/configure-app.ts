import { INestApplication, ValidationPipe, ValidationPipeOptions } from "@nestjs/common";

export interface ConfigureAppOptions {
    // Tiền tố route, ví dụ 'api'. Bỏ trống = không có tiền tố 
    globalPrefix?: string;

    // Định nghĩa các origin được phép truy cập (bảo vệ CORS)
    // Chuỗi origin cách nhau dấu phẩy, '*' = tất cả, rỗng = không bật CORS
    corsOrigins?: string;

    // Tùy chọn ValidationPipe. false = không dùng
    validation?: ValidationPipeOptions | false;
}

export function configureApp(
    app: INestApplication, 
    options: ConfigureAppOptions = {},) {
    if (options.globalPrefix) {
        app.setGlobalPrefix(options.globalPrefix);
    }
    const origins = (options.corsOrigins ?? '').trim();
    if (origins === '*') {
        app.enableCors()
    } else {
        app.enableCors({
            origin: origins.split(',').map((o) => o.trim()).filter(Boolean),
            credentials: true,
        });
    }
    if (options.validation !== false) {
        app.useGlobalPipes(new ValidationPipe({ transform: true, ...options.validation }));
    }
}