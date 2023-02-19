import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateFreeOrderDto } from './dto/create-free-order.dto';
import { RefundDto } from './dto/refund.dto';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('create_checkout')
  @UseGuards(AuthGuard('jwt'))
  async createCheckout(
    @GetUser() user: User,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.stripeService.createCheckout(checkoutDto, user);
  }

  @Post('order')
  @UseGuards(AuthGuard('jwt'))
  async freeOrder(
    @GetUser() user: User,
    @Body() createFreeOrderDto: CreateFreeOrderDto,
  ) {
    return this.stripeService.freeOrder(createFreeOrderDto, user);
  }

  @Post('order_refund')
  @UseGuards(AuthGuard('jwt'))
  async refund(@GetUser() user: User, @Body() refundDto: RefundDto) {
    return this.stripeService.refund(refundDto, user);
  }

  @Post('webhook')
  async webhook(@Body() body: any) {
    await this.stripeService.handleWebhook(body);
    console.log('webhook');
    console.log(body);
  }

  // @Get('order/:id')
  // @UseGuards(AuthGuard('jwt'))
  // async findOrder(@GetUser() user: User, @Param('id') id: string) {
  //   await this.stripeService.findOrder(id, user);
  // }
}
