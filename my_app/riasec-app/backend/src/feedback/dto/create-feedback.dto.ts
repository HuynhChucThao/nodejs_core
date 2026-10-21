import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống' })
  @IsString()
  content: string;

  @IsInt()
  @Min(1, { message: 'Đánh giá tối thiểu 1 sao' })
  @Max(5, { message: 'Đánh giá tối đa 5 sao' })
  rating: number;
}
