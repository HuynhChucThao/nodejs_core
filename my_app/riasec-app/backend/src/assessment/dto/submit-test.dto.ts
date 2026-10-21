import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from 'class-validator';

export class AnswerItemDto {
  @IsNotEmpty({ message: 'ID câu hỏi không được để trống' })
  @IsString()
  questionId: string;

  @IsInt()
  @Min(1, { message: 'Điểm tối thiểu là 1' })
  @Max(5, { message: 'Điểm tối đa là 5' })
  score: number;
}

export class SubmitTestDto {
  @IsArray({ message: 'Danh sách câu trả lời phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
