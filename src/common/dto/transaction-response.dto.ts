import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentMethod,
  Recurrence,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/client';
import { CategoryResponseDto } from './category-response.dto';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ type: CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ example: 100.5 })
  value: number;

  @ApiProperty({ example: '2025-01-15' })
  date: Date;

  @ApiProperty({ nullable: true })
  subcategory: string | null;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: Recurrence })
  recurrence: Recurrence;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ nullable: true })
  installmentGroupId: string | null;

  @ApiProperty({ nullable: true })
  installmentNumber: number | null;

  @ApiProperty({ nullable: true })
  installmentCount: number | null;

  @ApiProperty()
  createdAt: Date;
}
