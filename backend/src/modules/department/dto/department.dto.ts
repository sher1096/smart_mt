import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建科室分类 DTO
 */
export class CreateDepartmentCategoryDto {
  @ApiProperty({ description: '分类名称', example: '内科' })
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
 * 更新科室分类 DTO
 */
export class UpdateDepartmentCategoryDto extends PartialType(CreateDepartmentCategoryDto) {}

/**
 * 创建科室 DTO
 */
export class CreateDepartmentDto {
  @ApiProperty({ description: '科室编码', example: 'DEPT001' })
  @IsNotEmpty({ message: '科室编码不能为空' })
  @IsString()
  code: string;

  @ApiProperty({ description: '科室名称', example: '心血管内科' })
  @IsNotEmpty({ message: '科室名称不能为空' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '科室位置', example: '门诊楼3楼' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '联系电话', example: '0755-12345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '科室图片URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: '科室简介' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '分类ID', example: 1 })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;
}

/**
 * 更新科室 DTO
 */
export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiPropertyOptional({ description: '状态', example: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

/**
 * 查询科室列表 DTO
 */
export class QueryDepartmentDto extends PaginationDto {
  @ApiPropertyOptional({ description: '科室编码（模糊搜索）' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '科室名称（模糊搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
