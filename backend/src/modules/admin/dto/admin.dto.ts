import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength, IsInt, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto';

/**
 * 创建管理员 DTO
 */
export class CreateAdminDto {
  @ApiProperty({ description: '用户名', example: 'admin001' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(3, { message: '用户名至少3位' })
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @ApiPropertyOptional({ description: '昵称', example: '管理员' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '角色', default: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;
}

/**
 * 更新管理员 DTO
 */
export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiPropertyOptional({ description: '状态', example: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

/**
 * 查询管理员列表 DTO
 */
export class QueryAdminDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户名（模糊搜索）' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsInt()
  status?: number;
}
