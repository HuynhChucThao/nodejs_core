import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const isHttp = exception instanceof HttpException;
        
        const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        // Lấy message: validation của Nest có thể trả về mảng => format lại 
        let message: string | string[] = 'Internal server error';

        if(isHttp) {
            const errorResponse = exception.getResponse();
            if(typeof errorResponse === 'string') {
                message = errorResponse;
            } else if(Array.isArray((errorResponse as any).message)) {
                message = (errorResponse as any).message.join(', ');
            } else {
                message = (errorResponse as any).message;
            }
        }

        // Lỗi 5xx thì ghi log kèm stack để debug, lỗi 4xx thì không cần 
        if (status >= 500){
            this.logger.error(
                `[${request.correlationId?.slice(0, 8)}] ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        } // Khi req có lỗi 500, dòng log HTTP và dòng log stack trace có cùng id, => dễ dàng nối chúng lại được.

        response.status(status).json({
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
            correlationId: request.correlationId, // <= cần để client có thể gửi log cho mình
        });
    }
}