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
import { PrescriptionService } from './prescription.service';
import {
  CreatePrescriptionDto,
  QueryPrescriptionDto,
  UpdatePrescriptionStatusDto,
} from './dto';
import { Roles, UserType, CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('处方管理')
@ApiBearerAuth('JWT-auth')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '医生开处方' })
  @ApiResponse({ status: 201, description: '开处方成功' })
  @ApiResponse({ status: 400, description: '病历不存在/药品不存在/库存不足' })
  @ApiResponse({ status: 403, description: '只能为自己的病历开处方' })
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: JwtPayload) {
    return this.prescriptionService.create(dto, user.sub);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '管理员查询所有处方' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryPrescriptionDto) {
    return this.prescriptionService.findAll(query);
  }

  @Get('doctor')
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '医生查询自己开的处方' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findDoctorPrescriptions(@CurrentUser() user: JwtPayload, @Query() query: QueryPrescriptionDto) {
    return this.prescriptionService.findDoctorPrescriptions(user.sub, query);
  }

  @Get('patient')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '患者查询自己的处方' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findPatientPrescriptions(@CurrentUser() user: JwtPayload, @Query() query: QueryPrescriptionDto) {
    return this.prescriptionService.findPatientPrescriptions(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询处方详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '处方不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prescriptionService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '更新处方状态（医生/管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '状态流转错误' })
  @ApiResponse({ status: 403, description: '医生只能操作自己开的处方' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrescriptionStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prescriptionService.updateStatus(id, dto, user.sub, user.type);
  }
}
