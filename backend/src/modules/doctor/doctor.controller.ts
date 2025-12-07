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
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, UpdateDoctorDto, QueryDoctorDto } from './dto';
import { Roles, UserType, CurrentUser, JwtPayload, Public } from '../../common/decorators';

@ApiTags('医生')
@ApiBearerAuth('JWT-auth')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建医生（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '工号已存在' })
  @ApiResponse({ status: 404, description: '科室不存在' })
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '分页查询医生列表（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryDoctorDto) {
    return this.doctorService.findAll(query);
  }

  @Get('profile')
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '获取当前医生个人信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.doctorService.findOne(user.sub);
  }

  @Patch('profile')
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '更新当前医生个人信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateDoctorDto) {
    // 医生只能更新部分字段，不能修改状态、工号、科室
    const { status, employeeNo, departmentId, ...updateData } = dto;
    return this.doctorService.update(user.sub, updateData);
  }

  @Get('department/:departmentId')
  @Public()
  @ApiOperation({ summary: '根据科室ID查询医生列表（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number) {
    return this.doctorService.findByDepartment(departmentId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '根据ID查询医生详情（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '医生不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新医生（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '医生不存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除医生（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '医生不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.remove(id);
  }
}
