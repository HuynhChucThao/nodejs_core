import { DynamicModule, MiddlewareConsumer, Module, ValidationPipe } from "@nestjs/common";
import { HealthModuleOptions } from "./health/health.interfaces";
import { HealthModule } from "./health/health.module";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { RequestLoggerMiddleware } from "./logger/request-logger.middleware";

export interface CoreModuleOptions {
    health: HealthModuleOptions;
    wrapResponse?: boolean; // Mặc định true
    requestLogging?: boolean; // Mặc định true
}

@Module({})
export class CoreModule {
    static forRoot(options: CoreModuleOptions): DynamicModule {
        const providers: any[] = [
            {
                provide: APP_FILTER,
                useClass: AllExceptionsFilter,
            },
        ];
        if (options.wrapResponse !== false) {
            providers.push({ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor })
        }
        return {
            module: CoreModule,
            imports: [
                HealthModule.forRoot(options.health),
            ],
            providers
        };
    }
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
}