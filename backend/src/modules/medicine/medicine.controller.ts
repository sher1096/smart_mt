import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicineService } from './medicine.service';
import {
  CreateMedicineCategoryDto,
  UpdateMedicineCategoryDto,
  CreateMedicineDto,
  UpdateMedicineDto,
  QueryMedicineDto,
  UpdateStockDto,
} from './dto';
import { Roles, UserType } from '../../common/decorators';

@ApiTags('药品管理')
@ApiBearerAuth('JWT-auth')
@Controller('medicines')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  // ==================== 药品分类接口 ====================

  @Post('categories')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建药品分类（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  createCategory(@Body() dto: CreateMedicineCategoryDto) {
    return this.medicineService.createCategory(dto);
  }

  @Get('categories')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '查询所有药品分类（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllCategories() {
    return this.medicineService.findAllCategories();
  }

  @Get('categories/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '根据ID查询药品分类（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '药品分类不存在' })
  findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新药品分类（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '药品分类不存在' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicineCategoryDto,
  ) {
    return this.medicineService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除药品分类（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '药品分类不存在' })
  @ApiResponse({ status: 400, description: '该分类下还有药品，无法删除' })
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.removeCategory(id);
  }

  // ==================== 药品信息接口 ====================

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建药品（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() dto: CreateMedicineDto) {
    return this.medicineService.create(dto);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '分页查询药品列表（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryMedicineDto) {
    return this.medicineService.findAll(query);
  }

  @Get('simple')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '查询所有药品（不分页，管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功，用于开处方时选择药品' })
  findAllSimple() {
    return this.medicineService.findAllSimple();
  }

  @Get('low-stock')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '查询低库存药品（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getLowStockMedicines(@Query('threshold', ParseIntPipe) threshold: number = 10) {
    return this.medicineService.getLowStockMedicines(threshold);
  }

  @Get('statistics')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '获取药品统计信息（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getStatistics() {
    return this.medicineService.getStatistics();
  }

  @Get('by-category/:categoryId')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '根据分类ID查询药品列表（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '药品分类不存在' })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.medicineService.findByCategory(categoryId);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '根据ID查询药品（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '药品不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新药品（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '药品不存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicineDto) {
    return this.medicineService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除药品（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '药品不存在' })
  @ApiResponse({ status: 400, description: '该药品已在处方中使用，无法删除' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.remove(id);
  }

  // ==================== 库存管理接口 ====================

  @Patch(':id/stock')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新药品库存（管理员）' })
  @ApiResponse({ status: 200, description: '库存更新成功' })
  @ApiResponse({ status: 404, description: '药品不存在' })
  @ApiResponse({ status: 400, description: '库存不足' })
  updateStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto) {
    return this.medicineService.updateStock(id, dto);
  }
}
