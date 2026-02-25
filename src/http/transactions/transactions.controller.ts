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
import { PaginatedMetaDto } from '../../common/dto/paginated-response.dto';
import { CategoryResponseDto } from '../../common/dto/category-response.dto';
import { TransactionResponseDto } from '../../common/dto/transaction-response.dto';
import { TransactionsService } from './transactions.service';
import { CreateInstallmentDto } from './dto/create-installment.dto';
import { CreateRecurrentDto } from './dto/create-recurrent.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CalendarEventDto } from '../../common/dto/calendar-event.dto';

@ApiTags('transactions')
@ApiExtraModels(
  TransactionResponseDto,
  PaginatedMetaDto,
  CategoryResponseDto,
  CalendarEventDto,
)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'List transactions with filters and pagination',
    description:
      'Returns a paginated list of transactions for the authenticated user. Supports filtering by type, category, date range, status, and payment method.',
    operationId: 'transactionsList',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(TransactionResponseDto) },
        },
        meta: { $ref: getSchemaPath(PaginatedMetaDto) },
      },
    },
  })
  async findAll(
    @Session() session: UserSession,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.findAll(session.user.id, query);
  }

  @Get('by-group/:installmentGroupId')
  @ApiOperation({
    summary: 'List installments by group',
    description:
      'Returns all transactions belonging to the same installment group (parceled purchase).',
    operationId: 'transactionsListByInstallmentGroup',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(TransactionResponseDto) },
        },
      },
    },
  })
  async findByGroup(
    @Session() session: UserSession,
    @Param('installmentGroupId') installmentGroupId: string,
  ): Promise<
    ApiResponse<Awaited<ReturnType<TransactionsService['findByGroup']>>>
  > {
    const data = await this.transactionsService.findByGroup(
      installmentGroupId,
      session.user.id,
    );
    return { data };
  }

  @Get('calendar')
  @ApiOperation({
    summary: 'Get calendar events',
    description:
      'Returns transactions expanded for calendar display. Regular transactions appear once on their date. Recurrent transactions (monthly, quarterly, annual) are expanded into multiple occurrences within the date range.',
    operationId: 'transactionsCalendar',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2026-01-15' },
              transaction: { $ref: getSchemaPath(TransactionResponseDto) },
            },
          },
        },
      },
    },
  })
  async getCalendar(
    @Session() session: UserSession,
    @Query() query: CalendarQueryDto,
  ): Promise<
    ApiResponse<Awaited<ReturnType<TransactionsService['getCalendarEvents']>>>
  > {
    const data = await this.transactionsService.getCalendarEvents(
      session.user.id,
      query,
    );
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one transaction',
    description:
      'Returns a single transaction by ID for the authenticated user.',
    operationId: 'transactionsGetOne',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(TransactionResponseDto) },
      },
    },
  })
  async findOne(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<ApiResponse<Awaited<ReturnType<TransactionsService['findOne']>>>> {
    const data = await this.transactionsService.findOne(id, session.user.id);
    return { data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create single transaction',
    description:
      'Creates a new single (non-parceled, non-recurrent) income or expense transaction.',
    operationId: 'transactionsCreate',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(TransactionResponseDto) },
      },
    },
  })
  async create(
    @Session() session: UserSession,
    @Body() body: CreateTransactionDto,
  ): Promise<ApiResponse<Awaited<ReturnType<TransactionsService['create']>>>> {
    const data = await this.transactionsService.create(session.user.id, body);
    return { data };
  }

  @Post('installments')
  @ApiOperation({
    summary: 'Create installment purchase',
    description:
      'Creates a parceled purchase. All installments are created atomically (2–24 parcels) with automatic due dates.',
    operationId: 'transactionsCreateInstallments',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(TransactionResponseDto) },
        },
      },
    },
  })
  async createInstallments(
    @Session() session: UserSession,
    @Body() body: CreateInstallmentDto,
  ): Promise<
    ApiResponse<Awaited<ReturnType<TransactionsService['createInstallments']>>>
  > {
    const data = await this.transactionsService.createInstallments(
      session.user.id,
      body,
    );
    return { data };
  }

  @Post('recurrent')
  @ApiOperation({
    summary: 'Create recurrent transaction',
    description:
      'Creates a recurring transaction (monthly, quarterly, or annual). Used for fixed expenses like rent or subscriptions.',
    operationId: 'transactionsCreateRecurrent',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(TransactionResponseDto) },
      },
    },
  })
  async createRecurrent(
    @Session() session: UserSession,
    @Body() body: CreateRecurrentDto,
  ): Promise<
    ApiResponse<Awaited<ReturnType<TransactionsService['createRecurrent']>>>
  > {
    const data = await this.transactionsService.createRecurrent(
      session.user.id,
      body,
    );
    return { data };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update transaction',
    description:
      'Updates an existing transaction. Only provided fields are modified.',
    operationId: 'transactionsUpdate',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(TransactionResponseDto) },
      },
    },
  })
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
  ): Promise<ApiResponse<Awaited<ReturnType<TransactionsService['update']>>>> {
    const data = await this.transactionsService.update(
      id,
      session.user.id,
      body,
    );
    return { data };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete transaction (or cascade for installments)',
    description:
      'Deletes a transaction. For parceled purchases, use cascade=true to delete all installments in the group.',
    operationId: 'transactionsDelete',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(TransactionResponseDto) },
      },
    },
  })
  async remove(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Query('cascade') cascade?: string,
  ): Promise<ApiResponse<Awaited<ReturnType<TransactionsService['remove']>>>> {
    const data = await this.transactionsService.remove(
      id,
      session.user.id,
      cascade === 'true',
    );
    return { data };
  }
}
