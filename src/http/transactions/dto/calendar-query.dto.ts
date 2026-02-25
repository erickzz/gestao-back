import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CalendarQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Start of the date range' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2026-01-31', description: 'End of the date range' })
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional({ enum: ['INCOME', 'EXPENSE'] })
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type?: 'INCOME' | 'EXPENSE';
}
