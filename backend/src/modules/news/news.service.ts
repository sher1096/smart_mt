import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto, QueryNewsDto } from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { News, Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建新闻（管理员）
   */
  async create(dto: CreateNewsDto): Promise<News> {
    const news = await this.prisma.news.create({
      data: dto,
    });

    return news;
  }

  /**
   * 分页查询新闻列表（管理员 - 可查看所有状态）
   */
  async findAllAdmin(query: QueryNewsDto): Promise<PaginatedResponseDto<News>> {
    const { page = 1, pageSize = 10, type, status, title } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.NewsWhereInput = {
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(title && { title: { contains: title } }),
    };

    const [list, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { isTop: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.news.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 分页查询新闻列表（公开 - 仅返回已发布）
   */
  async findAllPublic(query: QueryNewsDto): Promise<PaginatedResponseDto<News>> {
    const { page = 1, pageSize = 10, type } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.NewsWhereInput = {
      status: 1, // 仅查询已发布的新闻
      ...(type !== undefined && { type }),
    };

    const [list, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { isTop: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.news.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 获取最新新闻（首页展示）
   * @param limit 数量限制，默认5条
   * @param type 新闻类型，可选
   */
  async findLatest(limit: number = 5, type?: number): Promise<News[]> {
    const where: Prisma.NewsWhereInput = {
      status: 1, // 仅查询已发布的新闻
      ...(type !== undefined && { type }),
    };

    const newsList = await this.prisma.news.findMany({
      where,
      take: limit,
      orderBy: [
        { isTop: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return newsList;
  }

  /**
   * 根据ID查询新闻详情（管理员）
   */
  async findOne(id: number): Promise<News> {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('新闻不存在');
    }

    return news;
  }

  /**
   * 根据ID查询新闻详情（公开 - 仅已发布，并增加浏览量）
   */
  async findOnePublic(id: number): Promise<News> {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      throw new NotFoundException('新闻不存在');
    }

    if (news.status !== 1) {
      throw new NotFoundException('新闻不存在或未发布');
    }

    // 增加浏览量
    const updatedNews = await this.prisma.news.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return updatedNews;
  }

  /**
   * 更新新闻（管理员）
   */
  async update(id: number, dto: UpdateNewsDto): Promise<News> {
    await this.findOne(id);

    const news = await this.prisma.news.update({
      where: { id },
      data: dto,
    });

    return news;
  }

  /**
   * 删除新闻（管理员）
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.news.delete({ where: { id } });
  }
}
