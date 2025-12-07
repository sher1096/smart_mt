import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExamItemDto,
  UpdateExamItemDto,
  QueryExamItemDto,
  CreateExaminationDto,
  UpdateExaminationStatusDto,
  UpdateExaminationItemDto,
  QueryExaminationDto,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { ExamItem, Examination, ExaminationItem, Prisma } from '@prisma/client';

type ExaminationWithRelations = Examination & {
  patient: { id: number; name: string; phone: string | null; medicalCardNo: string | null };
  doctor: { id: number; name: string; title: string | null } | null;
  items: (ExaminationItem & {
    examItem: { id: number; name: string; price: Prisma.Decimal; description?: string | null };
  })[];
};

@Injectable()
export class ExaminationService {
  constructor(private prisma: PrismaService) {}

  /**
   * ==================== 体检项目管理 ====================
   */

  /**
   * 创建体检项目
   */
  async createExamItem(dto: CreateExamItemDto): Promise<ExamItem> {
    // 检查名称是否已存在
    const exists = await this.prisma.examItem.findFirst({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('该体检项目名称已存在');
    }

    return this.prisma.examItem.create({
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
        status: dto.status ?? 1,
      },
    });
  }

  /**
   * 更新体检项目
   */
  async updateExamItem(id: number, dto: UpdateExamItemDto): Promise<ExamItem> {
    const item = await this.prisma.examItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('体检项目不存在');
    }

    // 如果修改了名称，检查新名称是否已存在
    if (dto.name && dto.name !== item.name) {
      const exists = await this.prisma.examItem.findFirst({
        where: { name: dto.name },
      });

      if (exists) {
        throw new BadRequestException('该体检项目名称已存在');
      }
    }

    return this.prisma.examItem.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  /**
   * 删除体检项目
   */
  async deleteExamItem(id: number): Promise<ExamItem> {
    const item = await this.prisma.examItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('体检项目不存在');
    }

    // 检查是否有关联的体检记录
    const hasExaminations = await this.prisma.examinationItem.findFirst({
      where: { examItemId: id },
    });

    if (hasExaminations) {
      throw new BadRequestException('该体检项目已被使用，无法删除');
    }

