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
import { ScheduleService } from './schedule.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  QueryScheduleDto,
  BatchCreateScheduleDto,
} from './dto';
import { Roles, UserType, Public } from '../../common/decorators';

@ApiTags('排班')
@ApiBearerAuth('JWT-auth')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建排班' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '该时段已有排班' })
  create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @Post('batch')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '批量创建排班' })
  @ApiResponse({ status: 201, description: '创建成功' })
  batchCreate(@Body() dto: BatchCreateScheduleDto) {
    return this.scheduleService.batchCreate(dto);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '分页查询排班列表（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryScheduleDto) {
    return this.scheduleService.findAll(query);
  }

  @Get('available')
  @Public()
  @ApiOperation({ summary: '查询可预约的排班（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAvailable(@Query() query: QueryScheduleDto) {
    return this.scheduleService.findAvailable(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '根据ID查询排班详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '排班不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新排班' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '排班不存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScheduleDto) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除排班' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 400, description: '该排班已有预约，无法删除' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }

  @Post(':id/suspend')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '停诊' })
  @ApiResponse({ status: 200, description: '操作成功' })
  suspend(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.suspend(id);
  }

  @Post(':id/resume')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '恢复出诊' })
  @ApiResponse({ status: 200, description: '操作成功' })
  resume(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.resume(id);
  }
}
