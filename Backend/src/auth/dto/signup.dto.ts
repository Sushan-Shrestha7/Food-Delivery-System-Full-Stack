import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Length,
} from "class-validator";

export class SignupDto {
  @ApiProperty({ example: "SUSHAN STHA", minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, example: "123456" })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  code?: string;
}
