import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto, UpdateAdminDto, QueryAdminDto } from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Admin } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建管理员
   */
  async create(dto: CreateAdminDto): Promise<Omit<Admin, 'password'>> {
    // 检查用户名是否已存在
    const existing = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = admin;
    return result;
  }

  /**
   * 分页查询管理员列表
   */
  async findAll(query: QueryAdminDto): Promise<PaginatedResponseDto<Omit<Admin, 'password'>>> {
    const { page = 1, pageSize = 10, username, status } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(username && { username: { contains: username } }),
      ...(status !== undefined && { status }),
    };

    const [list, total] = await Promise.all([
      this.prisma.admin.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.admin.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 根据ID查询管理员
   */
  async findOne(id: number): Promise<Omit<Admin, 'password'>> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('管理员不存在');
    }

    return admin;
  }

  /**
   * 更新管理员
   */
  async update(id: number, dto: UpdateAdminDto): Promise<Omit<Admin, 'password'>> {
    await this.findOne(id);

    // 如果更新密码，需要加密
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const admin = await this.prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  }

  /**
   * 删除管理员
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.admin.delete({ where: { id } });
  }

  /**
   * 重置密码
   */
  async resetPassword(id: number, newPassword: string): Promise<void> {
    await this.findOne(id);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.admin.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
