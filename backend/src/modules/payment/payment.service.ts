import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePaymentDto,
  PayDto,
  QueryPaymentDto,
  CreateRechargeDto,
  ConfirmRechargeDto,
  QueryRechargeDto,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Payment, Recharge, Prisma } from '@prisma/client';

type PaymentWithRelations = Payment & {
  patient: { id: number; name: string; phone: string | null };
};

type RechargeWithRelations = Recharge & {
  patient: { id: number; name: string; phone: string | null };
};

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建缴费单
   */
  async createPayment(dto: CreatePaymentDto, patientId: number): Promise<PaymentWithRelations> {
    // 验证患者存在
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('患者不存在');
    }

    // 验证关联记录存在
    await this.validateRefRecord(dto.type, dto.refId, patientId);

    // 生成缴费单号
    const paymentNo = this.generatePaymentNo();

    // 创建缴费单
    const payment = await this.prisma.payment.create({
      data: {
        paymentNo,
        patientId,
        type: dto.type,
        refId: dto.refId,
        amount: dto.amount,
        payMethod: 0, // 初始支付方式为0
        status: 0, // 待支付
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    return payment;
  }

  /**
   * 确认支付缴费单
   */
  async pay(dto: PayDto, patientId: number): Promise<PaymentWithRelations> {
    // 查询缴费单
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: {
        patient: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('缴费单不存在');
    }

    if (payment.patientId !== patientId) {
      throw new ForbiddenException('只能支付自己的缴费单');
    }

    if (payment.status !== 0) {
      throw new BadRequestException('该缴费单已支付或已取消');
    }

    // 如果使用余额支付，检查余额是否充足
    if (dto.payMethod === 1) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new NotFoundException('患者不存在');
      }

      const balance = Number(patient.balance);
      const amount = Number(payment.amount);

      if (balance < amount) {
        throw new BadRequestException('余额不足，请先充值');
      }

      // 使用事务：更新缴费单状态、扣除余额、更新关联记录状态
      return this.payWithTransaction(payment, dto.payMethod, patientId);
    }

    // 其他支付方式直接更新缴费单状态和关联记录
    return this.payWithTransaction(payment, dto.payMethod, null);
  }

  /**
   * 使用事务处理支付
   */
  private async payWithTransaction(
    payment: Payment,
    payMethod: number,
    patientId: number | null,
  ): Promise<PaymentWithRelations> {
    const operations: any[] = [
      // 更新缴费单状态
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 1,
          payMethod,
          paidAt: new Date(),
        },
        include: {
          patient: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
    ];

    // 如果使用余额支付，扣除余额
    if (payMethod === 1 && patientId) {
      operations.push(
        this.prisma.patient.update({
          where: { id: patientId },
          data: {
            balance: {
              decrement: payment.amount,
            },
          },
        }),
      );
    }

    // 根据缴费类型更新关联记录状态
    operations.push(this.updateRefRecordStatus(payment.type, payment.refId));

    const [updatedPayment] = await this.prisma.$transaction(operations);
    return updatedPayment;
  }

  /**
   * 取消缴费单
   */
  async cancelPayment(id: number, patientId?: number): Promise<PaymentWithRelations> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('缴费单不存在');
    }

    if (patientId && payment.patientId !== patientId) {
      throw new ForbiddenException('只能取消自己的缴费单');
    }

    if (payment.status !== 0) {
      throw new BadRequestException('只能取消待支付状态的缴费单');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: 2 },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
      },
    });
  }

  /**
   * 查询缴费记录
   */
  async findAllPayments(
    query: QueryPaymentDto,
  ): Promise<PaginatedResponseDto<PaymentWithRelations>> {
    const {
      page = 1,
      pageSize = 10,
      patientId,
      type,
      status,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PaymentWhereInput = {
      ...(patientId && { patientId }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [list, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 查询患者自己的缴费记录
   */
  async findMyPayments(
    patientId: number,
    query: QueryPaymentDto,
  ): Promise<PaginatedResponseDto<PaymentWithRelations>> {
    return this.findAllPayments({ ...query, patientId });
  }

  /**
   * 查询缴费单详情
   */
  async findPaymentById(id: number): Promise<PaymentWithRelations> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('缴费单不存在');
    }

    return payment;
  }

  /**
   * 创建充值单
   */
  async createRecharge(dto: CreateRechargeDto, patientId: number): Promise<RechargeWithRelations> {
    // 验证患者存在
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('患者不存在');
    }

    // 生成充值单号
    const rechargeNo = this.generateRechargeNo();

    // 创建充值单
    const recharge = await this.prisma.recharge.create({
      data: {
        rechargeNo,
        patientId,
        amount: dto.amount,
        payMethod: 0, // 初始支付方式为0
        status: 0, // 待确认
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    return recharge;
  }

  /**
   * 确认充值（管理员）
   */
  async confirmRecharge(dto: ConfirmRechargeDto): Promise<RechargeWithRelations> {
    // 查询充值单
    const recharge = await this.prisma.recharge.findUnique({
      where: { id: dto.rechargeId },
    });

    if (!recharge) {
      throw new NotFoundException('充值单不存在');
    }

    if (recharge.status !== 0) {
      throw new BadRequestException('该充值单已确认或已取消');
    }

    // 使用事务：更新充值单状态、增加患者余额
    const [updatedRecharge] = await this.prisma.$transaction([
      this.prisma.recharge.update({
        where: { id: dto.rechargeId },
        data: {
          status: 1,
          payMethod: dto.payMethod,
        },
        include: {
          patient: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
      this.prisma.patient.update({
        where: { id: recharge.patientId },
        data: {
          balance: {
            increment: recharge.amount,
          },
        },
      }),
    ]);

    return updatedRecharge;
  }

  /**
   * 取消充值单
   */
  async cancelRecharge(id: number, patientId?: number): Promise<RechargeWithRelations> {
    const recharge = await this.prisma.recharge.findUnique({
      where: { id },
    });

    if (!recharge) {
      throw new NotFoundException('充值单不存在');
    }

    if (patientId && recharge.patientId !== patientId) {
      throw new ForbiddenException('只能取消自己的充值单');
    }

    if (recharge.status !== 0) {
      throw new BadRequestException('只能取消待确认状态的充值单');
    }

    return this.prisma.recharge.update({
      where: { id },
      data: { status: 2 },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
      },
    });
  }

  /**
   * 查询充值记录
   */
  async findAllRecharges(
    query: QueryRechargeDto,
  ): Promise<PaginatedResponseDto<RechargeWithRelations>> {
    const { page = 1, pageSize = 10, patientId, status, startDate, endDate } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.RechargeWhereInput = {
      ...(patientId && { patientId }),
      ...(status !== undefined && { status }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [list, total] = await Promise.all([
      this.prisma.recharge.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
      this.prisma.recharge.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 查询患者自己的充值记录
   */
  async findMyRecharges(
    patientId: number,
    query: QueryRechargeDto,
  ): Promise<PaginatedResponseDto<RechargeWithRelations>> {
    return this.findAllRecharges({ ...query, patientId });
  }

  /**
   * 查询充值单详情
   */
  async findRechargeById(id: number): Promise<RechargeWithRelations> {
    const recharge = await this.prisma.recharge.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!recharge) {
      throw new NotFoundException('充值单不存在');
    }

    return recharge;
  }

  /**
   * 验证关联记录是否存在
   */
  private async validateRefRecord(type: number, refId: number, patientId: number): Promise<void> {
    switch (type) {
      case 1: // 挂号费
        const appointment = await this.prisma.appointment.findUnique({
          where: { id: refId },
        });
        if (!appointment) {
          throw new NotFoundException('挂号记录不存在');
        }
        if (appointment.patientId !== patientId) {
          throw new ForbiddenException('只能为自己的挂号创建缴费单');
        }
        break;

      case 2: // 处方费
        const prescription = await this.prisma.prescription.findUnique({
          where: { id: refId },
        });
        if (!prescription) {
          throw new NotFoundException('处方记录不存在');
        }
        if (prescription.patientId !== patientId) {
          throw new ForbiddenException('只能为自己的处方创建缴费单');
        }
        break;

      case 3: // 体检费
        const examination = await this.prisma.examination.findUnique({
          where: { id: refId },
        });
        if (!examination) {
          throw new NotFoundException('体检记录不存在');
        }
        if (examination.patientId !== patientId) {
          throw new ForbiddenException('只能为自己的体检创建缴费单');
        }
        break;

      default:
        throw new BadRequestException('无效的缴费类型');
    }
  }

  /**
   * 更新关联记录的支付状态
   */
  private updateRefRecordStatus(type: number, refId: number): any {
    switch (type) {
      case 1: // 挂号费 - 更新挂号记录的 isPaid 字段
        return this.prisma.appointment.update({
          where: { id: refId },
          data: { isPaid: 1 },
        });

      case 2: // 处方费 - 更新处方记录的 isPaid 字段
        return this.prisma.prescription.update({
          where: { id: refId },
          data: { isPaid: 1 },
        });

      case 3: // 体检费 - 更新体检记录的 isPaid 字段
        return this.prisma.examination.update({
          where: { id: refId },
          data: { isPaid: 1 },
        });

      default:
        throw new BadRequestException('无效的缴费类型');
    }
  }

  /**
   * 生成缴费单号: JF + 日期 + 4位随机数
   */
  private generatePaymentNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `JF${dateStr}${random}`;
  }

  /**
   * 生成充值单号: CZ + 日期 + 4位随机数
   */
  private generateRechargeNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `CZ${dateStr}${random}`;
  }
}
