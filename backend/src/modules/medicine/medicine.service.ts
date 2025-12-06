import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMedicineCategoryDto,
  UpdateMedicineCategoryDto,
  CreateMedicineDto,
  UpdateMedicineDto,
  QueryMedicineDto,
  UpdateStockDto,
  StockOperationType,
} from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { MedicineCategory, Medicine, Prisma } from '@prisma/client';

@Injectable()
export class MedicineService {
  constructor(private prisma: PrismaService) {}

  // ==================== 药品分类管理 ====================

  /**
   * 创建药品分类
   */
  async createCategory(dto: CreateMedicineCategoryDto): Promise<MedicineCategory> {
    // 检查分类名称是否已存在
    const existing = await this.prisma.medicineCategory.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('分类名称已存在');
    }

    return this.prisma.medicineCategory.create({
      data: dto,
    });
  }

  /**
   * 查询所有药品分类
   */
  async findAllCategories(): Promise<MedicineCategory[]> {
    return this.prisma.medicineCategory.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });
  }

  /**
   * 根据ID查询药品分类
   */
  async findOneCategory(id: number): Promise<MedicineCategory> {
    const category = await this.prisma.medicineCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('药品分类不存在');
    }

    return category;
  }

  /**
   * 更新药品分类
   */
  async updateCategory(id: number, dto: UpdateMedicineCategoryDto): Promise<MedicineCategory> {
    await this.findOneCategory(id);

    // 如果更新名称，检查是否重复
    if (dto.name) {
      const existing = await this.prisma.medicineCategory.findUnique({
        where: { name: dto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('分类名称已存在');
      }
    }

    return this.prisma.medicineCategory.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除药品分类
   */
  async removeCategory(id: number): Promise<void> {
    await this.findOneCategory(id);

    // 检查是否有关联的药品
    const medicineCount = await this.prisma.medicine.count({
      where: { categoryId: id },
    });

    if (medicineCount > 0) {
      throw new BadRequestException(`该分类下还有 ${medicineCount} 种药品，无法删除`);
    }

    await this.prisma.medicineCategory.delete({ where: { id } });
  }

  // ==================== 药品信息管理 ====================

  /**
   * 创建药品
   */
  async create(dto: CreateMedicineDto): Promise<Medicine> {
    // 检查分类是否存在
    await this.findOneCategory(dto.categoryId);

    return this.prisma.medicine.create({
      data: dto,
      include: {
        category: true,
      },
    });
  }

  /**
   * 分页查询药品列表
   */
  async findAll(query: QueryMedicineDto): Promise<PaginatedResponseDto<Medicine>> {
    const { page = 1, pageSize = 10, name, categoryId, status } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MedicineWhereInput = {
      ...(name && { name: { contains: name } }),
      ...(categoryId && { categoryId }),
      ...(status !== undefined && { status }),
    };

    const [list, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 查询所有药品（不分页，用于下拉选择等）
   */
  async findAllSimple(): Promise<Medicine[]> {
    return this.prisma.medicine.findMany({
      where: { status: 1 },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
  }

  /**
   * 根据ID查询药品
   */
  async findOne(id: number): Promise<Medicine> {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!medicine) {
      throw new NotFoundException('药品不存在');
    }

    return medicine;
  }

  /**
   * 根据分类ID查询药品列表
   */
  async findByCategory(categoryId: number): Promise<Medicine[]> {
    // 先检查分类是否存在
    await this.findOneCategory(categoryId);

    return this.prisma.medicine.findMany({
      where: {
        categoryId,
        status: 1,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
  }

  /**
   * 更新药品
   */
  async update(id: number, dto: UpdateMedicineDto): Promise<Medicine> {
    await this.findOne(id);

    // 如果更新分类，检查分类是否存在
    if (dto.categoryId) {
      await this.findOneCategory(dto.categoryId);
    }

    return this.prisma.medicine.update({
      where: { id },
      data: dto,
      include: {
        category: true,
      },
    });
  }

  /**
   * 删除药品
   */
  async remove(id: number): Promise<void> {
    const medicine = await this.findOne(id);

    // 检查是否有关联的处方项
    const prescriptionItemCount = await this.prisma.prescriptionItem.count({
      where: { medicineId: id },
    });

    if (prescriptionItemCount > 0) {
      throw new BadRequestException(
        `该药品已在 ${prescriptionItemCount} 条处方中使用，无法删除`,
      );
    }

    await this.prisma.medicine.delete({ where: { id } });
  }

  // ==================== 库存管理 ====================

  /**
   * 更新库存
   */
  async updateStock(id: number, dto: UpdateStockDto): Promise<Medicine> {
    const medicine = await this.findOne(id);

    let newStock: number;

    if (dto.type === StockOperationType.IN) {
      // 入库
      newStock = medicine.stock + dto.quantity;
    } else {
      // 出库
      if (medicine.stock < dto.quantity) {
        throw new BadRequestException(
          `库存不足，当前库存: ${medicine.stock}${medicine.unit}，需要出库: ${dto.quantity}${medicine.unit}`,
        );
      }
      newStock = medicine.stock - dto.quantity;
    }

    // 更新库存
    const updatedMedicine = await this.prisma.medicine.update({
      where: { id },
      data: { stock: newStock },
      include: {
        category: true,
      },
    });

    // 记录库存变动日志（简化处理，直接打印日志）
    console.log(`[库存变动] 药品: ${medicine.name}, 操作: ${dto.type}, 数量: ${dto.quantity}, 原库存: ${medicine.stock}, 新库存: ${newStock}, 原因: ${dto.reason || '无'}`);

    return updatedMedicine;
  }

  /**
   * 获取低库存药品列表
   */
  async getLowStockMedicines(threshold: number = 10): Promise<Medicine[]> {
    return this.prisma.medicine.findMany({
      where: {
        status: 1,
        stock: {
          lte: threshold,
        },
      },
      orderBy: { stock: 'asc' },
      include: {
        category: true,
      },
    });
  }

  /**
   * 获取药品统计信息
   */
  async getStatistics(): Promise<{
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  }> {
    const [totalCount, activeCount, inactiveCount, lowStockCount, outOfStockCount] =
      await Promise.all([
        this.prisma.medicine.count(),
        this.prisma.medicine.count({ where: { status: 1 } }),
        this.prisma.medicine.count({ where: { status: 0 } }),
        this.prisma.medicine.count({ where: { status: 1, stock: { lte: 10, gt: 0 } } }),
        this.prisma.medicine.count({ where: { status: 1, stock: 0 } }),
      ]);

    return {
      totalCount,
      activeCount,
      inactiveCount,
      lowStockCount,
      outOfStockCount,
    };
  }
}
