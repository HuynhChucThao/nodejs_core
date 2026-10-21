import { DynamicModule, Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { HEALTH_OPTIONS } from "./health.constants";
import { HealthModuleOptions } from "./health.interfaces";

@Module({})
export class HealthModule {
    static forRoot(options: HealthModuleOptions): DynamicModule {
        return {
            module: HealthModule,
            providers: [
                HealthService,
                {
                    provide: HEALTH_OPTIONS,
                    useValue: options,
                }
            ],
            controllers: [
                HealthController
            ],
            exports: [HealthService],
        };
    }
}