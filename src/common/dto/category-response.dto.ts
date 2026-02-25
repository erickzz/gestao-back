import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from 'generated/prisma/client';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Alimentação' })
  name: string;

  @ApiProperty({ example: '#3B82F6' })
  color: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ nullable: true })
  userId: string | null;
}
