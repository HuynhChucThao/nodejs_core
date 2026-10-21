import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: any, res: any, next: () => void) {
        const start = Date.now();

        // Dùng id do client/gateway gửi lên nếu có, không thì tự tạo
        const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();
        req.correlationId = correlationId; // Gắn correlationId vào req để các nới khác (filter, service) dừng lại được.
        res.setHeader(CORRELATION_ID_HEADER, correlationId); // Trả id về qua header x-corre..., nên khi người dùng báo lỗi => xin họ id đó.

        res.on('finish', () => { // chạy sau khi response đã gửi xong, nên mới biết mã trạng thái và thời gian thật.
            const ms = Date.now() - start;
            const line = `[${correlationId.slice(0, 8)}] ${req.method} ${req.originalUrl} - ${res.statusCode} ${ms}ms`;

            if (res.statusCode >= 500) {
                this.logger.error(line);
            } else if (res.statusCode >= 400) {
                this.logger.warn(line);
            } else {
                this.logger.log(line);
            }
        })
        next();
    }
}