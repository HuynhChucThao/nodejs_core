import { Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }
  
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        dreamWork: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            savedJobs: true,
            testHistory: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.dreamWork !== undefined && { dreamWork: dto.dreamWork }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        dreamWork: true,
        avatarUrl: true,
      },
    });
  }

  async findAllUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search } },
              { name: { contains: search } },
            ],
          }
        : {},
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        dreamWork: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            testHistory: true,
            savedJobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const nextStatus = user.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: nextStatus },
      select: { id: true, email: true, status: true },
    });
  }
}
