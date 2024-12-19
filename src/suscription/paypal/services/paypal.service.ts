import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PayPalService {
  private environment: paypal.core.SandboxEnvironment | paypal.core.LiveEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // Configura el entorno (Sandbox o Live)
    this.environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(total: string, currency: string) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: total,
          },
        },
      ],
    });

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (error) {
      throw new Error(`PayPal Order Creation Error: ${error.message}`);
    }
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (error) {
      throw new Error(`PayPal Order Capture Error: ${error.message}`);
    }
  }
}
