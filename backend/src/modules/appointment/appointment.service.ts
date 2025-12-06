import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAppointmentDto,
  AdminCreateAppointmentDto,
  QueryAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Appointment, Prisma } from '@prisma/client';

type AppointmentWithRelations = Appointment & {
  patient: { id: number; name: string; phone: string | null; medicalCardNo: string | null };
  doctor: { id: number; name: string; title: string | null };
  department: { id: number; name: string };
  schedule: { id: number; timeSlot: string; fee: Prisma.Decimal };
};

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 患者挂号
   */
  async create(dto: CreateAppointmentDto, patientId: number): Promise<AppointmentWithRelations> {
    return this.createAppointment(dto.scheduleId, patientId);
  }

  /**
   * 管理员为患者挂号
   */
  async adminCreate(dto: AdminCreateAppointmentDto): Promise<AppointmentWithRelations> {
    return this.createAppointment(dto.scheduleId, dto.patientId);
  }

  /**
   * 创建挂号的核心逻辑
   */
  private async createAppointment(
    scheduleId: number,
    patientId: number,
  ): Promise<AppointmentWithRelations> {
    // 查询排班信息
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        doctor: true,
        department: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('排班不存在');
    }

    if (schedule.status !== 1) {
      throw new BadRequestException('该时段已停诊');
    }

    if (schedule.bookedCount >= schedule.maxPatients) {
      throw new BadRequestException('该时段已约满');
    }

    // 检查患者是否存在
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('患者不存在');
    }

    // 检查患者是否已预约该时段
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        scheduleId,
        status: { in: [0, 1] }, // 待就诊或已就诊
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('您已预约过该时段');
    }

    // 生成挂号单号
    const appointmentNo = this.generateAppointmentNo();

    // 计算排队号
    const queueNo = schedule.bookedCount + 1;

    // 使用事务创建挂号并更新排班
    const [appointment] = await this.prisma.$transaction([
      this.prisma.appointment.create({
        data: {
          appointmentNo,
          patientId,
          doctorId: schedule.doctorId,
          departmentId: schedule.departmentId,
          scheduleId,
          date: schedule.date,
          timeSlot: schedule.timeSlot,
          fee: schedule.fee,
          queueNo,
          status: 0,
        },
        include: {
          patient: {
            select: { id: true, name: true, phone: true, medicalCardNo: true },
          },
          doctor: { select: { id: true, name: true, title: true } },
          department: { select: { id: true, name: true } },
          schedule: { select: { id: true, timeSlot: true, fee: true } },
        },
      }),
      this.prisma.schedule.update({
        where: { id: scheduleId },
        data: { bookedCount: { increment: 1 } },
      }),
    ]);

    return appointment;
  }

  /**
   * 分页查询挂号列表
   */
  async findAll(
    query: QueryAppointmentDto,
  ): Promise<PaginatedResponseDto<AppointmentWithRelations>> {
    const {
      page = 1,
      pageSize = 10,
      patientId,
      doctorId,
      departmentId,
      date,
      startDate,
      endDate,
      status,
      appointmentNo,
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AppointmentWhereInput = {
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(departmentId && { departmentId }),
      ...(date && { date: new Date(date) }),
      ...(startDate &&
        endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(status !== undefined && { status }),
      ...(appointmentNo && { appointmentNo: { contains: appointmentNo } }),
    };

    const [list, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true, phone: true, medicalCardNo: true },
          },
          doctor: { select: { id: true, name: true, title: true } },
          department: { select: { id: true, name: true } },
          schedule: { select: { id: true, timeSlot: true, fee: true } },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 查询患者自己的挂号记录
   */
  async findMyAppointments(
    patientId: number,
    query: QueryAppointmentDto,
  ): Promise<PaginatedResponseDto<AppointmentWithRelations>> {
    return this.findAll({ ...query, patientId });
  }

  /**
   * 查询医生的挂号记录
   */
  async findDoctorAppointments(
    doctorId: number,
    query: QueryAppointmentDto,
  ): Promise<PaginatedResponseDto<AppointmentWithRelations>> {
    return this.findAll({ ...query, doctorId });
  }

  /**
   * 根据ID查询挂号详情
   */
  async findOne(id: number): Promise<AppointmentWithRelations> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, medicalCardNo: true },
        },
        doctor: { select: { id: true, name: true, title: true } },
        department: { select: { id: true, name: true } },
        schedule: { select: { id: true, timeSlot: true, fee: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('挂号记录不存在');
    }

    return appointment;
  }

  /**
   * 取消挂号
   */
  async cancel(id: number, patientId?: number): Promise<AppointmentWithRelations> {
    const appointment = await this.findOne(id);

    // 如果是患者取消，检查是否是自己的挂号
    if (patientId && appointment.patientId !== patientId) {
      throw new ForbiddenException('只能取消自己的挂号');
    }

    if (appointment.status !== 0) {
      throw new BadRequestException('只能取消待就诊状态的挂号');
    }

    // 使用事务取消挂号并更新排班
    const [updatedAppointment] = await this.prisma.$transaction([
      this.prisma.appointment.update({
        where: { id },
        data: { status: 2 },
        include: {
          patient: {
            select: { id: true, name: true, phone: true, medicalCardNo: true },
          },
          doctor: { select: { id: true, name: true, title: true } },
          department: { select: { id: true, name: true } },
          schedule: { select: { id: true, timeSlot: true, fee: true } },
        },
      }),
      this.prisma.schedule.update({
        where: { id: appointment.scheduleId },
        data: { bookedCount: { decrement: 1 } },
      }),
    ]);

    return updatedAppointment;
  }

  /**
   * 更新挂号状态（医生/管理员）
   */
  async updateStatus(
    id: number,
    dto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentWithRelations> {
    const appointment = await this.findOne(id);

    // 不能将已取消的挂号改为其他状态
    if (appointment.status === 2 && dto.status !== 2) {
      throw new BadRequestException('已取消的挂号无法修改状态');
    }

    // 如果从待就诊改为已取消，需要更新排班
    if (appointment.status === 0 && dto.status === 2) {
      const [updatedAppointment] = await this.prisma.$transaction([
        this.prisma.appointment.update({
          where: { id },
          data: { status: dto.status },
          include: {
            patient: {
              select: { id: true, name: true, phone: true, medicalCardNo: true },
            },
            doctor: { select: { id: true, name: true, title: true } },
            department: { select: { id: true, name: true } },
            schedule: { select: { id: true, timeSlot: true, fee: true } },
          },
        }),
        this.prisma.schedule.update({
          where: { id: appointment.scheduleId },
          data: { bookedCount: { decrement: 1 } },
        }),
      ]);
      return updatedAppointment;
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, medicalCardNo: true },
        },
        doctor: { select: { id: true, name: true, title: true } },
        department: { select: { id: true, name: true } },
        schedule: { select: { id: true, timeSlot: true, fee: true } },
      },
    });
  }

  /**
   * 生成挂号单号
   */
  private generateAppointmentNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `GH${dateStr}${random}`;
  }
}
