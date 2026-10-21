import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: string) {
    return this.prisma.question.findMany({
      where: type ? { type: type.toUpperCase() } : {},
      orderBy: { createdAt: 'asc' },
    });
  }
  async findBalancedTestSet(perType: number = 7) {
    const RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'];

    // Lấy toàn bộ câu hỏi của cả 6 nhóm cùng lúc
    const groups = await Promise.all(
      RIASEC_TYPES.map((type) =>
        this.prisma.question.findMany({ where: { type } }),
      ),
    );

    // Với mỗi nhóm: xáo trộn ngẫu nhiên, rồi lấy đúng `perType` câu đầu
    const selected = groups.flatMap((group, idx) => {
      const shuffled = [...group].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, perType);

      // Cảnh báo nếu 1 nhóm không đủ số câu yêu cầu
      if (picked.length < perType) {
        console.warn(
          `Nhóm ${RIASEC_TYPES[idx]} chỉ có ${picked.length}/${perType} câu hỏi trong database.`,
        );
      }
      return picked;
    });

    // Xáo trộn lại toàn bộ 42 câu để không bị xếp theo từng khối R-I-A-S-E-C liên tiếp
    return selected.sort(() => Math.random() - 0.5);
  }
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID ${id}`);
    }
    return question;
  }

  async create(dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        content: dto.content,
        type: dto.type.toUpperCase(),
      },
    });
  }

  async update(id: string, dto: UpdateQuestionDto) {
    await this.findOne(id);
    return this.prisma.question.update({
      where: { id },
      data: {
        ...(dto.content && { content: dto.content }),
        ...(dto.type && { type: dto.type.toUpperCase() }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.question.delete({
      where: { id },
    });
  }
}
