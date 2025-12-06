import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserType } from '../../../common/decorators';

/**
 * 登录DTO
 */
export class LoginDto {
  @ApiProperty({ description: '用户名/工号', example: 'admin' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @ApiProperty({
    description: '用户类型',
    enum: UserType,
    example: UserType.ADMIN,
  })
  @IsNotEmpty({ message: '用户类型不能为空' })
  @IsEnum(UserType, { message: '无效的用户类型' })
  type: UserType;
}

/**
 * 患者注册DTO
 */
export class RegisterDto {
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

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '性别', example: 'male', required: false })
  @IsOptional()
  @IsString()
  gender?: string;
}

/**
 * 刷新Token DTO
 */
export class RefreshTokenDto {
  @ApiProperty({ description: '刷新Token' })
  @IsNotEmpty({ message: 'refreshToken不能为空' })
  @IsString()
  refreshToken: string;
}

/**
 * 登录响应
 */
export class LoginResponseDto {
  @ApiProperty({ description: 'Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token过期时间（秒）' })
  expiresIn: number;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: number;
    username: string;
    name?: string;
    type: UserType;
  };
}
