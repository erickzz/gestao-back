import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';
import { Roles, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ApiResponse } from '../../common/types';
import { CategoryResponseDto } from '../../common/dto/category-response.dto';
import { CreateAdminCategoryDto } from './dto/create-admin-category.dto';
import { PrismaService } from '../../prisma.service';

@ApiTags('admin')
@ApiExtraModels(CategoryResponseDto)
@Controller('admin')
@Roles(['admin'])
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('categories')
  @ApiOperation({
    summary: 'Create system category (admin only)',
    description:
      'Creates a new system category visible to all users. Requires admin role. System categories have userId=null.',
    operationId: 'adminCreateCategory',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: { $ref: getSchemaPath(CategoryResponseDto) },
      },
    },
  })
  async createCategory(
    @Session() _session: UserSession,
    @Body() body: CreateAdminCategoryDto,
  ) {
    const existing = await this.prisma.category.findFirst({
      where: { userId: null, name: body.name, type: body.type },
    });
    if (existing) {
      throw new BadRequestException({
        error: {
          code: 'DUPLICATE_CATEGORY',
          message: `System category "${body.name}" already exists for this type`,
        },
      });
    }
    const data = await this.prisma.category.create({
      data: {
        name: body.name,
        color: body.color,
        type: body.type,
        userId: null,
      },
    });
    return { data } as ApiResponse<typeof data>;
  }
}
