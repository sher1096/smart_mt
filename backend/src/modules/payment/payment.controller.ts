import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  PayDto,
  QueryPaymentDto,
  CreateRechargeDto,
  ConfirmRechargeDto,
  QueryRechargeDto,
} from './dto';
import { Roles, UserType, CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('缴费管理')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ==================== 缴费单相关接口 ====================

  @Post()
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '创建缴费单（患者）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '关联记录不存在' })
  createPayment(@Body() dto: CreatePaymentDto, @CurrentUser() user: JwtPayload) {
    return this.paymentService.createPayment(dto, user.sub);
  }

  @Post('pay')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '支付缴费单（患者）' })
  @ApiResponse({ status: 200, description: '支付成功' })
  @ApiResponse({ status: 400, description: '缴费单状态错误或余额不足' })
  @ApiResponse({ status: 403, description: '只能支付自己的缴费单' })
  @ApiResponse({ status: 404, description: '缴费单不存在' })
  pay(@Body() dto: PayDto, @CurrentUser() user: JwtPayload) {
    return this.paymentService.pay(dto, user.sub);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '查询所有缴费记录（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllPayments(@Query() query: QueryPaymentDto) {
    return this.paymentService.findAllPayments(query);
  }

  @Get('my')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '查询我的缴费记录（患者）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findMyPayments(@CurrentUser() user: JwtPayload, @Query() query: QueryPaymentDto) {
    return this.paymentService.findMyPayments(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询缴费单详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '缴费单不存在' })
  findPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findPaymentById(id);
  }

  @Post(':id/cancel')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '取消缴费单（患者）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待支付状态的缴费单' })
  @ApiResponse({ status: 403, description: '只能取消自己的缴费单' })
  @ApiResponse({ status: 404, description: '缴费单不存在' })
  cancelPayment(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.paymentService.cancelPayment(id, user.sub);
  }

  @Post(':id/admin-cancel')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '取消缴费单（管理员）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待支付状态的缴费单' })
  @ApiResponse({ status: 404, description: '缴费单不存在' })
  adminCancelPayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.cancelPayment(id);
  }

  // ==================== 充值相关接口 ====================

  @Post('recharges')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '创建充值单（患者）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '患者不存在' })
  createRecharge(@Body() dto: CreateRechargeDto, @CurrentUser() user: JwtPayload) {
    return this.paymentService.createRecharge(dto, user.sub);
  }

  @Post('recharges/confirm')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '确认充值（管理员）' })
  @ApiResponse({ status: 200, description: '确认成功' })
  @ApiResponse({ status: 400, description: '充值单状态错误' })
  @ApiResponse({ status: 404, description: '充值单不存在' })
  confirmRecharge(@Body() dto: ConfirmRechargeDto) {
    return this.paymentService.confirmRecharge(dto);
  }

  @Get('recharges')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '查询所有充值记录（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllRecharges(@Query() query: QueryRechargeDto) {
    return this.paymentService.findAllRecharges(query);
  }

  @Get('recharges/my')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '查询我的充值记录（患者）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findMyRecharges(@CurrentUser() user: JwtPayload, @Query() query: QueryRechargeDto) {
    return this.paymentService.findMyRecharges(user.sub, query);
  }

  @Get('recharges/:id')
  @ApiOperation({ summary: '查询充值单详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '充值单不存在' })
  findRechargeById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findRechargeById(id);
  }

  @Post('recharges/:id/cancel')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '取消充值单（患者）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待确认状态的充值单' })
  @ApiResponse({ status: 403, description: '只能取消自己的充值单' })
  @ApiResponse({ status: 404, description: '充值单不存在' })
  cancelRecharge(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.paymentService.cancelRecharge(id, user.sub);
  }

  @Post('recharges/:id/admin-cancel')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '取消充值单（管理员）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待确认状态的充值单' })
  @ApiResponse({ status: 404, description: '充值单不存在' })
  adminCancelRecharge(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.cancelRecharge(id);
  }
}
