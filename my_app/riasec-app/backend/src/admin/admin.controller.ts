import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CurrentUser, JwtAuthGuard, RolesGuard, Roles } from '@myriasec/core-api';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
