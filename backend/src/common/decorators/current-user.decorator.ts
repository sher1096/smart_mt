import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 用户类型枚举
 */
export enum UserType {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

/**
 * JWT Payload 类型
 */
export interface JwtPayload {
  sub: number; // 用户ID
  username: string; // 用户名
  type: UserType; // 用户类型
  iat?: number;
  exp?: number;
}

/**
 * 当前用户装饰器
 * 从JWT Token中提取当前登录用户信息
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
);
