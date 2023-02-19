import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../event/entities/event.entity';
import { Repository } from 'typeorm';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';

import { Order } from './order.entity';
import { AppError } from '../commons/errors/app-error';

import { CheckoutDto } from './dto/checkout.dto';
import { CreateFreeOrderDto } from './dto/create-free-order.dto';
import { Status } from './enum/status.enum';
import { RefundDto } from './dto/refund.dto';
import { Refund } from './entities/refund.entity';
import { ERR_NOT_FOUND_EVENT } from '../commons/errors/errors-codes';

@Injectable()
export class StripeService {
  // private readonly stripe;
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Refund)
    private refundRepo: Repository<Refund>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_API_SECRET_KEY'), {
      apiVersion: this.configService.get('STRIPE_APP_VERSION'),
    });
  }

  // async createPayment(
  //   user: User,
  //   id: string | any,
  //   createCustomerDto: CreateCustomerDto,
  // ): Promise<Stripe & any> {
  //   try {
  //     let { cvc, number, exp_month, exp_year, full_name, email, quantity } =
  //       createCustomerDto;
  //     const event = await this.eventRepo.findOneBy({ id: id.id });
  //     if (!event) {
  //       return {
  //         error: new AppError(
  //           'ERR_NOT_FOUND_EVENT',
  //           `Event with ID ${id} not found`,
  //         ),
  //       };
  //     } else {
  //       const payment = await this.stripe.paymentMethods.create({
  //         type: 'card',
  //         billing_details: { email: user.email, name: user.full_name },
  //         card: {
  //           cvc: cvc,
  //           number: number,
  //           exp_month: exp_month,
  //           exp_year: exp_year,
  //         },
  //       });
  //
  //       if (full_name == user.full_name && email == user.email) {
  //         const customer = await this.stripe.customers.create({
  //           name: full_name,
  //           email: email,
  //           // phone: phone,
  //           payment_method: payment.id,
  //         });
  //
  //         //// Hashed secured code
  //         const create_payment = await this.stripe.paymentIntents.create({
  //           amount: event.amount * 100 * quantity,
  //           currency: event.currency,
  //           customer: customer.id,
  //           payment_method: payment.id,
  //           confirm: true,
  //           description:
  //             'Stripe Guarantee the security and the quality of your payments 🔴',
  //           receipt_email: email,
  //         });
  //         const order = this.orderRepo.create({
  //           user,
  //           event,
  //         });
  //         event.joined_number_participants++;
  //         await this.eventRepo.save(event);
  //         order.event = event;
  //         order.customerId = customer.id;
  //         order.payment_method = payment.id;
  //         await this.orderRepo.save(order);
  //         return create_payment;
  //       } else {
  //         return {
  //           message: new AppError(
  //             'INCORRECT_NAME',
  //             'this name or email  doesnt match with the application name please put your Uvently full name or email ',
  //           ),
  //         };
  //       }
  //       //// Hashed secured code
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     throw new ConflictException(new AppError('ERR', 'invalid payment'));
  //   }
  // }

  // public async attachCreditCard(user: User) {
  //   /*try {
  //     let orders = user.orders;
  //     let randomOrder = orders[Math.floor(Math.random() * orders.length)];
  //
  //     return this.stripe.setupIntents.create({
  //       customer: randomOrder.customerId,
  //     });
  //   } catch (e) {
  //     throw new ConflictException(new AppError('ERR', 'wrong fields'));
  //   }*/
  // }

  // public async listCreditCards(user: User) {
  //   try {
  //     //const result = await this.save(user);
  //     const orders = await this.orderRepo.findOne({
  //       relations: {
  //         user: true,
  //       },
  //       where: {
  //         user: {
  //           id: user.id,
  //         },
  //       },
  //     });
  //     return this.stripe.paymentMethods.list({
  //       customer: orders.customerId,
  //       type: 'card',
  //     });
  //   } catch (e) {
  //     throw new ConflictException(
  //       new AppError('ERR', 'no credit card saved in the list'),
  //     );
  //   }
  // }

  // public async charge(
  //   user: User,
  //   id: any,
  //   chargeCustomerDto: ChargeCustomerDto,
  // ) {
  //   try {
  //     const event = await this.eventRepo.findOneBy({ id: id.id });
  //     const { quantity } = chargeCustomerDto;
  //     const result = await this.attachCreditCard(user);
  //     const paymentMethodId: any = result;
  //     const customer = await this.stripe.customers.create({
  //       name: user.full_name,
  //       email: user.email,
  //     });
  //     // await this.stripe.charges.create({
  //     //   amount: event.amount * 100 * quantity,
  //     //   currency: event.currency,
  //     //   order: cus.id,
  //     // });
  //     const paymentIntents = await this.stripe.paymentIntents.create({
  //       amount: event.amount * 100 * quantity,
  //       customer: customer.id,
  //       payment_method: paymentMethodId,
  //       currency: event.currency,
  //       off_session: true,
  //       confirm: true,
  //       description:
  //         'Stripe Guarantee the security and the quality of your payments 🔴',
  //     });
  //     return paymentIntents;
  //   } catch (e) {
  //     console.log(e);
  //     throw new ConflictException(new AppError('ERR', 'invalid payment'));
  //   }
  // }

  // Create Checkout
  async createCheckout(checkoutDto: CheckoutDto, user: User): Promise<any> {
    const { eventId, successUrl, cancelUrl } = checkoutDto;
    const event = await this.eventRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException(new AppError(ERR_NOT_FOUND_EVENT));

    try {
      const session = await this._getStripeSession(
        event,
        user,
        successUrl,
        cancelUrl,
      );

      const publishable_key = (await this.configService.get(
        'STRIPE_PUBLISHABLE_KEY',
      )) as string;
      // await this._redirectToWebhook(session.success_url, session.metadata);
      return {
        stripe_publishable_key: publishable_key,
        stripe_session_id: session.id,
      };
    } catch (e) {
      console.log(e);
      throw new ConflictException(new AppError('ERR', 'invalid payment'));
    }
  }

  private async _chargeCustomer(
    user,
    event,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const payment_method = await this.createPayment(user);
    return await this.stripe.paymentIntents.create({
      payment_method: payment_method,
      currency: event.currency,
      amount: event.amount * 100,
    });
  }

  private async _getCustomerId(user: User): Promise<string> {
    if (user.customerId) {
      return user.customerId;
    } else {
      const customer = await this.stripe.customers.create({
        name: user.fullName,
        email: user.email,
      });
      return customer.id;
    }
  }

  /// TODO: webhook coming from stripe
  async handleWebhook(body: any): Promise<void> {
    const type = body.type;
    const result = body.data.object;
    if (!result) throw new InternalServerErrorException();
    // Handle the event based on its type
    switch (type) {
      case 'checkout.session.completed':
        await this._handleCheckoutSessionCompleted(result);
        break;
      case 'payment_intent.failed':
        // Handle payment failure
        break;
      case 'payment_intent.amount_capturable_updated':
        await this._handlePaymentIntentAmountCapturableUpdated(result);
        break;
      default:
      // Handle other event types
    }
  }

  private async _handleCheckoutSessionCompleted(result: any) {
    const event_id = result.metadata.event_id;
    const user_id = result.metadata.user_id;
    const paymentIntent = result.payment_intent;
    const event = await this.eventRepo.findOne({ where: { id: event_id } });
    const user = await this.userRepo.findOne({ where: { id: user_id } });
    const order = this.orderRepo.create({
      event,
      user,
      paymentIntent,
      status: Status.PAID,
    });
    await this.orderRepo.save(order);
  }

  private async _getStripeSession(
    event: Event,
    user: User,
    success_url: string,
    cancel_url: string,
  ) {
    try {
      const price = await this.stripe.prices.create({
        currency: event.currency,
        unit_amount: event.amount * 100,
        product_data: { name: event.name },
      });
      const session = await this.stripe.checkout.sessions.create({
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: {
          event_id: event.id,
          user_id: user.id,
          description: event.description,
          price: event.amount,
          currency: event.currency,
        },
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'payment',
      });
      return session;
    } catch (e) {
      throw new InternalServerErrorException(new AppError('INVALID_CHECKOUT'));
    }
  }

  private async createPayment(user): Promise<any> {
    return this.stripe.paymentMethods.create({
      type: 'card',
      billing_details: { email: user.email, name: user.full_name },
      card: {
        cvc: '040',
        number: '5555555555554444',
        exp_month: 3,
        exp_year: 2030,
      },
    });
  }

  // Create Free Order
  async freeOrder(createFreeOrderDto: CreateFreeOrderDto, user: User) {
    const { eventId } = createFreeOrderDto;
    const event = await this.eventRepo.findOneBy({ id: eventId });
    if (!event) {
      throw new NotFoundException(
        new AppError(
          'ERR_NOT_FOUND_EVENT',
          `Event with ID ${eventId} not found`,
        ),
      );
    }
    try {
      const order = this.orderRepo.create({
        user,
        event,
      });
      event.joinedNumberParticipants++;
      // console.log(event.joined_number_participants);
      await this.eventRepo.save(event);
      order.event = event;
      order.status = Status.FREE_ORDER;
      await this.orderRepo.save(order);
      return;
    } catch (e) {
      console.log(e);
      throw new ConflictException(new AppError('ERR', 'invalid order '));
    }
  }

  // Order Refund
  async refund(refundDto: RefundDto, user: User) {
    // Check Order Exists
    const { orderId, reason } = refundDto;
    const order = await this.orderRepo.findOne({
      relations: { user: true, event: true },
      where: {
        id: orderId,
        user: {
          id: user.id,
        },
      },
    });
    if (!order) {
      throw new NotFoundException(
        new AppError(
          'ERR_NOT_FOUND_ORDER',
          `Order with ID ${orderId} not found or this order not found on the orders list of  ${user.fullName} `,
        ),
      );
    }

    // Check Order Refund
    await this._checkOrderRefund(order, reason);
  }

  private async _checkOrderRefund(order: Order, reason: string) {
    if (order.status == Status.REFUNDED) {
      throw new InternalServerErrorException(
        new AppError('ERR', 'order_already_refunded'),
      );
    }
    if (order.status == Status.FREE_ORDER) {
      const refund = await this.refundRepo.create({ reason });
      await this.refundRepo.save(refund);
      order.status = Status.REFUNDED;
      await this.orderRepo.save(order);
    }

    if (order.status == Status.PAID) {
      try {
        await this.stripe.refunds.create({
          payment_intent: order.paymentIntent,
          reason: 'requested_by_customer',
        });
      } catch (e) {
        throw new InternalServerErrorException(
          new AppError('ERR', 'Payment_failed'),
        );
      }
      const refund = await this.refundRepo.create({ reason });
      await this.refundRepo.save(refund);
      order.status = Status.REFUNDED;
      await this.orderRepo.save(order);

      // TODO: Log Refund
    }
  }

  private async _handlePaymentIntentAmountCapturableUpdated(result: any) {
    const { event_id, user_id } = result.metadata;
    if (!event_id || !user_id) throw new InternalServerErrorException();
    await new Promise((res) => setTimeout(res, 5000));
    const paymentIntent: string = result.id;
    await this.stripe.paymentIntents.capture(paymentIntent);
    //const event = await this.eventRepo.findOne({ where: { id: event_id } });
    //const user = await this.userRepo.findOne({ where: { id: user_id } });
  }
}
