import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePrescriptionDto,
  QueryPrescriptionDto,
  UpdatePrescriptionStatusDto,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Prescription, PrescriptionItem, Prisma } from '@prisma/client';

type PrescriptionWithRelations = Prescription & {
  patient: { id: number; name: string; phone: string | null };
  doctor: { id: number; name: string; title: string | null };
  medicalRecord: { id: number; diagnosis: string | null };
  items: (PrescriptionItem & {
    medicine: { id: number; name: string; unit: string | null };
  })[];
};

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 医生开处方
   */
  async create(dto: CreatePrescriptionDto, doctorId: number): Promise<PrescriptionWithRelations> {
    // 查询病历信息
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: dto.medicalRecordId },
      include: {
        appointment: true,
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('病历不存在');
    }

    // 验证医生是否是该病历的主治医生
    if (medicalRecord.doctorId !== doctorId) {
      throw new ForbiddenException('只能为自己的病历开处方');
    }

    // 验证药品是否存在并获取价格
    const medicines = await this.prisma.medicine.findMany({
      where: {
        id: { in: dto.items.map((item) => item.medicineId) },
      },
    });

    if (medicines.length !== dto.items.length) {
      throw new BadRequestException('部分药品不存在');
    }

    // 检查药品库存
    for (const item of dto.items) {
      const medicine = medicines.find((m) => m.id === item.medicineId);
      if (medicine && medicine.stock < item.quantity) {
        throw new BadRequestException(`药品 ${medicine.name} 库存不足`);
      }
    }

    // 创建药品映射表
    const medicineMap = new Map(medicines.map((m) => [m.id, m]));

    // 计算总金额
    let totalAmount = new Prisma.Decimal(0);
    const itemsWithPrice = dto.items.map((item) => {
      const medicine = medicineMap.get(item.medicineId);
      if (!medicine) {
        throw new BadRequestException(`药品ID ${item.medicineId} 不存在`);
      }
      const amount = medicine.price.mul(item.quantity);
      totalAmount = totalAmount.add(amount);
      return {
        ...item,
        price: medicine.price,
        amount,
      };
    });

    // 生成处方编号
    const prescriptionNo = this.generatePrescriptionNo();

    // 使用事务创建处方和明细
    const prescription = await this.prisma.$transaction(async (tx) => {
      // 创建处方
      const newPrescription = await tx.prescription.create({
        data: {
          prescriptionNo,
          medicalRecordId: dto.medicalRecordId,
          patientId: medicalRecord.patientId,
          doctorId,
          totalAmount,
          status: 0,
          items: {
            create: itemsWithPrice.map((item) => ({
              medicineId: item.medicineId,
              quantity: item.quantity,
              dosage: item.dosage,
              unitPrice: item.price,
              subtotal: item.amount,
            })),
          },
        },
        include: {
          patient: {
            select: { id: true, name: true, phone: true },
          },
          doctor: { select: { id: true, name: true, title: true } },
          medicalRecord: { select: { id: true, diagnosis: true } },
          items: {
            include: {
              medicine: { select: { id: true, name: true, unit: true } },
            },
          },
        },
      });

      // 更新药品库存
      for (const item of dto.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newPrescription;
    });

    return prescription as unknown as PrescriptionWithRelations;
  }

  /**
   * 分页查询处方列表
   */
  async findAll(
    query: QueryPrescriptionDto,
  ): Promise<PaginatedResponseDto<PrescriptionWithRelations>> {
    const {
      page = 1,
      pageSize = 10,
      patientId,
      doctorId,
      status,
      prescriptionNo,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PrescriptionWhereInput = {
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(status !== undefined && { status }),
      ...(prescriptionNo && { prescriptionNo: { contains: prescriptionNo } }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [list, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true, phone: true },
          },
          doctor: { select: { id: true, name: true, title: true } },
          medicalRecord: { select: { id: true, diagnosis: true } },
          items: {
            include: {
              medicine: { select: { id: true, name: true, unit: true } },
            },
          },
        },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 医生查询自己开的处方
   */
  async findDoctorPrescriptions(
    doctorId: number,
    query: QueryPrescriptionDto,
  ): Promise<PaginatedResponseDto<PrescriptionWithRelations>> {
    return this.findAll({ ...query, doctorId });
  }

  /**
   * 患者查询自己的处方
   */
  async findPatientPrescriptions(
    patientId: number,
    query: QueryPrescriptionDto,
  ): Promise<PaginatedResponseDto<PrescriptionWithRelations>> {
    return this.findAll({ ...query, patientId });
  }

  /**
   * 查询处方详情
   */
  async findOne(id: number): Promise<PrescriptionWithRelations> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        doctor: { select: { id: true, name: true, title: true } },
        medicalRecord: { select: { id: true, diagnosis: true } },
        items: {
          include: {
            medicine: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('处方不存在');
    }

    return prescription;
  }

  /**
   * 更新处方状态
   */
  async updateStatus(
    id: number,
    dto: UpdatePrescriptionStatusDto,
    userId?: number,
    userType?: string,
  ): Promise<PrescriptionWithRelations> {
    const prescription = await this.findOne(id);

    // 医生只能操作自己开的处方
    if (userType === 'doctor' && prescription.doctorId !== userId) {
      throw new ForbiddenException('只能操作自己开的处方');
    }

    // 状态验证
    if (prescription.status === 3) {
      throw new BadRequestException('已取消的处方无法修改状态');
    }

    // 状态流转校验
    if (dto.status === 1 && prescription.status !== 0) {
      throw new BadRequestException('只有待缴费的处方可以标记为已缴费');
    }

    if (dto.status === 2 && prescription.status !== 1) {
      throw new BadRequestException('只有已缴费的处方可以标记为已取药');
    }

    // 如果要取消处方，需要恢复药品库存
    if (dto.status === 3 && prescription.status === 0) {
      return this.prisma.$transaction(async (tx) => {
        // 恢复药品库存
        for (const item of prescription.items) {
          await tx.medicine.update({
            where: { id: item.medicineId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // 更新处方状态
        return tx.prescription.update({
          where: { id },
          data: { status: dto.status },
          include: {
            patient: {
              select: { id: true, name: true, phone: true },
            },
            doctor: { select: { id: true, name: true, title: true } },
            medicalRecord: { select: { id: true, diagnosis: true } },
            items: {
              include: {
                medicine: { select: { id: true, name: true, unit: true } },
              },
            },
          },
        });
      });
    }

    return this.prisma.prescription.update({
      where: { id },
      data: { status: dto.status },
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        doctor: { select: { id: true, name: true, title: true } },
        medicalRecord: { select: { id: true, diagnosis: true } },
        items: {
          include: {
            medicine: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    });
  }

  /**
   * 生成处方编号
   */
  private generatePrescriptionNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `CF${dateStr}${random}`;
  }
}
