import { Controller, Get, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ApiResponse } from '../../common/types';
import {
  BudgetStatusItemDto,
  DashboardAggregatedDto,
  ExpenseByCategoryDto,
  MonthlyEvolutionItemDto,
  DashboardSummaryDto,
} from '../../common/dto/dashboard-response.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiExtraModels(
  DashboardAggregatedDto,
  DashboardSummaryDto,
  ExpenseByCategoryDto,
  MonthlyEvolutionItemDto,
  BudgetStatusItemDto,
)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get full dashboard data (aggregated)',
    description:
      'Returns aggregated dashboard data including summary, expenses by category, monthly evolution, and budget status for the specified period.',
    operationId: 'dashboardGetAggregated',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(DashboardAggregatedDto) },
      },
    },
  })
  async getAggregated(
    @Session() session: UserSession,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('months') months?: string,
  ) {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const monthsNum = months ? parseInt(months, 10) : 12;

    const data = await this.dashboardService.getAggregated(
      session.user.id,
      m,
      y,
      monthsNum,
    );
    return { data };
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get summary (balance, income, expenses)',
    description:
      'Returns financial summary for a month: total income, total expenses, and balance.',
    operationId: 'dashboardGetSummary',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(DashboardSummaryDto) },
      },
    },
  })
  async getSummary(
    @Session() session: UserSession,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<ApiResponse<Awaited<ReturnType<DashboardService['getSummary']>>>> {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();

    const data = await this.dashboardService.getSummary(session.user.id, m, y);
    return { data };
  }

  @Get('expenses-by-category')
  @ApiOperation({
    summary: 'Get expenses grouped by category',
    description:
      'Returns total expenses per category for the specified month. Useful for pie charts and spending breakdown.',
    operationId: 'dashboardGetExpensesByCategory',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ExpenseByCategoryDto) },
        },
      },
    },
  })
  async getExpensesByCategory(
    @Session() session: UserSession,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<
    ApiResponse<Awaited<ReturnType<DashboardService['getExpensesByCategory']>>>
  > {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();

    const data = await this.dashboardService.getExpensesByCategory(
      session.user.id,
      m,
      y,
    );
    return { data };
  }

  @Get('monthly-evolution')
  @ApiOperation({
    summary: 'Get monthly evolution',
    description:
      'Returns income and expenses evolution over the last N months. Useful for trend charts.',
    operationId: 'dashboardGetMonthlyEvolution',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(MonthlyEvolutionItemDto) },
        },
      },
    },
  })
  async getMonthlyEvolution(
    @Session() session: UserSession,
    @Query('months') months?: string,
  ): Promise<
    ApiResponse<Awaited<ReturnType<DashboardService['getMonthlyEvolution']>>>
  > {
    const monthsNum = months ? parseInt(months, 10) : 12;
    const data = await this.dashboardService.getMonthlyEvolution(
      session.user.id,
      monthsNum,
    );
    return { data };
  }

  @Get('budget-status')
  @ApiOperation({
    summary: 'Get budget status per category',
    description:
      'Returns budget usage per category: spent amount vs limit. Indicates which budgets are over or under limit.',
    operationId: 'dashboardGetBudgetStatus',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(BudgetStatusItemDto) },
        },
      },
    },
  })
  async getBudgetStatus(
    @Session() session: UserSession,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<
    ApiResponse<Awaited<ReturnType<DashboardService['getBudgetStatus']>>>
  > {
    const now = new Date();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    const y = year ? parseInt(year, 10) : now.getFullYear();

    const data = await this.dashboardService.getBudgetStatus(
      session.user.id,
      m,
      y,
    );
    return { data };
  }
}
