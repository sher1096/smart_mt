import { SetMetadata } from '@nestjs/common';
import { UserType } from './current-user.decorator';

export const ROLES_KEY = 'roles';

/**
 * 角色装饰器
 * 用于标记接口需要的角色权限
 */
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
