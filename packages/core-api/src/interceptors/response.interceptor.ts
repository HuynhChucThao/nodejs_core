import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    timestamp: string;
    data?: T;
}
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        return next.handle().pipe( // next.handle() Chạy controller, .pipe(map(...)) bọc kết quả của nó
            map((data) => ({
                success: true,
                statusCode: context.switchToHttp().getResponse().statusCode,
                timestamp: new Date().toISOString(),
                data,
            }))
        );
    }
}