// Service không biết tên app là gì, nó chỉ nhận qua HEALTH_OPTIONS. 
// Đây là nguyên lý cốt lỗi của core

import { Inject, Injectable, Version } from "@nestjs/common";
import { HealthModuleOptions } from "./health.interfaces";
import { HEALTH_OPTIONS } from "./health.constants";

@Injectable()
export class HealthService {
    constructor(
        @Inject(HEALTH_OPTIONS) private readonly options: HealthModuleOptions,
    ) { }

    check() {
        return {
            status: 'ok',
            app: this.options.appName,
            version: this.options.version ?? 'unknown',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        }
    }
}