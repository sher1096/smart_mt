import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建医生 DTO
 */
export class CreateDoctorDto {
  @ApiProperty({ description: '工号', example: 'DOC001' })
  @IsNotEmpty({ message: '工号不能为空' })
  @IsString()
  @MinLength(3, { message: '工号至少3位' })
  employeeNo: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @ApiProperty({ description: '姓名', example: '李医生' })
  @IsNotEmpty({ message: '姓名不能为空' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '性别', example: 'male' })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'], { message: '性别只能是male或female' })
  gender?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '职称', example: '主任医师' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '专长', example: '心血管疾病诊治' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsOptional()
  @IsString()
  introduction?: string;

  @ApiProperty({ description: '科室ID', example: 1 })
  @IsNotEmpty({ message: '科室ID不能为空' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId: number;
}

/**
 * 更新医生 DTO
 */
export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @ApiPropertyOptional({ description: '状态', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

/**
 * 查询医生列表 DTO
 */
export class QueryDoctorDto extends PaginationDto {
  @ApiPropertyOptional({ description: '工号（模糊搜索）' })
  @IsOptional()
  @IsString()
  employeeNo?: string;

  @ApiPropertyOptional({ description: '姓名（模糊搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '职称' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '科室ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
