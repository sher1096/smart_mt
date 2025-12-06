import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  QueryScheduleDto,
  BatchCreateScheduleDto,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Schedule, Prisma } from '@prisma/client';

type ScheduleWithRelations = Schedule & {
  doctor: { id: number; name: string; title: string | null };
  department: { id: number; name: string };
};

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建排班
   */
  async create(dto: CreateScheduleDto): Promise<ScheduleWithRelations> {
    // 检查是否已存在相同的排班
    const existing = await this.prisma.schedule.findFirst({
      where: {
        doctorId: dto.doctorId,
        date: new Date(dto.date),
        timeSlot: dto.timeSlot,
      },
    });

    if (existing) {
      throw new ConflictException('该时段已有排班');
    }

    // 检查医生是否存在
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('医生不存在');
    }

    // 检查科室是否存在
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new NotFoundException('科室不存在');
    }

    return this.prisma.schedule.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        maxPatients: dto.maxPatients || 20,
        status: dto.status ?? 1,
      },
      include: {
        doctor: { select: { id: true, name: true, title: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * 批量创建排班
   */
  async batchCreate(dto: BatchCreateScheduleDto): Promise<{ count: number }> {
    const { doctorId, departmentId, startDate, endDate, timeSlots, fee, maxPatients } = dto;

    // 验证医生和科室
    const [doctor, department] = await Promise.all([
      this.prisma.doctor.findUnique({ where: { id: doctorId } }),
      this.prisma.department.findUnique({ where: { id: departmentId } }),
    ]);

    if (!doctor) throw new NotFoundException('医生不存在');
    if (!department) throw new NotFoundException('科室不存在');

    // 生成日期范围
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      throw new BadRequestException('开始日期不能大于结束日期');
    }

    const schedules: Prisma.ScheduleCreateManyInput[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      for (const timeSlot of timeSlots) {
        schedules.push({
          doctorId,
          departmentId,
          date: new Date(currentDate),
          timeSlot,
          fee,
          maxPatients: maxPatients || 20,
          status: 1,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 过滤掉已存在的排班
    const existingSchedules = await this.prisma.schedule.findMany({
      where: {
        doctorId,
        date: { gte: start, lte: end },
      },
      select: { date: true, timeSlot: true },
    });

    const existingSet = new Set(
      existingSchedules.map((s) => `${s.date.toISOString().split('T')[0]}_${s.timeSlot}`),
    );

    const newSchedules = schedules.filter(
      (s) =>
        !existingSet.has(
          `${(s.date as Date).toISOString().split('T')[0]}_${s.timeSlot}`,
        ),
    );

    if (newSchedules.length === 0) {
      return { count: 0 };
    }

    const result = await this.prisma.schedule.createMany({
      data: newSchedules,
      skipDuplicates: true,
    });

    return { count: result.count };
  }

  /**
   * 分页查询排班列表
   */
  async findAll(
    query: QueryScheduleDto,
  ): Promise<PaginatedResponseDto<ScheduleWithRelations>> {
    const {
      page = 1,
      pageSize = 10,
      doctorId,
      departmentId,
      date,
      startDate,
      endDate,
      status,
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ScheduleWhereInput = {
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
    };

    const [list, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
        include: {
          doctor: { select: { id: true, name: true, title: true } },
          department: { select: { id: true, name: true } },
        },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 查询可预约的排班（给患者用）
   */
  async findAvailable(query: QueryScheduleDto): Promise<PaginatedResponseDto<ScheduleWithRelations>> {
    const { page = 1, pageSize = 10, doctorId, departmentId, date, startDate, endDate } = query;
    const skip = (page - 1) * pageSize;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: Prisma.ScheduleWhereInput = {
      status: 1,
      date: {
        gte: today,
        ...(date && { equals: new Date(date) }),
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
      ...(doctorId && { doctorId }),
      ...(departmentId && { departmentId }),
      // 还有剩余名额
      bookedCount: {
        lt: this.prisma.schedule.fields.maxPatients,
      },
    };

    // 由于 Prisma 不支持直接比较两个字段，使用原始查询或调整逻辑
    const [list, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where: {
          ...where,
          bookedCount: undefined, // 先移除这个条件
        },
        skip,
        take: pageSize,
        orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
        include: {
          doctor: { select: { id: true, name: true, title: true } },
          department: { select: { id: true, name: true } },
        },
      }),
      this.prisma.schedule.count({
        where: {
          ...where,
          bookedCount: undefined,
        },
      }),
    ]);

    // 过滤出还有名额的排班
    const availableList = list.filter((s) => s.bookedCount < s.maxPatients);

    return createPaginatedResponse(availableList, total, page, pageSize);
  }

  /**
   * 根据ID查询排班
   */
  async findOne(id: number): Promise<ScheduleWithRelations> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, name: true, title: true } },
        department: { select: { id: true, name: true } },
      },
    });

    if (!schedule) {
      throw new NotFoundException('排班不存在');
    }

    return schedule;
  }

  /**
   * 更新排班
   */
  async update(id: number, dto: UpdateScheduleDto): Promise<ScheduleWithRelations> {
    await this.findOne(id);

    const data: Prisma.ScheduleUpdateInput = { ...dto };
    if (dto.date) {
      data.date = new Date(dto.date);
    }

    return this.prisma.schedule.update({
      where: { id },
      data,
      include: {
        doctor: { select: { id: true, name: true, title: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * 删除排班
   */
  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);

    // 检查是否有预约
    if (schedule.bookedCount > 0) {
      throw new BadRequestException('该排班已有预约，无法删除');
    }

    await this.prisma.schedule.delete({ where: { id } });
  }

  /**
   * 停诊
   */
  async suspend(id: number): Promise<ScheduleWithRelations> {
    await this.findOne(id);

    return this.prisma.schedule.update({
      where: { id },
      data: { status: 0 },
      include: {
        doctor: { select: { id: true, name: true, title: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * 恢复出诊
   */
  async resume(id: number): Promise<ScheduleWithRelations> {
    await this.findOne(id);

    return this.prisma.schedule.update({
      where: { id },
      data: { status: 1 },
      include: {
        doctor: { select: { id: true, name: true, title: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }
}
