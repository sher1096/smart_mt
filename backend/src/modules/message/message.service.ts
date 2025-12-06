import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMessageDto,
  BatchCreateMessageDto,
  QueryMessageDto,
  MarkReadDto,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建消息（发送给单个患者）
   */
  async create(dto: CreateMessageDto): Promise<Message> {
    // 验证患者是否存在
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('患者不存在');
    }

    return this.prisma.message.create({
      data: {
        patientId: dto.patientId,
        title: dto.title,
        content: dto.content,
        type: dto.type || 0,
      },
    });
  }

  /**
   * 批量创建消息（发送给多个患者或所有患者）
   */
  async batchCreate(dto: BatchCreateMessageDto): Promise<{ count: number; messages: Message[] }> {
    let patientIds: number[];

    if (dto.all) {
      // 获取所有患者ID
      const patients = await this.prisma.patient.findMany({
        where: { status: 1 }, // 只发送给状态正常的患者
        select: { id: true },
      });
      patientIds = patients.map((p) => p.id);
    } else if (dto.patientIds && dto.patientIds.length > 0) {
      // 验证指定的患者是否存在
      const patients = await this.prisma.patient.findMany({
        where: { id: { in: dto.patientIds } },
        select: { id: true },
      });

      if (patients.length !== dto.patientIds.length) {
        throw new NotFoundException('部分患者不存在');
      }

      patientIds = dto.patientIds;
    } else {
      throw new NotFoundException('必须指定患者ID或选择发送给所有患者');
    }

    // 批量创建消息
    const messages = await this.prisma.$transaction(
      patientIds.map((patientId) =>
        this.prisma.message.create({
          data: {
            patientId,
            title: dto.title,
            content: dto.content,
            type: dto.type || 0,
          },
        }),
      ),
    );

    return {
      count: messages.length,
      messages,
    };
  }

  /**
   * 患者查询自己的消息列表（分页）
   */
  async findMyMessages(
    patientId: number,
    query: QueryMessageDto,
  ): Promise<PaginatedResponseDto<Message>> {
    const { page = 1, pageSize = 10, type, isRead } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MessageWhereInput = {
      patientId,
      ...(type !== undefined && { type }),
      ...(isRead !== undefined && { isRead }),
    };

    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(patientId: number): Promise<{ unreadCount: number }> {
    const count = await this.prisma.message.count({
      where: {
        patientId,
        isRead: 0,
      },
    });

    return { unreadCount: count };
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(patientId: number, dto: MarkReadDto): Promise<{ count: number }> {
    // 验证消息是否属于该患者
    const messages = await this.prisma.message.findMany({
      where: {
        id: { in: dto.messageIds },
      },
      select: { id: true, patientId: true },
    });

    // 检查是否有消息不属于该患者
    const invalidMessages = messages.filter((msg) => msg.patientId !== patientId);
    if (invalidMessages.length > 0) {
      throw new ForbiddenException('无权操作其他患者的消息');
    }

    // 批量更新为已读
    const result = await this.prisma.message.updateMany({
      where: {
        id: { in: dto.messageIds },
        patientId,
      },
      data: {
        isRead: 1,
      },
    });

    return { count: result.count };
  }

  /**
   * 标记所有消息为已读
   */
  async markAllAsRead(patientId: number): Promise<{ count: number }> {
    const result = await this.prisma.message.updateMany({
      where: {
        patientId,
        isRead: 0,
      },
      data: {
        isRead: 1,
      },
    });

    return { count: result.count };
  }

  /**
   * 删除消息
   */
  async remove(patientId: number, id: number): Promise<void> {
    // 查找消息
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    // 验证消息是否属于该患者
    if (message.patientId !== patientId) {
      throw new ForbiddenException('无权删除其他患者的消息');
    }

    await this.prisma.message.delete({ where: { id } });
  }

  /**
   * 批量删除消息
   */
  async batchRemove(patientId: number, messageIds: number[]): Promise<{ count: number }> {
    // 验证消息是否属于该患者
    const messages = await this.prisma.message.findMany({
      where: {
        id: { in: messageIds },
      },
      select: { id: true, patientId: true },
    });

    // 检查是否有消息不属于该患者
    const invalidMessages = messages.filter((msg) => msg.patientId !== patientId);
    if (invalidMessages.length > 0) {
      throw new ForbiddenException('无权删除其他患者的消息');
    }

    // 批量删除
    const result = await this.prisma.message.deleteMany({
      where: {
        id: { in: messageIds },
        patientId,
      },
    });

    return { count: result.count };
  }

  /**
   * 管理员查看所有消息（分页）
   */
  async findAll(query: QueryMessageDto): Promise<PaginatedResponseDto<Message>> {
    const { page = 1, pageSize = 10, type, isRead } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MessageWhereInput = {
      ...(type !== undefined && { type }),
      ...(isRead !== undefined && { isRead }),
    };

    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              username: true,
              name: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 根据ID查询消息详情
   */
  async findOne(id: number): Promise<Message> {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    return message;
  }
}
