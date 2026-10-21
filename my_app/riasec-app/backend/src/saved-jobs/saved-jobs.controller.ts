import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '@myriasec/core-api';
import { SavedJobsService } from './saved-jobs.service';

@UseGuards(JwtAuthGuard)
@Controller('saved-jobs')
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) { }

  @Post(':occupationId')
  toggleSave(
    @CurrentUser('id') userId: string,
    @Param('occupationId', ParseIntPipe) occupationId: number,
  ) {
    return this.savedJobsService.toggleSave(userId, occupationId);
  }

  @Get()
  getSavedJobs(@CurrentUser('id') userId: string) {
    return this.savedJobsService.getSavedJobs(userId);
  }
}
