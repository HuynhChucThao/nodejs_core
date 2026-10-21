import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChatAiDto } from './dto/chat-ai.dto';

@Injectable()
export class AiConsultantService {
  private readonly logger = new Logger(AiConsultantService.name);

  constructor(private prisma: PrismaService) {}

  async chat(userId: string, dto: ChatAiDto) {
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Lấy thông tin người dùng và kết quả bài test gần nhất để làm giàu bối cảnh
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        testHistory: {
          orderBy: { testedAt: 'desc' },
          take: 1,
        },
      },
    });

    const latestTest = user?.testHistory?.[0];
    const riasecCode = latestTest?.resultCode || 'Chưa làm bài test';
    const dreamWork = user?.dreamWork || 'Chưa xác định';
    const userName = user?.name || 'Học sinh';

    // 2. Thiết lập System Instruction chuyên sâu về hướng nghiệp RIASEC
    const systemInstruction = `Bạn là Chuyên gia Tư vấn Hướng nghiệp AI chuyên nghiệp, tận tâm và thấu hiểu dành cho học sinh, sinh viên, dựa trên mô hình định hướng nghề nghiệp RIASEC của John Holland.
Thông tin học sinh:
- Tên: ${userName}
- Nghề nghiệp mơ ước: ${dreamWork}
- Kết quả trắc nghiệm RIASEC gần nhất: ${riasecCode}
(Mã RIASEC gồm 6 nhóm: R: Thực tế/Kỹ thuật, I: Nghiên cứu/Logic, A: Nghệ thuật/Sáng tạo, S: Xã hội/Giao tiếp, E: Quản lý/Lãnh đạo, C: Nghiệp vụ/Tổ chức).

Nhiệm vụ của bạn:
1. Lắng nghe, phân tích và đưa ra lời khuyên nghề nghiệp phù hợp với điểm mạnh, sở thích và nhóm RIASEC của học sinh.
2. Gợi ý các lộ trình học tập, ngành học và kỹ năng cần rèn luyện.
3. Trả lời bằng tiếng Việt, giọng điệu ấm áp, tích cực, truyền cảm hứng và định dạng rõ ràng, ngắn gọn, súc tích (dùng gạch đầu dòng, in đậm các điểm quan trọng).`;

    if (!apiKey) {
      this.logger.warn('Chưa cấu hình GEMINI_API_KEY trong .env');
      return {
        reply: `Xin chào **${userName}**! Tôi là Trợ lý Hướng nghiệp RIASEC AI.
Hiện tại hệ thống chưa cấu hình \`GEMINI_API_KEY\` trong \`.env\`.
Thông tin của bạn được ghi nhận:
- Nhóm tính cách RIASEC: **${riasecCode}**
- Nghề nghiệp mong muốn: **${dreamWork}**

Vui lòng bổ sung Google Gemini API Key vào file \`backend/.env\` để kích hoạt toàn bộ khả năng tư vấn trực tiếp của AI nhé!`,
      };
    }

    try {
      // 3. Chuẩn bị lịch sử trò chuyện
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (dto.history && dto.history.length > 0) {
        for (const msg of dto.history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }

      // Thêm câu hỏi hiện tại
      contents.push({
        role: 'user',
        parts: [{ text: dto.message }],
      });

      // 4. Gọi Google Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Gemini API Error: ${response.status} - ${errText}`);
        return {
          reply: 'Rất tiếc, máy chủ AI đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau ít phút nhé!',
        };
      }

      const data = await response.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Tôi đã nhận được câu hỏi nhưng chưa thể tạo câu trả lời. Bạn có thể hỏi lại được không?';

      return { reply };
    } catch (error: any) {
      this.logger.error('Lỗi khi gọi Gemini API:', error);
      return {
        reply: 'Đã xảy ra lỗi kết nối với trợ lý AI. Vui lòng kiểm tra lại mạng hoặc thử lại sau.',
      };
    }
  }
}
