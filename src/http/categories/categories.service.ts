import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionType } from 'generated/prisma/client';
import { PrismaService } from '../../prisma.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, type?: TransactionType) {
    const where: { OR: Array<{ userId: string | null; type?: TransactionType }> } = {
      OR: [
        { userId: null },
        { userId },
      ],
    };
    if (type) {
      where.OR = where.OR.map((c) => ({ ...c, type }));
    }
    return this.prisma.category.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }
    if (category.userId !== null && category.userId !== userId) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Access denied to this category' },
      });
    }
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { userId, name: dto.name, type: dto.type },
    });
    if (existing) {
      throw new BadRequestException({
        error: {
          code: 'DUPLICATE_CATEGORY',
          message: `Category "${dto.name}" already exists for this type`,
        },
      });
    }
    return this.prisma.category.create({
      data: {
        name: dto.name,
        color: dto.color,
        type: dto.type,
        userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id, userId);
    if (category.userId === null) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Cannot edit system categories' },
      });
    }
    if (dto.name !== undefined || dto.type !== undefined) {
      const existing = await this.prisma.category.findFirst({
        where: {
          userId,
          name: dto.name ?? category.name,
          type: dto.type ?? category.type,
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestException({
          error: {
            code: 'DUPLICATE_CATEGORY',
            message: 'A category with this name and type already exists',
          },
        });
      }
    }
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id, userId);
    if (category.userId === null) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Cannot delete system categories' },
      });
    }
    const inUse = await this.prisma.transaction.count({
      where: { categoryId: id },
    });
    const budgetUse = await this.prisma.budget.count({
      where: { categoryId: id },
    });
    if (inUse > 0 || budgetUse > 0) {
      throw new BadRequestException({
        error: {
          code: 'CATEGORY_IN_USE',
          message: 'Cannot delete category that is used in transactions or budgets',
        },
      });
    }
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
