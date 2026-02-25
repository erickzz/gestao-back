import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { PaymentMethod, TransactionStatus, TransactionType } from 'generated/prisma/client';

export class TransactionBaseDto {
  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ enum: ['INCOME', 'EXPENSE'] })
  @IsEnum(['INCOME', 'EXPENSE'])
  type: TransactionType;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string;

  @ApiProperty({ enum: ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'BOLETO', 'OTHER'] })
  @IsEnum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'BOLETO', 'OTHER'])
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'Compra no mercado' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({ enum: ['PAID', 'PENDING'], default: 'PAID' })
  @IsOptional()
  @IsEnum(['PAID', 'PENDING'])
  status?: TransactionStatus;
}
