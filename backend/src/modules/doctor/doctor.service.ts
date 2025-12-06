import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto, QueryDoctorDto } from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Doctor, Prisma } from '@prisma/client';

type DoctorWithoutPassword = Omit<Doctor, 'password'>;

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建医生
   */
  async create(dto: CreateDoctorDto): Promise<DoctorWithoutPassword> {
    // 检查工号是否已存在
    const existing = await this.prisma.doctor.findUnique({
      where: { employeeNo: dto.employeeNo },
    });

    if (existing) {
      throw new ConflictException('工号已存在');
    }

    // 检查科室是否存在
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('科室不存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const doctor = await this.prisma.doctor.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      include: {
        department: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = doctor;
    return result;
  }

  /**
   * 分页查询医生列表
   */
  async findAll(query: QueryDoctorDto): Promise<PaginatedResponseDto<DoctorWithoutPassword>> {
    const { page = 1, pageSize = 10, employeeNo, name, phone, title, departmentId, status } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.DoctorWhereInput = {
      ...(employeeNo && { employeeNo: { contains: employeeNo } }),
      ...(name && { name: { contains: name } }),
      ...(phone && { phone: { contains: phone } }),
      ...(title && { title: { contains: title } }),
      ...(departmentId && { departmentId }),
      ...(status !== undefined && { status }),
    };

    const [list, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          employeeNo: true,
          name: true,
          gender: true,
          phone: true,
          avatar: true,
          title: true,
          specialty: true,
          introduction: true,
          status: true,
          departmentId: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 根据ID查询医生
   */
  async findOne(id: number): Promise<DoctorWithoutPassword> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        employeeNo: true,
        name: true,
        gender: true,
        phone: true,
        avatar: true,
        title: true,
        specialty: true,
        introduction: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
            location: true,
            phone: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('医生不存在');
    }

    return doctor;
  }

  /**
   * 更新医生
   */
  async update(id: number, dto: UpdateDoctorDto): Promise<DoctorWithoutPassword> {
    await this.findOne(id);

    // 如果更新科室，需要检查科室是否存在
    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });

      if (!department) {
        throw new NotFoundException('科室不存在');
      }
    }

    // 如果更新密码，需要加密
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const doctor = await this.prisma.doctor.update({
      where: { id },
      data,
      select: {
        id: true,
        employeeNo: true,
        name: true,
        gender: true,
        phone: true,
        avatar: true,
        title: true,
        specialty: true,
        introduction: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return doctor;
  }

  /**
   * 删除医生
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.doctor.delete({ where: { id } });
  }

  /**
   * 根据科室ID查询医生列表
   */
  async findByDepartment(departmentId: number): Promise<DoctorWithoutPassword[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        departmentId,
        status: 1,
      },
      select: {
        id: true,
        employeeNo: true,
        name: true,
        gender: true,
        phone: true,
        avatar: true,
        title: true,
        specialty: true,
        introduction: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return doctors;
  }
}
