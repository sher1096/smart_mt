import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建患者 DTO
 */
export class CreatePatientDto {
  @ApiProperty({ description: '用户名', example: 'patient001' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(3, { message: '用户名至少3位' })
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @ApiProperty({ description: '姓名', example: '张三' })
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

  @ApiPropertyOptional({ description: '身份证号' })
  @IsOptional()
  @IsString()
  idCard?: string;

  @ApiPropertyOptional({ description: '年龄', example: 25 })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

/**
 * 更新患者 DTO
 */
export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @ApiPropertyOptional({ description: '状态', example: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

/**
 * 查询患者列表 DTO
 */
export class QueryPatientDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户名（模糊搜索）' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '姓名（模糊搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '就诊卡号' })
  @IsOptional()
  @IsString()
  medicalCardNo?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsInt()
  status?: number;
}

/**
 * 充值 DTO
 */
export class RechargeDto {
  @ApiProperty({ description: '充值金额', example: 100 })
  @IsNotEmpty({ message: '金额不能为空' })
  @IsNumber()
  @Min(1, { message: '充值金额最少1元' })
  amount: number;
}
