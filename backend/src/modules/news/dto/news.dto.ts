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

  @ApiProperty({ description: '新闻内容', example: '为了保障员工健康...' })
  @IsNotEmpty({ message: '内容不能为空' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiPropertyOptional({
    description: '新闻类型：0医院公告 1健康资讯 2医院动态',
    example: 0,
    enum: [0, 1, 2],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2], { message: '类型只能是0(医院公告)、1(健康资讯)或2(医院动态)' })
  type?: number = 0;

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

  @ApiPropertyOptional({ description: '排序值（越小越靠前）', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort?: number = 0;
}

/**
 * 更新新闻 DTO
 */
export class UpdateNewsDto extends PartialType(CreateNewsDto) {}

/**
 * 查询新闻列表 DTO
 */
export class QueryNewsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '新闻类型：0医院公告 1健康资讯 2医院动态' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2])
  type?: number;

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
