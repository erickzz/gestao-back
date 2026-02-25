import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsHexColor, IsString, MaxLength, MinLength } from 'class-validator';
import { TransactionType } from 'generated/prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentação' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '#3B82F6' })
  @IsString()
  @IsHexColor()
  color: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;
}
