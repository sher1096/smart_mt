import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建消息 DTO
 */
export class CreateMessageDto {
  @ApiProperty({ description: '患者ID', example: 1 })
  @IsNotEmpty({ message: '患者ID不能为空' })
  @IsInt()
  patientId: number;

  @ApiProperty({ description: '消息标题', example: '挂号成功通知' })
  @IsNotEmpty({ message: '消息标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '消息内容', example: '您已成功挂号，请按时就诊。' })
  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: '消息类型：0系统通知 1挂号提醒 2缴费提醒 3体检提醒',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2, 3], { message: '消息类型只能是0、1、2或3' })
  type?: number = 0;
}

/**
 * 批量创建消息 DTO
 */
export class BatchCreateMessageDto {
  @ApiPropertyOptional({
    description: '患者ID数组（与all字段二选一）',
    example: [1, 2, 3],
  })
  @IsOptional()
  @ValidateIf((o) => !o.all)
  @IsArray()
  @ArrayNotEmpty({ message: '患者ID数组不能为空' })
  @IsInt({ each: true, message: '患者ID必须为整数' })
  patientIds?: number[];

  @ApiPropertyOptional({
    description: '是否发送给所有患者（与patientIds字段二选一）',
    example: false,
  })
  @IsOptional()
  @ValidateIf((o) => !o.patientIds || o.patientIds.length === 0)
  @IsBoolean()
  all?: boolean;

  @ApiProperty({ description: '消息标题', example: '系统维护通知' })
  @IsNotEmpty({ message: '消息标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({
    description: '消息内容',
    example: '系统将于今晚22:00进行维护，预计1小时。',
  })
  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: '消息类型：0系统通知 1挂号提醒 2缴费提醒 3体检提醒',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2, 3], { message: '消息类型只能是0、1、2或3' })
  type?: number = 0;
}

/**
 * 查询消息列表 DTO
 */
export class QueryMessageDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '消息类型：0系统通知 1挂号提醒 2缴费提醒 3体检提醒',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2, 3], { message: '消息类型只能是0、1、2或3' })
  type?: number;

  @ApiPropertyOptional({
    description: '是否已读：0未读 1已读',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1], { message: '是否已读只能是0或1' })
  isRead?: number;
}

/**
 * 标记消息为已读 DTO
 */
export class MarkReadDto {
  @ApiProperty({
    description: '消息ID数组',
    example: [1, 2, 3],
  })
  @IsNotEmpty({ message: '消息ID数组不能为空' })
  @IsArray()
  @ArrayNotEmpty({ message: '消息ID数组不能为空' })
  @IsInt({ each: true, message: '消息ID必须为整数' })
  messageIds: number[];
}
