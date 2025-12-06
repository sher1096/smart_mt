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
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto, QueryAdminDto } from './dto';
import { Roles, UserType } from '../../common/decorators';

@ApiTags('管理员')
@ApiBearerAuth('JWT-auth')
@Controller('admins')
@Roles(UserType.ADMIN) // 仅管理员可访问
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: '创建管理员' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询管理员列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryAdminDto) {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询管理员' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '管理员不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新管理员' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '管理员不存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除管理员' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '管理员不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.remove(id);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: '重置管理员密码' })
  @ApiResponse({ status: 200, description: '重置成功' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password: string,
  ) {
    return this.adminService.resetPassword(id, password);
  }
}
