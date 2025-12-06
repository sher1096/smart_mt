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

// ==================== 导航管理 DTO ====================

/**
 * 创建导航 DTO
 */
export class CreateNavigationDto {
  @ApiProperty({ description: '导航名称', example: '首页' })
  @IsNotEmpty({ message: '导航名称不能为空' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '图标', example: 'icon-home' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: '路径', example: '/home' })
  @IsNotEmpty({ message: '路径不能为空' })
  @IsString()
  path: string;

  @ApiPropertyOptional({ description: '排序', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional({ description: '状态', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

/**
 * 更新导航 DTO
 */
export class UpdateNavigationDto extends PartialType(CreateNavigationDto) {}

// ==================== 系统配置 DTO ====================

/**
 * 创建系统配置 DTO
 */
export class CreateSystemConfigDto {
  @ApiProperty({ description: '配置键', example: 'hospital_name' })
  @IsNotEmpty({ message: '配置键不能为空' })
  @IsString()
  key: string;

  @ApiProperty({ description: '配置值', example: '智慧医疗系统' })
  @IsNotEmpty({ message: '配置值不能为空' })
  @IsString()
  value: string;

  @ApiProperty({ description: '配置名称', example: '医院名称' })
  @IsNotEmpty({ message: '配置名称不能为空' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '配置类型', example: 'text', default: 'text' })
  @IsOptional()
  @IsString()
  type?: string;
}

/**
 * 更新系统配置 DTO
 */
export class UpdateSystemConfigDto {
  @ApiProperty({ description: '配置值', example: '智慧医疗系统' })
  @IsNotEmpty({ message: '配置值不能为空' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: '配置名称', example: '医院名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '配置类型', example: 'text' })
  @IsOptional()
  @IsString()
  type?: string;
}

// ==================== 页面内容 DTO ====================

/**
 * 创建页面内容 DTO
 */
export class CreatePageContentDto {
  @ApiProperty({ description: '页面代码', example: 'about_us' })
  @IsNotEmpty({ message: '页面代码不能为空' })
  @IsString()
  code: string;

  @ApiProperty({ description: '页面标题', example: '关于我们' })
  @IsNotEmpty({ message: '页面标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '页面内容', example: '这是关于我们的内容...' })
  @IsNotEmpty({ message: '页面内容不能为空' })
  @IsString()
  content: string;
}

/**
 * 更新页面内容 DTO
 */
export class UpdatePageContentDto {
  @ApiPropertyOptional({ description: '页面标题', example: '关于我们' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '页面内容', example: '这是关于我们的内容...' })
  @IsOptional()
  @IsString()
  content?: string;
}

// ==================== 诊前须知 DTO ====================

/**
 * 创建诊前须知 DTO
 */
export class CreateDiagnosisGuideDto {
  @ApiProperty({ description: '标题', example: '预约前准备' })
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '内容', example: '请携带身份证、医保卡等相关证件...' })
  @IsNotEmpty({ message: '内容不能为空' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '排序', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional({ description: '状态', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

/**
 * 更新诊前须知 DTO
 */
export class UpdateDiagnosisGuideDto extends PartialType(CreateDiagnosisGuideDto) {}
