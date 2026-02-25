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
import { ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { TransactionType } from 'generated/prisma/client';
import { ApiResponse } from '../../common/types';
import { CategoryResponseDto } from '../../common/dto/category-response.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@ApiExtraModels(CategoryResponseDto)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'List categories (system + user custom)',
    description:
      'Returns all categories available to the user: system categories (shared) and custom categories created by the user. Optional filter by type (INCOME or EXPENSE).',
    operationId: 'categoriesList',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(CategoryResponseDto) },
        },
      },
    },
  })
  async findAll(
    @Session() session: UserSession,
    @Query('type') type?: TransactionType,
  ): Promise<ApiResponse<Awaited<ReturnType<CategoriesService['findAll']>>>> {
    const data = await this.categoriesService.findAll(session.user.id, type);
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one category',
    description:
      'Returns a single category by ID. User must have access (system or own custom).',
    operationId: 'categoriesGetOne',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(CategoryResponseDto) },
      },
    },
  })
  async findOne(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<ApiResponse<Awaited<ReturnType<CategoriesService['findOne']>>>> {
    const data = await this.categoriesService.findOne(id, session.user.id);
    return { data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create custom category',
    description:
      'Creates a new custom category for the authenticated user. Requires name, color, and type (INCOME or EXPENSE).',
    operationId: 'categoriesCreate',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(CategoryResponseDto) },
      },
    },
  })
  async create(
    @Session() session: UserSession,
    @Body() body: CreateCategoryDto,
  ): Promise<ApiResponse<Awaited<ReturnType<CategoriesService['create']>>>> {
    const data = await this.categoriesService.create(session.user.id, body);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update custom category',
    description:
      'Updates a custom category. Only user-owned categories can be updated.',
    operationId: 'categoriesUpdate',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(CategoryResponseDto) },
      },
    },
  })
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<ApiResponse<Awaited<ReturnType<CategoriesService['update']>>>> {
    const data = await this.categoriesService.update(id, session.user.id, body);
    return { data };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete custom category',
    description:
      'Deletes a custom category. Only user-owned categories can be deleted.',
    operationId: 'categoriesDelete',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(CategoryResponseDto) },
      },
    },
  })
  async remove(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<ApiResponse<Awaited<ReturnType<CategoriesService['remove']>>>> {
    const data = await this.categoriesService.remove(id, session.user.id);
    return { data };
  }
}
