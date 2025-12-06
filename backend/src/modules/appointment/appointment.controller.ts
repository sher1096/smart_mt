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
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentDto,
  AdminCreateAppointmentDto,
  QueryAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto';
import { Roles, UserType, CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('挂号')
@ApiBearerAuth('JWT-auth')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '患者挂号' })
  @ApiResponse({ status: 201, description: '挂号成功' })
  @ApiResponse({ status: 400, description: '该时段已停诊/已约满/已预约过' })
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: JwtPayload) {
    return this.appointmentService.create(dto, user.sub);
  }

  @Post('admin')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '管理员为患者挂号' })
  @ApiResponse({ status: 201, description: '挂号成功' })
  adminCreate(@Body() dto: AdminCreateAppointmentDto) {
    return this.appointmentService.adminCreate(dto);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '分页查询所有挂号记录（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryAppointmentDto) {
    return this.appointmentService.findAll(query);
  }

  @Get('my')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '查询我的挂号记录（患者）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findMyAppointments(@CurrentUser() user: JwtPayload, @Query() query: QueryAppointmentDto) {
    return this.appointmentService.findMyAppointments(user.sub, query);
  }

  @Get('doctor')
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '查询我的患者挂号记录（医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findDoctorAppointments(@CurrentUser() user: JwtPayload, @Query() query: QueryAppointmentDto) {
    return this.appointmentService.findDoctorAppointments(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询挂号详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '挂号记录不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findOne(id);
  }

  @Post(':id/cancel')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '取消挂号（患者）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待就诊状态的挂号' })
  @ApiResponse({ status: 403, description: '只能取消自己的挂号' })
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.appointmentService.cancel(id, user.sub);
  }

  @Post(':id/admin-cancel')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '取消挂号（管理员）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  adminCancel(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.cancel(id);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '更新挂号状态（医生/管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentService.updateStatus(id, dto);
  }
}
