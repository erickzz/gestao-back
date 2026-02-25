import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInstallmentDto {
  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ enum: ['INCOME', 'EXPENSE'] })
  @IsEnum(['INCOME', 'EXPENSE'])
  type: 'INCOME' | 'EXPENSE';

  @ApiProperty({ example: 300, description: 'Total value to split' })
  @IsNumber()
  @Min(0)
  totalValue: number;

  @ApiProperty({ example: 3, description: 'Number of installments' })
  @IsInt()
  @Min(2)
  @Max(24)
  installmentCount: number;

  @ApiProperty({ example: '2025-01-15', description: 'First due date' })
  @IsString()
  firstDueDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string;

  @ApiProperty({ enum: ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'BOLETO', 'OTHER'] })
  @IsEnum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'BOLETO', 'OTHER'])
  paymentMethod: string;

  @ApiProperty({ example: 'Fone de ouvido' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({ enum: ['PAID', 'PENDING'] })
  @IsOptional()
  @IsEnum(['PAID', 'PENDING'])
  status?: 'PAID' | 'PENDING';
}
