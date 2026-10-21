import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SavedJobsService {
  constructor(private prisma: PrismaService) {}

  async toggleSave(userId: string, occupationId: number) {
    const occupation = await this.prisma.occupation.findUnique({
      where: { id: occupationId },
    });

    if (!occupation) {
      throw new NotFoundException('Không tìm thấy nghề nghiệp này');
    }

    const existing = await this.prisma.savedJob.findUnique({
      where: {
        userId_occupationId: {
          userId,
          occupationId,
        },
      },
    });

    if (existing) {
      await this.prisma.savedJob.delete({
        where: { id: existing.id },
      });
      return { isSaved: false, message: 'Đã bỏ lưu nghề nghiệp' };
    } else {
      await this.prisma.savedJob.create({
        data: {
          userId,
          occupationId,
        },
      });
      return { isSaved: true, message: 'Đã lưu nghề nghiệp thành công' };
    }
  }

  async getSavedJobs(userId: string) {
    const savedJobs = await this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        occupation: true,
      },
      orderBy: { savedAt: 'desc' },
    });

    return savedJobs.map(item => ({
      savedAt: item.savedAt,
      occupation: {
        id: item.occupation.id,
        jobName: item.occupation.jobName,
        description: item.occupation.description,
        riasecCode: item.occupation.riasecCode,
        mainCode: item.occupation.mainCode,
        education: item.occupation.education,
        imageName: item.occupation.imageName,
        viewCount: item.occupation.viewCount,
      },
    }));
  }
}
