import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalStudents,
      totalTests,
      totalOccupations,
      feedbacks,
      recentTests,
      allTests,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.testHistory.count(),
      this.prisma.occupation.count(),
      this.prisma.feedback.findMany({ select: { rating: true } }),
      this.prisma.testHistory.findMany({
        take: 5,
        orderBy: { testedAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.testHistory.findMany({ select: { resultCode: true } }),
    ]);

    // Tính điểm đánh giá trung bình
    const averageRating = feedbacks.length > 0
      ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
      : '5.0';

    // Thống kê phân bố 6 nhóm RIASEC dựa trên chữ cái đầu tiên của resultCode
    const distribution: Record<string, number> = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    };

    allTests.forEach(test => {
      const primary = test.resultCode?.[0]?.toUpperCase();
      if (primary && distribution[primary] !== undefined) {
        distribution[primary]++;
      }
    });

    return {
      overview: {
        totalUsers,
        totalStudents,
        totalTests,
        totalOccupations,
        averageRating: parseFloat(averageRating),
        totalFeedbacks: feedbacks.length,
      },
      riasecDistribution: distribution,
      recentTests,
    };
  }
}
