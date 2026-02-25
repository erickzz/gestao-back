import { Controller, Get } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getSchemaPath } from '@nestjs/swagger';
import { PaymentMethod } from 'generated/prisma/client';
import { ApiResponse } from '../../common/types';
import { PaymentMethodItemDto } from '../../common/dto/payment-method-response.dto';

@ApiTags('metadata')
@ApiExtraModels(PaymentMethodItemDto)
@Controller('payment-methods')
export class MetadataController {
  @Get()
  @ApiOperation({
    summary: 'List payment method enum values',
    description:
      'Returns all available payment methods with value and localized label. Public endpoint, no authentication required.',
    operationId: 'paymentMethodsList',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(PaymentMethodItemDto) },
        },
      },
    },
  })
  async getPaymentMethods(): Promise<
    ApiResponse<{ value: string; label: string }[]>
  > {
    const labels: Record<string, string> = {
      PIX: 'PIX',
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      CASH: 'Dinheiro',
      BANK_TRANSFER: 'Transferência Bancária',
      BOLETO: 'Boleto',
      OTHER: 'Outro',
    };
    const data = Object.values(PaymentMethod).map((value) => ({
      value,
      label: labels[value] ?? value,
    }));
    return { data };
  }
}
