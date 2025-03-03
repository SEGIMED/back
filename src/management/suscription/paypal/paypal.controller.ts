import { Controller, Post, Body, Param } from '@nestjs/common';
import { PayPalService } from './services/paypal.service';
import { TransactionService } from './services/transaction.service';

@Controller('paypal')
export class PayPalController {
  constructor(
    private readonly payPalService: PayPalService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post('capture-order/:orderId')
  async captureOrder(
    @Param('orderId') orderId: string,
    @Body() body: { userId: string },
  ) {
    const captureResult = await this.payPalService.captureOrder(orderId);

    // Guardar la transacción en la base de datos
    await this.transactionService.createTransaction({
      orderId,
      status: captureResult.status,
      amount: parseFloat(captureResult.purchase_units[0].amount.value),
      currency: captureResult.purchase_units[0].amount.currency_code,
      userId: body.userId,
      tenant_id: body.userId,
    });

    return captureResult;
  }
}
