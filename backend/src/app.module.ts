import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { PatientModule } from './modules/patient/patient.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { DepartmentModule } from './modules/department/department.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { MedicalRecordModule } from './modules/medical-record/medical-record.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { MedicineModule } from './modules/medicine/medicine.module';
import { ExaminationModule } from './modules/examination/examination.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MessageModule } from './modules/message/message.module';
import { NewsModule } from './modules/news/news.module';
import { SystemModule } from './modules/system/system.module';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 限流模块 - 防止暴力攻击
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1分钟
        limit: 100, // 最多100次请求
      },
    ]),

    // Prisma数据库模块
    PrismaModule,

    // 认证模块
    AuthModule,

    // 用户模块
    AdminModule,
    PatientModule,
    DoctorModule,

    // 核心业务模块
    DepartmentModule,   // 科室管理
    ScheduleModule,     // 排班管理
    AppointmentModule,  // 挂号预约
    MedicalRecordModule,// 病历管理
    PrescriptionModule, // 处方管理
    MedicineModule,     // 药品管理
    ExaminationModule,  // 体检管理
    PaymentModule,      // 缴费系统

    // 辅助功能模块
    MessageModule,      // 消息系统
    NewsModule,         // 新闻公告
    SystemModule,       // 系统管理（导航、配置、页面内容、诊前须知）
    FileModule,         // 文件上传
  ],
})
export class AppModule {}
