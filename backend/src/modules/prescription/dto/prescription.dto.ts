import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建处方项DTO
 */
export class CreatePrescriptionItemDto {
  @ApiProperty({ description: '药品ID' })
  @IsInt()
  @IsNotEmpty()
  medicineId: number;

  @ApiProperty({ description: '数量' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ description: '用量' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: '用药频次' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ description: '用药天数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;
}

/**
 * 创建处方DTO
 */
export class CreatePrescriptionDto {
  @ApiProperty({ description: '病历ID' })
  @IsInt()
  @IsNotEmpty()
  medicalRecordId: number;

  @ApiProperty({ description: '处方项列表', type: [CreatePrescriptionItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: '处方至少包含一个药品' })
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items: CreatePrescriptionItemDto[];
}

/**
 * 查询处方DTO
 */
export class QueryPrescriptionDto extends PaginationDto {
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

  @ApiPropertyOptional({ description: '处方状态：0待缴费 1已缴费 2已取药 3已取消' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '处方编号' })
  @IsOptional()
  @IsString()
  prescriptionNo?: string;

  @ApiPropertyOptional({ description: '开始日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * 更新处方状态DTO
 */
export class UpdatePrescriptionStatusDto {
  @ApiProperty({ description: '处方状态：0待缴费 1已缴费 2已取药 3已取消' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  status: number;
}
