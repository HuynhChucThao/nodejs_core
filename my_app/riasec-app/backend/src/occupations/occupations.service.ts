import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateOccupationDto,
  UpdateOccupationDto,
} from './dto/occupations.dto';

@Injectable()
export class OccupationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOccupationDto) {
    return this.prisma.occupation.create({
      data: {
        jobName: dto.jobName,
        description: dto.description,
        riasecCode: dto.riasecCode,
        mainCode: dto.mainCode,
        education: dto.education,
        taskRaw: dto.taskRaw.join('|'),
        skillsRaw: dto.skillRaw.join('|'),
      },
    });
  }

  async update(id: number, dto: UpdateOccupationDto) {
    await this.findOne(id);
    return this.prisma.occupation.update({
      where: { id },
      data: {
        jobName: dto.jobName,
        description: dto.description,
        riasecCode: dto.riasecCode,
        mainCode: dto.mainCode,
        education: dto.education,
        taskRaw: dto.taskRaw.join('|'),
        skillsRaw: dto.skillRaw.join('|'),
      },
    });
  }
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.occupation.delete({
      where: { id },
    });
  }
  async findAll(params: {
    keyword?: string;
    riasecCode?: string;
    mainCode?: string;
    page?: number;
    limit?: number;
  }) {
    const { keyword, riasecCode, mainCode, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (keyword && keyword.trim()) {
      where.OR = [
        { jobName: { contains: keyword.trim() } },
        { description: { contains: keyword.trim() } },
      ];
    }

    if (mainCode && mainCode.trim()) {
      where.mainCode = mainCode.trim().toUpperCase();
    }

    if (riasecCode && riasecCode.trim()) {
      where.riasecCode = { contains: riasecCode.trim().toUpperCase() };
    }

    const [total, items] = await Promise.all([
      this.prisma.occupation.count({ where }),
      this.prisma.occupation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ viewCount: 'desc' }, { jobName: 'asc' }],
      }),
    ]);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      items: items.map((item) => this.formatOccupation(item)),
    };
  }

  async findOne(id: number, userId?: string) {
    const occupation = await this.prisma.occupation.findUnique({
      where: { id },
      include: {
        savedBy: userId ? { where: { userId } } : false,
      },
    });

    if (!occupation) {
      throw new NotFoundException(`Không tìm thấy nghề nghiệp có ID ${id}`);
    }

    // Tăng lượt xem
    await this.prisma.occupation.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const isSaved = userId
      ? occupation.savedBy && occupation.savedBy.length > 0
      : false;

    return {
      ...this.formatOccupation(occupation),
      viewCount: occupation.viewCount + 1,
      isSaved,
    };
  }

  private formatOccupation(occupation: any) {
    const tasks = occupation.taskRaw
      ? occupation.taskRaw
          .split('|')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];
    const skills = occupation.skillsRaw
      ? occupation.skillsRaw
          .split('|')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    return {
      id: occupation.id,
      jobName: occupation.jobName,
      description: occupation.description,
      riasecCode: occupation.riasecCode,
      mainCode: occupation.mainCode,
      interestId: occupation.interestId,
      education: occupation.education,
      imageName: occupation.imageName,
      viewCount: occupation.viewCount,
      tasks,
      skills,
    };
  }
}
