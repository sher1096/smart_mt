import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalRecordService } from './medical-record.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  QueryMedicalRecordDto,
} from './dto';
import { Roles, UserType, CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('病历管理')
@ApiBearerAuth('JWT-auth')
@Controller('medical-records')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '医生创建病历' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '该挂号已有病历记录' })
  @ApiResponse({ status: 403, description: '只能为自己的患者创建病历' })
  @ApiResponse({ status: 404, description: '挂号记录不存在' })
  create(@Body() dto: CreateMedicalRecordDto, @CurrentUser() user: JwtPayload) {
    return this.medicalRecordService.create(dto, user.sub);
  }

  @Patch(':id')
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '医生更新病历' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '只能修改自己创建的病历' })
  @ApiResponse({ status: 404, description: '病历记录不存在' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.medicalRecordService.update(id, dto, user.sub);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '管理员查询所有病历列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryMedicalRecordDto) {
    return this.medicalRecordService.findAll(query);
  }

  @Get('doctor/my')
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '医生查询自己创建的病历列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findDoctorRecords(@CurrentUser() user: JwtPayload, @Query() query: QueryMedicalRecordDto) {
    return this.medicalRecordService.findDoctorRecords(user.sub, query);
  }

  @Get('patient/my')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '患者查询自己的病历列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findPatientRecords(@CurrentUser() user: JwtPayload, @Query() query: QueryMedicalRecordDto) {
    return this.medicalRecordService.findPatientRecords(user.sub, query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: '查询病历详情（包含关联的处方）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 403, description: '只能查看自己的病历记录' })
  @ApiResponse({ status: 404, description: '病历记录不存在' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    // 管理员可以查看所有病历，医生和患者需要验证权限
    if (user.type === UserType.ADMIN) {
      return this.medicalRecordService.findOne(id);
    }
    return this.medicalRecordService.findOne(id, user.sub, user.type);
  }
}
