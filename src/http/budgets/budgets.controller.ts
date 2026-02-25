import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ApiResponse } from '../../common/types';
import { CategoryResponseDto } from '../../common/dto/category-response.dto';
import { BudgetResponseDto } from '../../common/dto/budget-response.dto';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('budgets')
@ApiExtraModels(BudgetResponseDto, CategoryResponseDto)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({
    summary: 'List budgets',
    description:
      'Returns all budgets for the authenticated user. Optional filters by month and year.',
    operationId: 'budgetsList',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(BudgetResponseDto) },
        },
      },
    },
  })
  async findAll(
    @Session() session: UserSession,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<ApiResponse<Awaited<ReturnType<BudgetsService['findAll']>>>> {
    const monthNum = month ? parseInt(month, 10) : undefined;
    const yearNum = year ? parseInt(year, 10) : undefined;
    const data = await this.budgetsService.findAll(
      session.user.id,
      monthNum,
      yearNum,
    );
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one budget',
    description: 'Returns a single budget by ID for the authenticated user.',
    operationId: 'budgetsGetOne',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(BudgetResponseDto) },
      },
    },
  })
  async findOne(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<ApiResponse<Awaited<ReturnType<BudgetsService['findOne']>>>> {
    const data = await this.budgetsService.findOne(id, session.user.id);
    return { data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create budget',
    description:
      'Creates a new budget limit for a category in a given month and year.',
    operationId: 'budgetsCreate',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(BudgetResponseDto) },
      },
    },
  })
  async create(
    @Session() session: UserSession,
    @Body() body: CreateBudgetDto,
  ): Promise<ApiResponse<Awaited<ReturnType<BudgetsService['create']>>>> {
    const data = await this.budgetsService.create(session.user.id, body);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update budget',
    description:
      'Updates an existing budget. Only provided fields are modified.',
    operationId: 'budgetsUpdate',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(BudgetResponseDto) },
      },
    },
  })
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: UpdateBudgetDto,
  ): Promise<ApiResponse<Awaited<ReturnType<BudgetsService['update']>>>> {
    const data = await this.budgetsService.update(id, session.user.id, body);
    return { data };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete budget',
    description: 'Deletes a budget for the authenticated user.',
    operationId: 'budgetsDelete',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(BudgetResponseDto) },
      },
    },
  })
  async remove(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<ApiResponse<Awaited<ReturnType<BudgetsService['remove']>>>> {
    const data = await this.budgetsService.remove(id, session.user.id);
    return { data };
  }
}
