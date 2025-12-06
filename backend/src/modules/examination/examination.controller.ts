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
import { ExaminationService } from './examination.service';
import {
  CreateExamItemDto,
  UpdateExamItemDto,
  QueryExamItemDto,
  CreateExaminationDto,
  UpdateExaminationStatusDto,
  UpdateExaminationItemDto,
  QueryExaminationDto,
} from './dto';
import { Roles, UserType, CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('体检管理')
@ApiBearerAuth('JWT-auth')
@Controller('examinations')
export class ExaminationController {
  constructor(private readonly examinationService: ExaminationService) {}

  /**
   * ==================== 体检项目管理 ====================
   */

  @Post('items')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建体检项目（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '项目名称已存在' })
  createExamItem(@Body() dto: CreateExamItemDto) {
    return this.examinationService.createExamItem(dto);
  }

  @Get('items')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '分页查询体检项目（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllExamItems(@Query() query: QueryExamItemDto) {
    return this.examinationService.findAllExamItems(query);
  }

  @Get('items/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '查询体检项目详情（管理员/医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '体检项目不存在' })
  findOneExamItem(@Param('id', ParseIntPipe) id: number) {
    return this.examinationService.findOneExamItem(id);
  }

  @Patch('items/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新体检项目（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '体检项目不存在' })
  @ApiResponse({ status: 400, description: '项目名称已存在' })
  updateExamItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamItemDto,
  ) {
    return this.examinationService.updateExamItem(id, dto);
  }

  @Delete('items/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除体检项目（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '体检项目不存在' })
  @ApiResponse({ status: 400, description: '该体检项目已被使用，无法删除' })
  deleteExamItem(@Param('id', ParseIntPipe) id: number) {
    return this.examinationService.deleteExamItem(id);
  }

  /**
   * ==================== 体检单管理 ====================
   */

  @Post()
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '开体检单（医生）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '部分体检项目不存在或已停用' })
  @ApiResponse({ status: 404, description: '患者或医生不存在' })
  createExamination(
    @Body() dto: CreateExaminationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.examinationService.createExamination(dto, user.sub);
  }

  @Post('admin')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '开体检单（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '部分体检项目不存在或已停用' })
  @ApiResponse({ status: 404, description: '患者或医生不存在' })
  adminCreateExamination(@Body() dto: CreateExaminationDto) {
    return this.examinationService.createExamination(dto);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '分页查询所有体检单（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllExaminations(@Query() query: QueryExaminationDto) {
    return this.examinationService.findAllExaminations(query);
  }

  @Get('my')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '查询我的体检记录（患者）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findMyExaminations(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryExaminationDto,
  ) {
    return this.examinationService.findMyExaminations(user.sub, query);
  }

  @Get('doctor')
  @Roles(UserType.DOCTOR)
  @ApiOperation({ summary: '查询我开的体检单（医生）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findDoctorExaminations(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryExaminationDto,
  ) {
    return this.examinationService.findAllExaminations({ ...query, doctorId: user.sub });
  }

  @Get(':id')
  @ApiOperation({ summary: '查询体检单详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '体检单不存在' })
  findOneExamination(@Param('id', ParseIntPipe) id: number) {
    return this.examinationService.findOneExamination(id);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '更新体检单状态（管理员/医生）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '体检单不存在' })
  @ApiResponse({ status: 400, description: '已取消的体检单无法修改状态/仍有体检项目未完成' })
  updateExaminationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExaminationStatusDto,
  ) {
    return this.examinationService.updateExaminationStatus(id, dto);
  }

  @Patch(':id/items/:itemId')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: '录入体检项目结果（管理员/医生）' })
  @ApiResponse({ status: 200, description: '录入成功' })
  @ApiResponse({ status: 404, description: '体检单或体检项目不存在' })
  @ApiResponse({ status: 400, description: '只有已缴费待检或检查中的体检单才能录入结果' })
  updateExaminationItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateExaminationItemDto,
  ) {
    return this.examinationService.updateExaminationItem(id, itemId, dto);
  }

  @Post(':id/cancel')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '取消体检单（患者）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待缴费或已缴费待检的体检单' })
  @ApiResponse({ status: 403, description: '只能取消自己的体检单' })
  cancelExamination(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.examinationService.cancelExamination(id, user.sub);
  }

  @Post(':id/admin-cancel')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '取消体检单（管理员）' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待缴费或已缴费待检的体检单' })
  adminCancelExamination(@Param('id', ParseIntPipe) id: number) {
    return this.examinationService.cancelExamination(id);
  }
}
