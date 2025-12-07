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
 * 创建新闻 DTO
 */
export class CreateNewsDto {
  @ApiProperty({ description: '新闻标题', example: '医院年度体检通知' })
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '新闻摘要' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: '新闻内容', example: '为了保障员工健康...' })
  @IsNotEmpty({ message: '内容不能为空' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: '是否置顶', example: false })
  @IsOptional()
  isTop?: boolean;

  @ApiPropertyOptional({
    description: '状态：0草稿 1发布',
    example: 1,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0(草稿)或1(发布)' })
  status?: number = 1;
}

/**
 * 更新新闻 DTO
 */
export class UpdateNewsDto extends PartialType(CreateNewsDto) {}

/**
 * 查询新闻列表 DTO
 */
export class QueryNewsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态：0草稿 1发布' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiPropertyOptional({ description: '标题（模糊搜索）' })
  @IsOptional()
  @IsString()
  title?: string;
}
