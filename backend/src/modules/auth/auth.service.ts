import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, LoginResponseDto } from './dto';
import { UserType, JwtPayload } from '../../common/decorators';

/**
 * 认证服务
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 用户登录
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const { username, password, type } = dto;

    let user: { id: number; username: string; password: string; name?: string } | null = null;

    // 根据用户类型查询不同的表
    switch (type) {
      case UserType.ADMIN:
        const admin = await this.prisma.admin.findUnique({
          where: { username },
          select: { id: true, username: true, password: true, nickname: true, status: true },
        });
        if (admin) {
          user = { id: admin.id, username: admin.username, password: admin.password, name: admin.nickname || undefined };
          if (admin.status !== 1) {
            throw new UnauthorizedException('账号已被禁用');
          }
        }
        break;

      case UserType.DOCTOR:
        const doctor = await this.prisma.doctor.findUnique({
          where: { employeeNo: username },
          select: { id: true, employeeNo: true, password: true, name: true, status: true },
        });
        if (doctor) {
          user = { id: doctor.id, username: doctor.employeeNo, password: doctor.password, name: doctor.name };
          if (doctor.status !== 1) {
            throw new UnauthorizedException('账号已被禁用');
          }
        }
        break;

      case UserType.PATIENT:
        const patient = await this.prisma.patient.findUnique({
          where: { username },
          select: { id: true, username: true, password: true, name: true, status: true },
        });
        if (patient) {
          user = { id: patient.id, username: patient.username, password: patient.password, name: patient.name };
          if (patient.status !== 1) {
            throw new UnauthorizedException('账号已被禁用');
          }
        }
        break;

      default:
        throw new UnauthorizedException('无效的用户类型');
    }

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 Token
    const tokens = await this.generateTokens(user.id, user.username, type);

    this.logger.log(`用户 ${username} (${type}) 登录成功`);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        type,
      },
    };
  }

  /**
   * 患者注册
   */
  async register(dto: RegisterDto): Promise<LoginResponseDto> {
    const { username, password, name, phone, gender } = dto;

    // 检查用户名是否已存在
    const existingUser = await this.prisma.patient.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 生成就诊卡号
    const medicalCardNo = this.generateMedicalCardNo();

    // 加密密码
    const hashedPassword = await this.hashPassword(password);

    // 创建用户
    const patient = await this.prisma.patient.create({
      data: {
        username,
        password: hashedPassword,
        name,
        phone,
        gender,
        medicalCardNo,
      },
    });

    // 生成 Token
    const tokens = await this.generateTokens(patient.id, patient.username, UserType.PATIENT);

    this.logger.log(`患者 ${username} 注册成功`);

    return {
      ...tokens,
      user: {
        id: patient.id,
        username: patient.username,
        name: patient.name,
        type: UserType.PATIENT,
      },
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          username: payload.username,
          type: payload.type,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
        },
      );

      return {
        accessToken: newAccessToken,
        expiresIn: 7200,
      };
    } catch {
      throw new UnauthorizedException('无效的刷新Token');
    }
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: number,
    userType: UserType,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    let user: { password: string } | null = null;

    switch (userType) {
      case UserType.ADMIN:
        user = await this.prisma.admin.findUnique({
          where: { id: userId },
          select: { password: true },
        });
        break;
      case UserType.DOCTOR:
        user = await this.prisma.doctor.findUnique({
          where: { id: userId },
          select: { password: true },
        });
        break;
      case UserType.PATIENT:
        user = await this.prisma.patient.findUnique({
          where: { id: userId },
          select: { password: true },
        });
        break;
    }

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isOldPasswordValid = await this.validatePassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    const hashedNewPassword = await this.hashPassword(newPassword);

    switch (userType) {
      case UserType.ADMIN:
        await this.prisma.admin.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        break;
      case UserType.DOCTOR:
        await this.prisma.doctor.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        break;
      case UserType.PATIENT:
        await this.prisma.patient.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        break;
    }
  }

  /**
   * 生成 JWT Tokens
   */
  private async generateTokens(
    userId: number,
    username: string,
    type: UserType,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      username,
      type,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 7200, // 2小时
    };
  }

  /**
   * 密码加密
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 验证密码
   */
  private async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // 兼容旧系统明文密码（临时，正式环境应移除）
    if (plainPassword === hashedPassword) {
      return true;
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 生成就诊卡号
   */
  private generateMedicalCardNo(): string {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `MC${timestamp}${random}`;
  }
}
