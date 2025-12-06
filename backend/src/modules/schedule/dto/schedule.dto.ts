import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建排班 DTO
 */
export class CreateScheduleDto {
  @ApiProperty({ description: '医生ID', example: 1 })
  @IsNotEmpty({ message: '医生ID不能为空' })
  @IsInt()
  doctorId: number;

  @ApiProperty({ description: '科室ID', example: 1 })
  @IsNotEmpty({ message: '科室ID不能为空' })
  @IsInt()
  departmentId: number;

  @ApiProperty({ description: '排班日期', example: '2024-01-15' })
  @IsNotEmpty({ message: '排班日期不能为空' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: '时间段', example: '08:00-12:00' })
  @IsNotEmpty({ message: '时间段不能为空' })
  @IsString()
  timeSlot: string;

  @ApiPropertyOptional({ description: '最大挂号数', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPatients?: number;

  @ApiProperty({ description: '挂号费', example: 50 })
  @IsNotEmpty({ message: '挂号费不能为空' })
  @IsNumber()
  @Min(0)
  fee: number;

  @ApiPropertyOptional({ description: '状态 1:可预约 0:停诊', default: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}

/**
 * 更新排班 DTO
 */
export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}

/**
 * 查询排班列表 DTO
 */
export class QueryScheduleDto extends PaginationDto {
  @ApiPropertyOptional({ description: '医生ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

  @ApiPropertyOptional({ description: '科室ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: '排班日期' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

/**
 * 批量创建排班 DTO
 */
export class BatchCreateScheduleDto {
  @ApiProperty({ description: '医生ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  doctorId: number;

  @ApiProperty({ description: '科室ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  departmentId: number;

  @ApiProperty({ description: '开始日期', example: '2024-01-15' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '结束日期', example: '2024-01-21' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: '时间段列表', example: ['08:00-12:00', '14:00-17:00'] })
  @IsNotEmpty()
  @IsString({ each: true })
  timeSlots: string[];

  @ApiProperty({ description: '挂号费', example: 50 })
  @IsNotEmpty()
  @IsNumber()
  fee: number;

  @ApiPropertyOptional({ description: '每时段最大挂号数', default: 20 })
  @IsOptional()
  @IsInt()
  maxPatients?: number;
}
