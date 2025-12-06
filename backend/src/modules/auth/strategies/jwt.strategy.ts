import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, UserType } from '../../../common/decorators';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * JWT 策略
 * 用于验证 JWT Token 并提取用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * 验证 JWT Payload
   * 返回的对象会被附加到 request.user
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const { sub, type } = payload;

    // 验证用户是否存在且状态正常
    let user: { id: number; status: number } | null = null;

    switch (type) {
      case UserType.ADMIN:
        user = await this.prisma.admin.findUnique({
          where: { id: sub },
          select: { id: true, status: true },
        });
        break;
      case UserType.DOCTOR:
        user = await this.prisma.doctor.findUnique({
          where: { id: sub },
          select: { id: true, status: true },
        });
        break;
      case UserType.PATIENT:
        user = await this.prisma.patient.findUnique({
          where: { id: sub },
          select: { id: true, status: true },
        });
        break;
      default:
        throw new UnauthorizedException('无效的用户类型');
    }

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    return payload;
  }
}
