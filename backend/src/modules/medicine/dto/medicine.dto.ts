import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建药品分类 DTO
 */
export class CreateMedicineCategoryDto {
  @ApiProperty({ description: '分类名称', example: '抗生素类' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '排序', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;
}

/**
 * 更新药品分类 DTO
 */
export class UpdateMedicineCategoryDto extends PartialType(CreateMedicineCategoryDto) {}

/**
 * 创建药品 DTO
 */
export class CreateMedicineDto {
  @ApiProperty({ description: '分类ID', example: 1 })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({ description: '药品名称', example: '阿莫西林胶囊' })
  @IsNotEmpty({ message: '药品名称不能为空' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '规格', example: '0.25g*24粒/盒' })
  @IsOptional()
  @IsString()
  specification?: string;

  @ApiPropertyOptional({ description: '生产厂家', example: '哈药集团制药总厂' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: '单位', example: '盒' })
  @IsNotEmpty({ message: '单位不能为空' })
  @IsString()
  unit: string;

  @ApiProperty({ description: '价格', example: 15.50 })
  @IsNotEmpty({ message: '价格不能为空' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: '库存', example: 100, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: '药品说明' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '状态 1-正常 0-停用', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

/**
 * 更新药品 DTO
 */
export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {}

/**
 * 查询药品列表 DTO
 */
export class QueryMedicineDto extends PaginationDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: '药品名称（模糊搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

/**
 * 库存操作类型枚举
 */
export enum StockOperationType {
  IN = 'in',   // 入库
  OUT = 'out', // 出库
}

/**
 * 更新库存 DTO
 */
export class UpdateStockDto {
  @ApiProperty({ description: '操作类型', enum: StockOperationType, example: 'in' })
  @IsNotEmpty({ message: '操作类型不能为空' })
  @IsEnum(StockOperationType, { message: '操作类型只能是 in 或 out' })
  type: StockOperationType;

  @ApiProperty({ description: '数量', example: 50 })
  @IsNotEmpty({ message: '数量不能为空' })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: '数量必须大于0' })
  quantity: number;

  @ApiPropertyOptional({ description: '原因/备注', example: '采购入库' })
  @IsOptional()
  @IsString()
  reason?: string;
}
