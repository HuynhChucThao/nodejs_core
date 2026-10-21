import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  role: 'user' | 'model';

  @IsNotEmpty()
  @IsString()
  text: string;
}

export class ChatAiDto {
  @IsNotEmpty({ message: 'Tin nhắn không được để trống' })
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  history?: ChatMessageDto[];
}
