import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { TransactionBaseDto } from './transaction-base.dto';

export class CreateTransactionDto extends TransactionBaseDto {
  @ApiPropertyOptional({ description: 'Always NONE for single transactions' })
  @IsOptional()
  recurrence?: 'NONE' = 'NONE';
}
