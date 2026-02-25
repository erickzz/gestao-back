import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodItemDto {
  @ApiProperty({ example: 'PIX' })
  value: string;

  @ApiProperty({ example: 'PIX' })
  label: string;
}
