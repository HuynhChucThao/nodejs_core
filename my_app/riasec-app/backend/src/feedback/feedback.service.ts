import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        userId,
        content: dto.content,
        rating: dto.rating,
      },
    });
  }

  async findAll() {
    return this.prisma.feedback.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
