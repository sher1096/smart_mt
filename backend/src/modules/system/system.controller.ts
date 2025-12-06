import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemService } from './system.service';
import {
  CreateNavigationDto,
  UpdateNavigationDto,
  CreateSystemConfigDto,
  UpdateSystemConfigDto,
  CreatePageContentDto,
  UpdatePageContentDto,
  CreateDiagnosisGuideDto,
  UpdateDiagnosisGuideDto,
} from './dto';
import { Roles, UserType } from '../../common/decorators';
import { Public } from '../../common/decorators';

@ApiTags('系统管理')
@ApiBearerAuth('JWT-auth')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // ==================== 导航管理接口 ====================

  @Post('navigations')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建导航（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createNavigation(@Body() dto: CreateNavigationDto) {
    return this.systemService.createNavigation(dto);
  }

  @Get('navigations')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '获取所有导航（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllNavigations() {
    return this.systemService.findAllNavigations();
  }

  @Get('navigations/public')
  @Public()
  @ApiOperation({ summary: '获取前端导航列表（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findPublicNavigations() {
    return this.systemService.findPublicNavigations();
  }

  @Get('navigations/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '根据ID查询导航（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '导航不存在' })
  findOneNavigation(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.findOneNavigation(id);
  }

  @Patch('navigations/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新导航（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '导航不存在' })
  updateNavigation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNavigationDto,
  ) {
    return this.systemService.updateNavigation(id, dto);
  }

  @Delete('navigations/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除导航（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '导航不存在' })
  removeNavigation(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.removeNavigation(id);
  }

  // ==================== 系统配置接口 ====================

  @Post('configs')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建系统配置（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '配置键已存在' })
  createSystemConfig(@Body() dto: CreateSystemConfigDto) {
    return this.systemService.createSystemConfig(dto);
  }

  @Get('configs')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '获取所有系统配置（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllSystemConfigs() {
    return this.systemService.findAllSystemConfigs();
  }

  @Get('configs/public')
  @Public()
  @ApiOperation({ summary: '获取系统配置（公开）' })
  @ApiResponse({ status: 200, description: '查询成功，返回键值对格式' })
  findPublicSystemConfigs() {
    return this.systemService.findPublicSystemConfigs();
  }

  @Get('configs/key/:key')
  @Public()
  @ApiOperation({ summary: '根据key获取单个配置（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  findSystemConfigByKey(@Param('key') key: string) {
    return this.systemService.findSystemConfigByKey(key);
  }

  @Get('configs/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '根据ID查询系统配置（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  findOneSystemConfig(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.findOneSystemConfig(id);
  }

  @Patch('configs/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新系统配置（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  updateSystemConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSystemConfigDto,
  ) {
    return this.systemService.updateSystemConfig(id, dto);
  }

  @Delete('configs/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除系统配置（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  removeSystemConfig(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.removeSystemConfig(id);
  }

  // ==================== 页面内容接口 ====================

  @Post('page-contents')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建页面内容（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '页面代码已存在' })
  createPageContent(@Body() dto: CreatePageContentDto) {
    return this.systemService.createPageContent(dto);
  }

  @Get('page-contents')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '获取所有页面内容（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllPageContents() {
    return this.systemService.findAllPageContents();
  }

  @Get('page-contents/code/:code')
  @Public()
  @ApiOperation({ summary: '根据code获取页面内容（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '页面内容不存在' })
  findPageContentByCode(@Param('code') code: string) {
    return this.systemService.findPageContentByCode(code);
  }

  @Get('page-contents/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '根据ID查询页面内容（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '页面内容不存在' })
  findOnePageContent(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.findOnePageContent(id);
  }

  @Patch('page-contents/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新页面内容（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '页面内容不存在' })
  updatePageContent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageContentDto,
  ) {
    return this.systemService.updatePageContent(id, dto);
  }

  @Delete('page-contents/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除页面内容（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '页面内容不存在' })
  removePageContent(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.removePageContent(id);
  }

  // ==================== 诊前须知接口 ====================

  @Post('diagnosis-guides')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建诊前须知（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  createDiagnosisGuide(@Body() dto: CreateDiagnosisGuideDto) {
    return this.systemService.createDiagnosisGuide(dto);
  }

  @Get('diagnosis-guides')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '获取所有诊前须知（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllDiagnosisGuides() {
    return this.systemService.findAllDiagnosisGuides();
  }

  @Get('diagnosis-guides/public')
  @Public()
  @ApiOperation({ summary: '获取诊前须知列表（公开）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findPublicDiagnosisGuides() {
    return this.systemService.findPublicDiagnosisGuides();
  }

  @Get('diagnosis-guides/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '根据ID查询诊前须知（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '诊前须知不存在' })
  findOneDiagnosisGuide(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.findOneDiagnosisGuide(id);
  }

  @Patch('diagnosis-guides/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新诊前须知（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '诊前须知不存在' })
  updateDiagnosisGuide(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiagnosisGuideDto,
  ) {
    return this.systemService.updateDiagnosisGuide(id, dto);
  }

  @Delete('diagnosis-guides/:id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除诊前须知（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '诊前须知不存在' })
  removeDiagnosisGuide(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.removeDiagnosisGuide(id);
  }
}
