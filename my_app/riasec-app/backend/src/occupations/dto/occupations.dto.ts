import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateOccupationDto {
  @IsNotEmpty({ message: 'Job name does not empty' })
  @IsString()
  jobName: string;

  @IsNotEmpty({ message: 'Description does not empty' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'RIASEC code does not empty' })
  @IsIn(['R', 'I', 'A', 'S', 'E', 'C'], {
    message: 'RIASEC code must be one of R, I, A, S, E, C',
  })
  mainCode: string;

  @IsString()
  riasecCode: string;

  @IsString()
  education: string;

  @IsString()
  taskRaw: string[];

  @IsString()
  skillRaw: string[];
}

export class UpdateOccupationDto extends CreateOccupationDto {
}
