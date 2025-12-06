import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsIn,
  IsString,
  IsNumber,
  IsArray,
  ArrayMinSize,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建体检项目 DTO
 */
export class CreateExamItemDto {
  @ApiProperty({ description: '项目名称', example: '血常规' })
  @IsNotEmpty({ message: '项目名称不能为空' })
  @IsString()
  @MaxLength(100, { message: '项目名称最长100个字符' })
  name: string;

  @ApiProperty({ description: '价格', example: 50.0 })
  @IsNotEmpty({ message: '价格不能为空' })
  @IsNumber({}, { message: '价格必须为数字' })
  @Min(0, { message: '价格不能为负数' })
  price: number;

  @ApiPropertyOptional({ description: '项目描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '正常值范围', example: '3.5-9.5' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  normalRange?: string;

  @ApiPropertyOptional({ description: '单位', example: '10^9/L' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({ description: '状态 0:停用 1:启用', example: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}

/**
 * 更新体检项目 DTO
 */
export class UpdateExamItemDto extends PartialType(CreateExamItemDto) {}

/**
 * 查询体检项目 DTO
 */
export class QueryExamItemDto extends PaginationDto {
  @ApiPropertyOptional({ description: '项目名称（模糊查询）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '状态 0:停用 1:启用' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}

/**
 * 创建体检单 DTO
 */
export class CreateExaminationDto {
  @ApiProperty({ description: '患者ID', example: 1 })
  @IsNotEmpty({ message: '患者ID不能为空' })
  @IsInt()
  patientId: number;

  @ApiProperty({ description: '体检项目ID列表', example: [1, 2, 3], type: [Number] })
  @IsNotEmpty({ message: '体检项目不能为空' })
  @IsArray()
  @ArrayMinSize(1, { message: '至少选择一个体检项目' })
  @IsInt({ each: true })
  examItemIds: number[];

  @ApiPropertyOptional({ description: '医生ID' })
  @IsOptional()
  @IsInt()
  doctorId?: number;
}

/**
 * 更新体检单状态 DTO
 */
export class UpdateExaminationStatusDto {
  @ApiProperty({
    description: '状态 0:待缴费 1:已缴费待检 2:检查中 3:已完成 4:已取消',
    example: 1
  })
  @IsNotEmpty({ message: '状态不能为空' })
  @IsInt()
  @IsIn([0, 1, 2, 3, 4], { message: '状态只能是0、1、2、3或4' })
  status: number;
}

/**
 * 更新体检项目结果 DTO
 */
export class UpdateExaminationItemDto {
  @ApiPropertyOptional({ description: '检查结果' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiPropertyOptional({ description: '检查结论' })
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiPropertyOptional({ description: '状态 0:未检 1:已检', example: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}

/**
 * 查询体检单 DTO
 */
export class QueryExaminationDto extends PaginationDto {
  @ApiPropertyOptional({ description: '患者ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @ApiPropertyOptional({ description: '医生ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

  @ApiPropertyOptional({ description: '状态 0:待缴费 1:已缴费待检 2:检查中 3:已完成 4:已取消' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2, 3, 4])
  status?: number;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '体检单号' })
  @IsOptional()
  @IsString()
  examNo?: string;
}
