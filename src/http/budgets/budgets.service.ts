import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionType } from 'generated/prisma/client';
import { PrismaService } from '../../prisma.service';
import type { CreateBudgetDto } from './dto/create-budget.dto';
import type { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCategoryForBudget(categoryId: string, userId: string) {
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
    if (category.type !== TransactionType.EXPENSE) {
      throw new BadRequestException({
        error: {
          code: 'CATEGORY_TYPE_MISMATCH',
          message: 'Budget can only be set for expense categories',
        },
      });
    }
    return category;
  }

  async findAll(userId: string, month?: number, year?: number) {
    const where: { userId: string; month?: number; year?: number } = { userId };
    if (month !== undefined) where.month = month;
    if (year !== undefined) where.year = year;

    return this.prisma.budget.findMany({
      where,
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!budget) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: 'Budget not found' },
      });
    }
    if (budget.userId !== userId) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }
    return budget;
  }

  async create(userId: string, dto: CreateBudgetDto) {
    await this.validateCategoryForBudget(dto.categoryId, userId);
    return this.prisma.budget.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        month: dto.month,
        year: dto.year,
        limit: dto.limit,
      },
      include: { category: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    await this.findOne(id, userId);
    if (dto.categoryId) {
      await this.validateCategoryForBudget(dto.categoryId, userId);
    }
    return this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.month !== undefined && { month: dto.month }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.limit !== undefined && { limit: dto.limit }),
      },
      include: { category: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.budget.delete({ where: { id } });
  }
}
