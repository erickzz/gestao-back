import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PaymentMethod,
  Recurrence,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/client';
import { addMonths, addQuarters, addYears, parseISO } from 'date-fns';
import { PrismaService } from '../../prisma.service';
import type { PaginatedResponse } from '../../common/types';
import type { CreateInstallmentDto } from './dto/create-installment.dto';
import type { CreateRecurrentDto } from './dto/create-recurrent.dto';
import type { CreateTransactionDto } from './dto/create-transaction.dto';
import type { CalendarQueryDto } from './dto/calendar-query.dto';
import type { TransactionQueryDto } from './dto/transaction-query.dto';
import type { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCategory(
    categoryId: string,
    userId: string,
    type: TransactionType,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
    }
    if (category.userId !== null && category.userId !== userId) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Access denied to this category' },
      });
    }
    if (category.type !== type) {
      throw new BadRequestException({
        error: {
          code: 'CATEGORY_TYPE_MISMATCH',
          message: `Category type (${category.type}) does not match transaction type (${type})`,
        },
      });
    }
    return category;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    await this.validateCategory(dto.categoryId, userId, dto.type);
    return this.prisma.transaction.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        type: dto.type,
        value: dto.value,
        date: new Date(dto.date),
        subcategory: dto.subcategory,
        paymentMethod: dto.paymentMethod as PaymentMethod,
        description: dto.description,
        recurrence: Recurrence.NONE,
        status: (dto.status ?? 'PAID') as TransactionStatus,
      },
      include: { category: true },
    });
  }

  async createInstallments(userId: string, dto: CreateInstallmentDto) {
    await this.validateCategory(dto.categoryId, userId, dto.type);
    const firstDate = parseISO(dto.firstDueDate);
    const valuePerInstallment = dto.totalValue / dto.installmentCount;
    const installmentGroupId = crypto.randomUUID();
    const status = (dto.status ?? 'PENDING') as TransactionStatus;

    const transactions = Array.from(
      { length: dto.installmentCount },
      (_, i) => ({
        userId,
        categoryId: dto.categoryId,
        type: dto.type,
        value: valuePerInstallment,
        date: addMonths(firstDate, i),
        subcategory: dto.subcategory,
        paymentMethod: dto.paymentMethod as PaymentMethod,
        description: dto.description,
        recurrence: Recurrence.NONE,
        status,
        installmentGroupId,
        installmentNumber: i + 1,
        installmentCount: dto.installmentCount,
      }),
    );

    const created = await this.prisma.$transaction(
      transactions.map((t) =>
        this.prisma.transaction.create({
          data: t,
          include: { category: true },
        }),
      ),
    );
    return created;
  }

  async createRecurrent(userId: string, dto: CreateRecurrentDto) {
    await this.validateCategory(dto.categoryId, userId, dto.type);
    return this.prisma.transaction.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        type: dto.type,
        value: dto.value,
        date: new Date(dto.date),
        subcategory: dto.subcategory,
        paymentMethod: dto.paymentMethod as PaymentMethod,
        description: dto.description,
        recurrence: dto.recurrence as Recurrence,
        status: (dto.status ?? 'PAID') as TransactionStatus,
      },
      include: { category: true },
    });
  }

  async findAll(
    userId: string,
    query: TransactionQueryDto,
  ): Promise<
    PaginatedResponse<Awaited<ReturnType<TransactionsService['findOne']>>>
  > {
    const { page = 1, limit = 20, dateFrom, dateTo, categoryId, type } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom)
        (where.date as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, Date>).lte = new Date(dateTo);
    }
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { category: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!tx) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: 'Transaction not found' },
      });
    }
    if (tx.userId !== userId) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }
    return tx;
  }

  async findByGroup(installmentGroupId: string, userId: string) {
    const list = await this.prisma.transaction.findMany({
      where: { installmentGroupId, userId },
      orderBy: { installmentNumber: 'asc' },
      include: { category: true },
    });
    if (list.length === 0) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: 'No transactions found for this group',
        },
      });
    }
    return list;
  }

  async getCalendarEvents(
    userId: string,
    query: CalendarQueryDto,
  ): Promise<{ date: string; transaction: Awaited<ReturnType<TransactionsService['findOne']>> }[]> {
    const dateFrom = parseISO(query.dateFrom);
    const dateTo = parseISO(query.dateTo);

    const where: Record<string, unknown> = {
      userId,
      date: { lte: dateTo },
    };
    if (query.type) where.type = query.type;

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { category: true },
    });

    const events: { date: string; transaction: (typeof transactions)[0] }[] = [];

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      const start = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

      if (tx.recurrence === Recurrence.NONE) {
        if (start >= dateFrom && start <= dateTo) {
          events.push({
            date: txDate.toISOString().slice(0, 10),
            transaction: tx,
          });
        }
        continue;
      }

      let current = new Date(start);
      while (current <= dateTo) {
        if (current >= dateFrom) {
          events.push({
            date: current.toISOString().slice(0, 10),
            transaction: tx,
          });
        }
        if (tx.recurrence === Recurrence.MONTHLY) {
          current = addMonths(current, 1);
        } else if (tx.recurrence === Recurrence.QUARTERLY) {
          current = addQuarters(current, 1);
        } else if (tx.recurrence === Recurrence.ANNUAL) {
          current = addYears(current, 1);
        } else {
          break;
        }
      }
    }

    events.sort((a, b) => a.date.localeCompare(b.date));
    return events;
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    await this.findOne(id, userId);
    if (dto.categoryId) {
      const tx = await this.prisma.transaction.findUnique({ where: { id } });
      if (tx) {
        await this.validateCategory(dto.categoryId, userId, tx.type);
      }
    }
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.subcategory !== undefined && { subcategory: dto.subcategory }),
        ...(dto.paymentMethod && {
          paymentMethod: dto.paymentMethod as PaymentMethod,
        }),
        ...(dto.description && { description: dto.description }),
        ...(dto.status && { status: dto.status as TransactionStatus }),
      },
      include: { category: true },
    });
  }

  async remove(id: string, userId: string, cascade?: boolean) {
    const tx = await this.findOne(id, userId);
    if (cascade && tx.installmentGroupId) {
      const result = await this.prisma.transaction.deleteMany({
        where: { installmentGroupId: tx.installmentGroupId, userId },
      });
      return { deleted: true, count: result.count };
    }
    await this.prisma.transaction.delete({ where: { id } });
    return { deleted: true };
  }
}
