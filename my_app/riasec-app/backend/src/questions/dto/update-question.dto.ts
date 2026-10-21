import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['R', 'I', 'A', 'S', 'E', 'C'], {
    message: 'Loại câu hỏi phải là một trong các nhóm R, I, A, S, E, C',
  })
  type?: string;
}
