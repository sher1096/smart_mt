import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto, UpdatePatientDto, QueryPatientDto, RechargeDto } from './dto';
import { Roles, UserType, CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('患者')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建患者（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  create(@Body() dto: CreatePatientDto) {
    return this.patientService.create(dto);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '分页查询患者列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryPatientDto) {
    return this.patientService.findAll(query);
  }

  @Get('profile')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '获取当前患者个人信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.patientService.findOne(user.sub);
  }

  @Patch('profile')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '更新当前患者个人信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePatientDto) {
    // 患者只能更新部分字段，不能修改状态
    const { status, ...updateData } = dto;
    return this.patientService.update(user.sub, updateData);
  }

  @Get('balance')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '获取当前患者余额' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getMyBalance(@CurrentUser() user: JwtPayload) {
    return this.patientService.getBalance(user.sub);
  }

  @Post('recharge')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '当前患者充值' })
  @ApiResponse({ status: 200, description: '充值成功' })
  rechargeMyAccount(@CurrentUser() user: JwtPayload, @Body() dto: RechargeDto) {
    return this.patientService.recharge(user.sub, dto.amount);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '根据ID查询患者' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '患者不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新患者（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '患者不存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
    return this.patientService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除患者（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '患者不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.remove(id);
  }

  @Post(':id/recharge')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '为患者充值（管理员）' })
  @ApiResponse({ status: 200, description: '充值成功' })
  recharge(@Param('id', ParseIntPipe) id: number, @Body() dto: RechargeDto) {
    return this.patientService.recharge(id, dto.amount);
  }

  @Get(':id/balance')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '获取患者余额' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getBalance(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.getBalance(id);
  }
}
