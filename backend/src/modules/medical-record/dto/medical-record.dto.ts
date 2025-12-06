import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建病历 DTO
 */
export class CreateMedicalRecordDto {
  @ApiProperty({ description: '挂号ID', example: 1 })
  @IsNotEmpty({ message: '挂号ID不能为空' })
  @IsInt()
  appointmentId: number;

  @ApiPropertyOptional({ description: '主诉' })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({ description: '现病史' })
  @IsOptional()
  @IsString()
  presentIllness?: string;

  @ApiPropertyOptional({ description: '既往史' })
  @IsOptional()
  @IsString()
  pastHistory?: string;

  @ApiPropertyOptional({ description: '体格检查' })
  @IsOptional()
  @IsString()
  physicalExam?: string;

  @ApiPropertyOptional({ description: '诊断' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: '治疗方案' })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;
}

/**
 * 更新病历 DTO
 */
export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({ description: '主诉' })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({ description: '现病史' })
  @IsOptional()
  @IsString()
  presentIllness?: string;

  @ApiPropertyOptional({ description: '既往史' })
  @IsOptional()
  @IsString()
  pastHistory?: string;

  @ApiPropertyOptional({ description: '体格检查' })
  @IsOptional()
  @IsString()
  physicalExam?: string;

  @ApiPropertyOptional({ description: '诊断' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: '治疗方案' })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;
}

/**
 * 查询病历列表 DTO
 */
export class QueryMedicalRecordDto extends PaginationDto {
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

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
