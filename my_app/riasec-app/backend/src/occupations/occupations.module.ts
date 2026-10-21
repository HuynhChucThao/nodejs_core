import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { OccupationsController } from './occupations.controller';
import { OccupationsService } from './occupations.service';

@Module({
  imports: [PrismaModule],
  controllers: [OccupationsController],
  providers: [OccupationsService],
  exports: [OccupationsService],
})
export class OccupationsModule {}
