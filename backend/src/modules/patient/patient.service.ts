import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto, QueryPatientDto } from './dto';
import { createPaginatedResponse, PaginatedResponseDto } from '../../common/dto';
import { Patient, Prisma } from '@prisma/client';

type PatientWithoutPassword = Omit<Patient, 'password'>;

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建患者
   */
  async create(dto: CreatePatientDto): Promise<PatientWithoutPassword> {
    // 检查用户名是否已存在
    const existing = await this.prisma.patient.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 生成就诊卡号
    const medicalCardNo = this.generateMedicalCardNo();

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const patient = await this.prisma.patient.create({
      data: {
        ...dto,
        password: hashedPassword,
        medicalCardNo,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = patient;
    return result;
  }

  /**
   * 分页查询患者列表
   */
  async findAll(query: QueryPatientDto): Promise<PaginatedResponseDto<PatientWithoutPassword>> {
    const { page = 1, pageSize = 10, username, name, phone, medicalCardNo, status } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PatientWhereInput = {
      ...(username && { username: { contains: username } }),
      ...(name && { name: { contains: name } }),
      ...(phone && { phone: { contains: phone } }),
      ...(medicalCardNo && { medicalCardNo: { contains: medicalCardNo } }),
      ...(status !== undefined && { status }),
    };

    const [list, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          gender: true,
          phone: true,
          idCard: true,
          age: true,
          avatar: true,
          medicalCardNo: true,
          balance: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return createPaginatedResponse(list, total, page, pageSize);
  }

  /**
   * 根据ID查询患者
   */
  async findOne(id: number): Promise<PatientWithoutPassword> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        gender: true,
        phone: true,
        idCard: true,
        age: true,
        avatar: true,
        medicalCardNo: true,
        balance: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('患者不存在');
    }

    return patient;
  }

  /**
   * 更新患者
   */
  async update(id: number, dto: UpdatePatientDto): Promise<PatientWithoutPassword> {
    await this.findOne(id);

    // 如果更新密码，需要加密
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const patient = await this.prisma.patient.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        gender: true,
        phone: true,
        idCard: true,
        age: true,
        avatar: true,
        medicalCardNo: true,
        balance: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return patient;
  }

  /**
   * 删除患者
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.patient.delete({ where: { id } });
  }

  /**
   * 充值
   */
  async recharge(id: number, amount: number): Promise<PatientWithoutPassword> {
    const patient = await this.findOne(id);

    // 创建充值记录
    const rechargeNo = `RC${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    await this.prisma.$transaction([
      // 创建充值记录
      this.prisma.recharge.create({
        data: {
          rechargeNo,
          amount,
          patientId: id,
          status: 1, // 直接标记为已完成（实际应该接入支付系统）
          paidAt: new Date(),
        },
      }),
      // 更新余额
      this.prisma.patient.update({
        where: { id },
        data: {
          balance: {
            increment: amount,
          },
        },
      }),
    ]);

    return {
      ...patient,
      balance: new Prisma.Decimal(Number(patient.balance) + amount),
    };
  }

  /**
   * 获取患者余额
   */
  async getBalance(id: number): Promise<{ balance: number }> {
    const patient = await this.findOne(id);
    return { balance: Number(patient.balance) };
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
