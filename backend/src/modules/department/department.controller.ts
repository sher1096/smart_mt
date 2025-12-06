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
import { DepartmentService } from './department.service';
import {
  CreateDepartmentCategoryDto,
  UpdateDepartmentCategoryDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
} from './dto';
import { Roles, UserType } from '../../common/decorators';
import { Public } from '../../common/decorators';

@ApiTags('科室管理')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // ==================== 科室分类接口 ====================

  @Post('categories')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建科室分类（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  createCategory(@Body() dto: CreateDepartmentCategoryDto) {
    return this.departmentService.createCategory(dto);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: '查询所有科室分类（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllCategories() {
    return this.departmentService.findAllCategories();
  }

  @Get('categories/:id')
  @Public()
  @ApiOperation({ summary: '根据ID查询科室分类（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '科室分类不存在' })
  findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新科室分类（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '科室分类不存在' })
  @ApiResponse({ status: 409, description: '分类名称已存在' })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentCategoryDto,
  ) {
    return this.departmentService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除科室分类（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '科室分类不存在' })
  @ApiResponse({ status: 400, description: '该分类下还有科室，无法删除' })
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.removeCategory(id);
  }

  // ==================== 科室信息接口 ====================

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建科室（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '科室编码已存在' })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '分页查询科室列表（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryDepartmentDto) {
    return this.departmentService.findAll(query);
  }

  @Get('simple')
  @Public()
  @ApiOperation({ summary: '查询所有科室（不分页，公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllSimple() {
    return this.departmentService.findAllSimple();
  }

  @Get('by-category/:categoryId')
  @Public()
  @ApiOperation({ summary: '根据分类ID查询科室列表（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '科室分类不存在' })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.departmentService.findByCategory(categoryId);
  }

  @Get('code/:code')
  @Public()
  @ApiOperation({ summary: '根据科室编码查询（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '科室不存在' })
  findByCode(@Param('code') code: string) {
    return this.departmentService.findByCode(code);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '根据ID查询科室（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '科室不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Get(':id/statistics')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '获取科室统计信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '科室不存在' })
  getStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.getStatistics(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新科室（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '科室不存在' })
  @ApiResponse({ status: 409, description: '科室编码已存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除科室（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '科室不存在' })
  @ApiResponse({ status: 400, description: '该科室下还有医生或排班，无法删除' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }
}
