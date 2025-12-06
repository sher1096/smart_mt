import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsIn,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建缴费单 DTO
 */
export class CreatePaymentDto {
  @ApiProperty({ description: '缴费类型 1:挂号费 2:处方费 3:体检费', example: 1 })
  @IsNotEmpty({ message: '缴费类型不能为空' })
  @IsInt()
  @IsIn([1, 2, 3], { message: '缴费类型只能是1、2或3' })
  type: number;

  @ApiProperty({ description: '关联ID（挂号ID/处方ID/体检ID）', example: 1 })
  @IsNotEmpty({ message: '关联ID不能为空' })
  @IsInt()
  refId: number;

  @ApiProperty({ description: '缴费金额', example: 100.00 })
  @IsNotEmpty({ message: '缴费金额不能为空' })
  @IsNumber()
  @Min(0.01, { message: '缴费金额必须大于0' })
  amount: number;
}

/**
 * 支付缴费单 DTO
 */
export class PayDto {
  @ApiProperty({ description: '缴费单ID', example: 1 })
  @IsNotEmpty({ message: '缴费单ID不能为空' })
  @IsInt()
  paymentId: number;

  @ApiProperty({ description: '支付方式 1:余额 2:现金 3:微信 4:支付宝', example: 1 })
  @IsNotEmpty({ message: '支付方式不能为空' })
  @IsInt()
  @IsIn([1, 2, 3, 4], { message: '支付方式只能是1、2、3或4' })
  payMethod: number;
}

/**
 * 查询缴费记录 DTO
 */
export class QueryPaymentDto extends PaginationDto {
  @ApiPropertyOptional({ description: '患者ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @ApiPropertyOptional({ description: '缴费类型 1:挂号费 2:处方费 3:体检费' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3])
  type?: number;

  @ApiPropertyOptional({ description: '状态 0:待支付 1:已支付 2:已取消' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * 创建充值单 DTO
 */
export class CreateRechargeDto {
  @ApiProperty({ description: '充值金额', example: 500.00 })
  @IsNotEmpty({ message: '充值金额不能为空' })
  @IsNumber()
  @Min(0.01, { message: '充值金额必须大于0' })
  amount: number;
}

/**
 * 确认充值 DTO
 */
export class ConfirmRechargeDto {
  @ApiProperty({ description: '充值单ID', example: 1 })
  @IsNotEmpty({ message: '充值单ID不能为空' })
  @IsInt()
  rechargeId: number;

  @ApiProperty({ description: '支付方式 2:现金 3:微信 4:支付宝', example: 2 })
  @IsNotEmpty({ message: '支付方式不能为空' })
  @IsInt()
  @IsIn([2, 3, 4], { message: '充值支付方式只能是2、3或4' })
  payMethod: number;
}

/**
 * 查询充值记录 DTO
 */
export class QueryRechargeDto extends PaginationDto {
  @ApiPropertyOptional({ description: '患者ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @ApiPropertyOptional({ description: '状态 0:待确认 1:已确认 2:已取消' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
