import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ example: 'What are your delivery hours?' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
