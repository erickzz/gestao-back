import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

export class BudgetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ type: CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiProperty({ example: 1 })
  month: number;

  @ApiProperty({ example: 2025 })
  year: number;

  @ApiProperty({ example: 1500 })
  limit: number;

  @ApiProperty()
  createdAt: Date;
}
