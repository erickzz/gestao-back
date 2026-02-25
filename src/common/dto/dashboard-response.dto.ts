import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty()
  balance: number;

  @ApiProperty()
  income: number;

  @ApiProperty()
  expenses: number;

  @ApiProperty()
  incomeDelta: number;

  @ApiProperty()
  expensesDelta: number;
}

export class ExpenseByCategoryDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  total: number;
}

export class MonthlyEvolutionItemDto {
  @ApiProperty()
  month: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  income: number;

  @ApiProperty()
  expenses: number;
}

export class BudgetStatusItemDto {
  @ApiProperty()
  budgetId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  categoryColor: string;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  spent: number;

  @ApiProperty()
  percentUsed: number;

  @ApiProperty({ enum: ['ok', 'warning', 'danger'] })
  alert: 'ok' | 'warning' | 'danger';
}

export class DashboardAggregatedDto {
  @ApiProperty({ type: DashboardSummaryDto })
  summary: DashboardSummaryDto;

  @ApiProperty({ type: [ExpenseByCategoryDto] })
  expensesByCategory: ExpenseByCategoryDto[];

  @ApiProperty({ type: [MonthlyEvolutionItemDto] })
  monthlyEvolution: MonthlyEvolutionItemDto[];

  @ApiProperty({ type: [BudgetStatusItemDto] })
  budgetStatus: BudgetStatusItemDto[];
}
