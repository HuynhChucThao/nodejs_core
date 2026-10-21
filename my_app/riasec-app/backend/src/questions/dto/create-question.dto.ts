import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  @IsString()
  content: string;

  @IsNotEmpty({ message: 'Loại câu hỏi RIASEC không được để trống' })
  @IsIn(['R', 'I', 'A', 'S', 'E', 'C'], {
    message: 'Loại câu hỏi phải là một trong các nhóm R, I, A, S, E, C',
  })
  type: string;
}
