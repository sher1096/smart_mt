import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建挂号 DTO (患者端)
 */
export class CreateAppointmentDto {
  @ApiProperty({ description: '排班ID', example: 1 })
  @IsNotEmpty({ message: '排班ID不能为空' })
  @IsInt()
  scheduleId: number;
}

/**
 * 管理员创建挂号 DTO
 */
export class AdminCreateAppointmentDto extends CreateAppointmentDto {
  @ApiProperty({ description: '患者ID', example: 1 })
  @IsNotEmpty({ message: '患者ID不能为空' })
  @IsInt()
  patientId: number;
}

/**
 * 查询挂号列表 DTO
 */
export class QueryAppointmentDto extends PaginationDto {
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

  @ApiPropertyOptional({ description: '科室ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: '挂号日期' })
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

  @ApiPropertyOptional({ description: '状态 0:待就诊 1:已就诊 2:已取消' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '挂号单号' })
  @IsOptional()
  appointmentNo?: string;
}

/**
 * 更新挂号状态 DTO
 */
export class UpdateAppointmentStatusDto {
  @ApiProperty({ description: '状态 0:待就诊 1:已就诊 2:已取消', example: 1 })
  @IsNotEmpty({ message: '状态不能为空' })
  @IsInt()
  @IsIn([0, 1, 2], { message: '状态只能是0、1或2' })
  status: number;
}
