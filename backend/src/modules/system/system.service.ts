import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateNavigationDto,
  UpdateNavigationDto,
  CreateSystemConfigDto,
  UpdateSystemConfigDto,
  CreatePageContentDto,
  UpdatePageContentDto,
  CreateDiagnosisGuideDto,
  UpdateDiagnosisGuideDto,
} from './dto';
import { Navigation, SystemConfig, PageContent, DiagnosisGuide } from '@prisma/client';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  // ==================== 导航管理 ====================

  /**
   * 创建导航
   */
  async createNavigation(dto: CreateNavigationDto): Promise<Navigation> {
    return this.prisma.navigation.create({
      data: {
        startPoint: dto.name || '',
        endPoint: dto.path || '',
        transport: dto.icon || 'walk',
        description: dto.name,
      },
    });
  }

  /**
   * 获取所有导航（管理员）
   */
  async findAllNavigations(): Promise<Navigation[]> {
    return this.prisma.navigation.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 获取前端导航列表（公开，仅返回启用的）
   */
  async findPublicNavigations(): Promise<Navigation[]> {
    return this.prisma.navigation.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 根据ID查询导航
   */
  async findOneNavigation(id: number): Promise<Navigation> {
    const navigation = await this.prisma.navigation.findUnique({
      where: { id },
    });

    if (!navigation) {
      throw new NotFoundException('导航不存在');
    }

    return navigation;
  }

  /**
   * 更新导航
   */
  async updateNavigation(id: number, dto: UpdateNavigationDto): Promise<Navigation> {
    await this.findOneNavigation(id);

    return this.prisma.navigation.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除导航
   */
  async removeNavigation(id: number): Promise<void> {
    await this.findOneNavigation(id);
    await this.prisma.navigation.delete({ where: { id } });
  }

  // ==================== 系统配置管理 ====================

  /**
   * 创建系统配置
   */
  async createSystemConfig(dto: CreateSystemConfigDto): Promise<SystemConfig> {
    // 检查配置键是否已存在
    const existing = await this.prisma.systemConfig.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new ConflictException('配置键已存在');
    }

    return this.prisma.systemConfig.create({
      data: dto,
    });
  }

  /**
   * 获取所有系统配置（管理员）
   */
  async findAllSystemConfigs(): Promise<SystemConfig[]> {
    return this.prisma.systemConfig.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 获取系统配置（公开，返回键值对格式）
   */
  async findPublicSystemConfigs(): Promise<Record<string, string>> {
    const configs = await this.prisma.systemConfig.findMany();

    const result: Record<string, string> = {};
    configs.forEach(config => {
      result[config.key] = config.value;
    });

    return result;
  }

  /**
   * 根据key获取单个配置（公开）
   */
  async findSystemConfigByKey(key: string): Promise<SystemConfig> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    return config;
  }

  /**
   * 根据ID查询系统配置
   */
  async findOneSystemConfig(id: number): Promise<SystemConfig> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    return config;
  }

  /**
   * 更新系统配置
   */
  async updateSystemConfig(id: number, dto: UpdateSystemConfigDto): Promise<SystemConfig> {
    await this.findOneSystemConfig(id);

    return this.prisma.systemConfig.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除系统配置
   */
  async removeSystemConfig(id: number): Promise<void> {
    await this.findOneSystemConfig(id);
    await this.prisma.systemConfig.delete({ where: { id } });
  }

  // ==================== 页面内容管理 ====================

  /**
   * 创建页面内容
   */
  async createPageContent(dto: CreatePageContentDto): Promise<PageContent> {
    // 检查页面类型是否已存在
    const existing = await this.prisma.pageContent.findUnique({
      where: { type: dto.code },
    });

    if (existing) {
      throw new ConflictException('页面类型已存在');
    }

    return this.prisma.pageContent.create({
      data: {
        type: dto.code,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  /**
   * 获取所有页面内容（管理员）
   */
  async findAllPageContents(): Promise<PageContent[]> {
    return this.prisma.pageContent.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 根据code获取页面内容（公开）
   */
  async findPageContentByCode(code: string): Promise<PageContent> {
    const content = await this.prisma.pageContent.findUnique({
      where: { type: code },
    });

    if (!content) {
      throw new NotFoundException('页面内容不存在');
    }

    return content;
  }

  /**
   * 根据ID查询页面内容
   */
  async findOnePageContent(id: number): Promise<PageContent> {
    const content = await this.prisma.pageContent.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException('页面内容不存在');
    }

    return content;
  }

  /**
   * 更新页面内容
   */
  async updatePageContent(id: number, dto: UpdatePageContentDto): Promise<PageContent> {
    await this.findOnePageContent(id);

    return this.prisma.pageContent.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除页面内容
   */
  async removePageContent(id: number): Promise<void> {
    await this.findOnePageContent(id);
    await this.prisma.pageContent.delete({ where: { id } });
  }

  // ==================== 诊前须知管理 ====================

  /**
   * 创建诊前须知
   */
  async createDiagnosisGuide(dto: CreateDiagnosisGuideDto): Promise<DiagnosisGuide> {
    // 生成导诊编号
    const guideNo = this.generateGuideNo();

    return this.prisma.diagnosisGuide.create({
      data: {
        guideNo,
        symptoms: `${dto.title}\n\n${dto.content}`,
      },
    });
  }

  /**
   * 生成导诊编号
   */
  private generateGuideNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `DZ${dateStr}${random}`;
  }

  /**
   * 获取所有诊前须知（管理员）
   */
  async findAllDiagnosisGuides(): Promise<DiagnosisGuide[]> {
    return this.prisma.diagnosisGuide.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 获取诊前须知列表（公开，仅返回启用的）
   */
  async findPublicDiagnosisGuides(): Promise<DiagnosisGuide[]> {
    return this.prisma.diagnosisGuide.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 根据ID查询诊前须知
   */
  async findOneDiagnosisGuide(id: number): Promise<DiagnosisGuide> {
    const guide = await this.prisma.diagnosisGuide.findUnique({
      where: { id },
    });

    if (!guide) {
      throw new NotFoundException('诊前须知不存在');
    }

    return guide;
  }

  /**
   * 更新诊前须知
   */
  async updateDiagnosisGuide(id: number, dto: UpdateDiagnosisGuideDto): Promise<DiagnosisGuide> {
    await this.findOneDiagnosisGuide(id);

    return this.prisma.diagnosisGuide.update({
      where: { id },
      data: {
        ...(dto.title && dto.content && { symptoms: `${dto.title}\n\n${dto.content}` }),
        ...(dto.title && !dto.content && { symptoms: dto.title }),
      },
    });
  }

  /**
   * 删除诊前须知
   */
  async removeDiagnosisGuide(id: number): Promise<void> {
    await this.findOneDiagnosisGuide(id);
    await this.prisma.diagnosisGuide.delete({ where: { id } });
  }
}
