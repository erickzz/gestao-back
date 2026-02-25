import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from './transaction-response.dto';

export class CalendarEventDto {
  @ApiProperty({
    example: '2026-01-15',
    description: 'Date of this occurrence (ISO date string)',
  })
  date: string;

  @ApiProperty({ type: TransactionResponseDto })
  transaction: TransactionResponseDto;
}