    return this.prisma.examItem.delete({ where: { id } });
  }

  /**
   * 分页查询体检项目
   */
  async findAllExamItems(
    query: QueryExamItemDto,
  ): Promise<PaginatedResponseDto<ExamItem>> {
    const { page = 1, pageSize = 10, name, status } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ExamItemWhereInput = {
      ...(name && { name: { contains: name } }),
      ...(status !== undefined && { status }),
    };

    const [list, total] = await Promise.all([
      this.prisma.examItem.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.examItem.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 查询体检项目详情
   */
  async findOneExamItem(id: number): Promise<ExamItem> {
    const item = await this.prisma.examItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('体检项目不存在');
    }

    return item;
  }

  /**
   * ==================== 体检单管理 ====================
   */

  /**
   * 创建体检单（开体检单）
   */
  async createExamination(dto: CreateExaminationDto, currentUserId?: number): Promise<ExaminationWithRelations> {
    // 检查患者是否存在
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('患者不存在');
    }

    // 检查医生是否存在
    if (dto.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: dto.doctorId },
      });

      if (!doctor) {
        throw new NotFoundException('医生不存在');
      }
    }

    // 查询体检项目并计算总金额
    const examItems = await this.prisma.examItem.findMany({
      where: {
        id: { in: dto.examItemIds },
        status: 1, // 只能选择启用的项目
      },
    });

    if (examItems.length !== dto.examItemIds.length) {
      throw new BadRequestException('部分体检项目不存在或已停用');
    }

    // 计算总金额
    const totalAmount = examItems.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    // 生成体检单号
    const examNo = this.generateExamNo();

    // 使用事务创建体检单和明细
    const examination = await this.prisma.$transaction(async (tx) => {
      // 创建体检单
      const exam = await tx.examination.create({
        data: {
          examNo,
          examDate: new Date(),
          patientId: dto.patientId,
          doctorId: dto.doctorId || currentUserId,
          totalAmount,
          status: 0, // 待缴费
        },
      });

      // 创建体检项目明细
      await tx.examinationItem.createMany({
        data: examItems.map((item) => ({
          examinationId: exam.id,
          examItemId: item.id,
          status: 0, // 未检
        })),
      });

      // 返回完整信息
      return tx.examination.findUnique({
        where: { id: exam.id },
        include: {
          patient: {
            select: { id: true, name: true, phone: true, medicalCardNo: true },
          },
          doctor: {
            select: { id: true, name: true, title: true },
          },
          items: {
            include: {
              examItem: {
                select: { id: true, name: true, price: true, description: true },
              },
            },
          },
        },
      });
    });

    if (!examination) {
      throw new NotFoundException('体检单创建失败');
    }

    return examination;
  }

  /**
   * 更新体检单状态
   */
  async updateExaminationStatus(
    id: number,
    dto: UpdateExaminationStatusDto,
  ): Promise<ExaminationWithRelations> {
    const examination = await this.findOneExamination(id);

    // 已取消的体检单不能修改状态
    if (examination.status === 4) {
      throw new BadRequestException('已取消的体检单无法修改状态');
    }

    // 如果要标记为已完成，检查所有项目是否都已检查
    if (dto.status === 3) {
      const unfinishedItems = await this.prisma.examinationItem.count({
        where: {
          examinationId: id,
          status: 0, // 未检
        },
      });

      if (unfinishedItems > 0) {
        throw new BadRequestException('仍有体检项目未完成，无法标记为已完成');
      }
    }

    const updated = await this.prisma.examination.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === 3 && { reportTime: new Date() }),
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, medicalCardNo: true },
        },
        doctor: {
          select: { id: true, name: true, title: true },
        },
        items: {
          include: {
            examItem: {
              select: { id: true, name: true, price: true, description: true },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * 录入体检项目结果
   */
  async updateExaminationItem(
    examinationId: number,
    itemId: number,
    dto: UpdateExaminationItemDto,
  ): Promise<ExaminationItem> {
    // 检查体检单是否存在
    const examination = await this.findOneExamination(examinationId);

    // 只有已缴费待检或检查中的体检单才能录入结果
    if (examination.status !== 1 && examination.status !== 2) {
      throw new BadRequestException('只有已缴费待检或检查中的体检单才能录入结果');
    }

    // 检查体检项目是否存在
    const item = await this.prisma.examinationItem.findFirst({
      where: {
        id: itemId,
        examinationId,
      },
    });

    if (!item) {
      throw new NotFoundException('体检项目不存在');
    }

    // 更新体检项目结果
    const updatedItem = await this.prisma.examinationItem.update({
      where: { id: itemId },
      data: {
        ...(dto.result !== undefined && { result: dto.result }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.status === 1 && { checkedAt: new Date() }),
      },
    });

    // 如果体检单状态还是待检，自动更新为检查中
    if (examination.status === 1) {
      await this.prisma.examination.update({
        where: { id: examinationId },
        data: { status: 2 }, // 检查中
      });
    }

    return updatedItem;
  }

  /**
   * 分页查询体检单
   */
  async findAllExaminations(
    query: QueryExaminationDto,
  ): Promise<PaginatedResponseDto<ExaminationWithRelations>> {
    const {
      page = 1,
      pageSize = 10,
      patientId,
      doctorId,
      status,
      startDate,
      endDate,
      examNo,
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ExaminationWhereInput = {
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(status !== undefined && { status }),
      ...(examNo && { examNo: { contains: examNo } }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [list, total] = await Promise.all([
      this.prisma.examination.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, name: true, phone: true, medicalCardNo: true },
          },
          doctor: {
            select: { id: true, name: true, title: true },
          },
          items: {
            include: {
              examItem: {
                select: { id: true, name: true, price: true, description: true },
              },
            },
          },
        },
      }),
      this.prisma.examination.count({ where }),
    ]);

    return createPaginatedResponse(list as unknown as ExaminationWithRelations[], total, page, pageSize);
  }

  /**
   * 查询患者自己的体检记录
   */
  async findMyExaminations(
    patientId: number,
    query: QueryExaminationDto,
  ): Promise<PaginatedResponseDto<ExaminationWithRelations>> {
    return this.findAllExaminations({ ...query, patientId });
  }

  /**
   * 查询体检单详情
   */
  async findOneExamination(id: number): Promise<ExaminationWithRelations> {
    const examination = await this.prisma.examination.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, medicalCardNo: true },
        },
        doctor: {
          select: { id: true, name: true, title: true },
        },
        items: {
          include: {
            examItem: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!examination) {
      throw new NotFoundException('体检单不存在');
    }

    return examination as unknown as ExaminationWithRelations;
  }

  /**
   * 取消体检单
   */
  async cancelExamination(id: number, patientId?: number): Promise<ExaminationWithRelations> {
    const examination = await this.findOneExamination(id);

    // 如果是患者取消，检查是否是自己的体检单
    if (patientId && examination.patientId !== patientId) {
      throw new ForbiddenException('只能取消自己的体检单');
    }

    // 只能取消待缴费或已缴费待检的体检单
    if (examination.status !== 0 && examination.status !== 1) {
      throw new BadRequestException('只能取消待缴费或已缴费待检的体检单');
    }

    const cancelled = await this.prisma.examination.update({
      where: { id },
      data: { status: 4 }, // 已取消
      include: {
        patient: {
          select: { id: true, name: true, phone: true, medicalCardNo: true },
        },
        doctor: {
          select: { id: true, name: true, title: true },
        },
        items: {
          include: {
            examItem: {
              select: { id: true, name: true, price: true, description: true },
            },
          },
        },
      },
    });

    return cancelled as unknown as ExaminationWithRelations;
  }

  /**
   * 生成体检单号
   * 格式：TJ + 日期(YYYYMMDD) + 4位随机数
   */
  private generateExamNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `TJ${dateStr}${random}`;
  }
}
