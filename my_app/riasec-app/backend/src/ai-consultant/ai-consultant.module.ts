import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { AiConsultantController } from './ai-consultant.controller';
import { AiConsultantService } from './ai-consultant.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiConsultantController],
  providers: [AiConsultantService],
  exports: [AiConsultantService],
})
export class AiConsultantModule {}
