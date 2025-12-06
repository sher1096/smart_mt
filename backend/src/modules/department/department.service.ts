import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDepartmentCategoryDto,
  UpdateDepartmentCategoryDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
} from './dto';
import { createPaginatedResponse } from '../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  // ==================== 科室分类管理 ====================

  /**
   * 创建科室分类
   */
  async createCategory(dto: CreateDepartmentCategoryDto) {
    // 检查分类名称是否已存在
    const existing = await this.prisma.departmentCategory.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('分类名称已存在');
    }

    return this.prisma.departmentCategory.create({
      data: dto,
    });
  }

  /**
   * 查询所有科室分类
   */
  async findAllCategories() {
    return this.prisma.departmentCategory.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });
  }

  /**
   * 根据ID查询科室分类
   */
  async findOneCategory(id: number) {
    const category = await this.prisma.departmentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('科室分类不存在');
    }

    return category;
  }

  /**
   * 更新科室分类
   */
  async updateCategory(id: number, dto: UpdateDepartmentCategoryDto) {
    await this.findOneCategory(id);

    // 如果更新名称，检查是否重复
    if (dto.name) {
      const existing = await this.prisma.departmentCategory.findUnique({
        where: { name: dto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('分类名称已存在');
      }
    }

    return this.prisma.departmentCategory.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除科室分类
   */
  async removeCategory(id: number): Promise<void> {
    await this.findOneCategory(id);

    // 检查是否有关联的科室
    const departmentCount = await this.prisma.department.count({
      where: { categoryId: id },
    });

    if (departmentCount > 0) {
      throw new BadRequestException(`该分类下还有 ${departmentCount} 个科室，无法删除`);
    }

    await this.prisma.departmentCategory.delete({ where: { id } });
  }

  // ==================== 科室信息管理 ====================

  /**
   * 创建科室
   */
  async create(dto: CreateDepartmentDto) {
    // 检查科室编码是否已存在
    const existingCode = await this.prisma.department.findUnique({
      where: { code: dto.code },
    });

    if (existingCode) {
      throw new ConflictException('科室编码已存在');
    }

    // 检查分类是否存在
    await this.findOneCategory(dto.categoryId);

    return this.prisma.department.create({
      data: dto,
      include: {
        category: true,
      },
    });
  }

  /**
   * 分页查询科室列表
   */
  async findAll(query: QueryDepartmentDto) {
    const { page = 1, pageSize = 10, code, name, categoryId, status } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.DepartmentWhereInput = {
      ...(code && { code: { contains: code } }),
      ...(name && { name: { contains: name } }),
      ...(categoryId && { categoryId }),
      ...(status !== undefined && { status }),
    };

    const [list, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: {
            select: {
              doctors: true,
              schedules: true,
            },
          },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 查询所有科室（不分页，用于下拉选择等）
   */
  async findAllSimple() {
    return this.prisma.department.findMany({
      where: { status: 1 },
      orderBy: [{ categoryId: 'asc' }, { id: 'asc' }],
      include: {
        category: true,
      },
    });
  }

  /**
   * 根据ID查询科室
   */
  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: {
            doctors: true,
            schedules: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('科室不存在');
    }

    return department;
  }

  /**
   * 根据科室编码查询
   */
  async findByCode(code: string) {
    const department = await this.prisma.department.findUnique({
      where: { code },
      include: {
        category: true,
      },
    });

    if (!department) {
      throw new NotFoundException('科室不存在');
    }

    return department;
  }

  /**
   * 根据分类ID查询科室列表
   */
  async findByCategory(categoryId: number) {
    // 先检查分类是否存在
    await this.findOneCategory(categoryId);

    return this.prisma.department.findMany({
      where: {
        categoryId,
        status: 1,
      },
      orderBy: [{ id: 'asc' }],
      include: {
        category: true,
      },
    });
  }

  /**
   * 更新科室
   */
  async update(id: number, dto: UpdateDepartmentDto) {
    await this.findOne(id);

    // 如果更新编码，检查是否重复
    if (dto.code) {
      const existing = await this.prisma.department.findUnique({
        where: { code: dto.code },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('科室编码已存在');
      }
    }

    // 如果更新分类，检查分类是否存在
    if (dto.categoryId) {
      await this.findOneCategory(dto.categoryId);
    }

    return this.prisma.department.update({
      where: { id },
      data: dto,
      include: {
        category: true,
      },
    });
  }

  /**
   * 删除科室
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);

    // 检查是否有关联的医生
    const doctorCount = await this.prisma.doctor.count({
      where: { departmentId: id },
    });

    if (doctorCount > 0) {
      throw new BadRequestException(`该科室下还有 ${doctorCount} 名医生，无法删除`);
    }

    // 检查是否有关联的排班
    const scheduleCount = await this.prisma.schedule.count({
      where: { departmentId: id },
    });

    if (scheduleCount > 0) {
      throw new BadRequestException(`该科室下还有 ${scheduleCount} 条排班记录，无法删除`);
    }

    await this.prisma.department.delete({ where: { id } });
  }

  /**
   * 获取科室统计信息
   */
  async getStatistics(id: number) {
    await this.findOne(id);

    const [doctorCount, scheduleCount, appointmentCount] = await Promise.all([
      this.prisma.doctor.count({ where: { departmentId: id } }),
      this.prisma.schedule.count({ where: { departmentId: id } }),
      this.prisma.appointment.count({ where: { departmentId: id } }),
    ]);

    return {
      doctorCount,
      scheduleCount,
      appointmentCount,
    };
  }
}
