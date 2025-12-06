import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  QueryMedicalRecordDto,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { MedicalRecord, Prisma } from '@prisma/client';

type MedicalRecordWithRelations = MedicalRecord & {
  patient: { id: number; name: string; phone: string | null; gender: string | null };
  doctor: { id: number; name: string; title: string | null };
  appointment: {
    id: number;
    appointmentNo: string;
    date: Date;
    timeSlot: string;
  };
  prescriptions?: Array<{
    id: number;
    prescriptionNo: string;
    totalAmount: Prisma.Decimal;
    status: number;
    createdAt: Date;
  }>;
};

@Injectable()
export class MedicalRecordService {
  constructor(private prisma: PrismaService) {}

  /**
   * 医生创建病历
   */
  async create(
    dto: CreateMedicalRecordDto,
    doctorId: number,
  ): Promise<MedicalRecordWithRelations> {
    // 查询挂号信息
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('挂号记录不存在');
    }

    // 验证挂号的医生是否是当前医生
    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException('只能为自己的患者创建病历');
    }

    // 检查是否已存在病历
    const existingRecord = await this.prisma.medicalRecord.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingRecord) {
      throw new BadRequestException('该挂号已有病历记录');
    }

    // 创建病历
    const medicalRecord = await this.prisma.medicalRecord.create({
      data: {
        appointmentId: dto.appointmentId,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        chiefComplaint: dto.chiefComplaint,
        presentIllness: dto.presentIllness,
        pastHistory: dto.pastHistory,
        physicalExam: dto.physicalExam,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, gender: true },
        },
        doctor: {
          select: { id: true, name: true, title: true },
        },
        appointment: {
          select: {
            id: true,
            appointmentNo: true,
            date: true,
            timeSlot: true,
          },
        },
      },
    });

    return medicalRecord;
  }

  /**
   * 医生更新病历
   */
  async update(
    id: number,
    dto: UpdateMedicalRecordDto,
    doctorId: number,
  ): Promise<MedicalRecordWithRelations> {
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!medicalRecord) {
      throw new NotFoundException('病历记录不存在');
    }

    // 验证是否是医生自己的病历
    if (medicalRecord.doctorId !== doctorId) {
      throw new ForbiddenException('只能修改自己创建的病历');
    }

    // 更新病历
    const updatedRecord = await this.prisma.medicalRecord.update({
      where: { id },
      data: {
        chiefComplaint: dto.chiefComplaint,
        presentIllness: dto.presentIllness,
        pastHistory: dto.pastHistory,
        physicalExam: dto.physicalExam,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, gender: true },
        },
        doctor: {
          select: { id: true, name: true, title: true },
        },
        appointment: {
          select: {
            id: true,
            appointmentNo: true,
            date: true,
            timeSlot: true,
          },
        },
      },
    });

    return updatedRecord;
  }

  /**
   * 查询病历列表（分页）
   */
  async findAll(
    query: QueryMedicalRecordDto,
  ): Promise<PaginatedResponseDto<MedicalRecordWithRelations>> {
    const { page = 1, pageSize = 10, patientId, doctorId, startDate, endDate } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MedicalRecordWhereInput = {
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [list, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true, phone: true, gender: true },
          },
          doctor: {
            select: { id: true, name: true, title: true },
          },
          appointment: {
            select: {
              id: true,
              appointmentNo: true,
              date: true,
              timeSlot: true,
            },
          },
        },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 医生查询自己创建的病历列表
   */
  async findDoctorRecords(
    doctorId: number,
    query: QueryMedicalRecordDto,
  ): Promise<PaginatedResponseDto<MedicalRecordWithRelations>> {
    return this.findAll({ ...query, doctorId });
  }

  /**
   * 患者查询自己的病历列表
   */
  async findPatientRecords(
    patientId: number,
    query: QueryMedicalRecordDto,
  ): Promise<PaginatedResponseDto<MedicalRecordWithRelations>> {
    return this.findAll({ ...query, patientId });
  }

  /**
   * 查询病历详情（包含处方）
   */
  async findOne(id: number, userId?: number, userType?: string): Promise<MedicalRecordWithRelations> {
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, gender: true },
        },
        doctor: {
          select: { id: true, name: true, title: true },
        },
        appointment: {
          select: {
            id: true,
            appointmentNo: true,
            date: true,
            timeSlot: true,
          },
        },
        prescriptions: {
          select: {
            id: true,
            prescriptionNo: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('病历记录不存在');
    }

    // 如果指定了用户ID和用户类型，进行权限验证
    if (userId && userType) {
      if (userType === 'doctor' && medicalRecord.doctorId !== userId) {
        throw new ForbiddenException('只能查看自己的病历记录');
      }
      if (userType === 'patient' && medicalRecord.patientId !== userId) {
        throw new ForbiddenException('只能查看自己的病历记录');
      }
    }

    return medicalRecord;
  }
}
