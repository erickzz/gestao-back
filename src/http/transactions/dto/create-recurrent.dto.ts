import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TransactionBaseDto } from './transaction-base.dto';

export class CreateRecurrentDto extends TransactionBaseDto {
  @ApiProperty({ enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL'] })
  @IsEnum(['MONTHLY', 'QUARTERLY', 'ANNUAL'])
  recurrence: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}
