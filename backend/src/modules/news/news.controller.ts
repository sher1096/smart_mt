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
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto, QueryNewsDto } from './dto';
import { Roles, UserType, Public } from '../../common/decorators';

@ApiTags('新闻公告')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ==================== 管理员接口 ====================

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '创建新闻（管理员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @Get('admin')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '分页查询新闻列表（管理员 - 可查看所有状态）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllAdmin(@Query() query: QueryNewsDto) {
    return this.newsService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '查询新闻详情（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '新闻不存在' })
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '更新新闻（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '新闻不存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '删除新闻（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '新闻不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }

  // ==================== 公开接口 ====================

  @Get()
  @Public()
  @ApiOperation({ summary: '分页查询新闻列表（公开 - 仅返回已发布）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAllPublic(@Query() query: QueryNewsDto) {
    return this.newsService.findAllPublic(query);
  }

  @Get('latest')
  @Public()
  @ApiOperation({
    summary: '获取最新新闻（首页展示）',
    description: '默认返回5条最新已发布的新闻，可通过limit参数指定数量'
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  findLatest(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.newsService.findLatest(limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '查询新闻详情（公开 - 仅已发布，自动增加浏览量）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '新闻不存在或未发布' })
  findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOnePublic(id);
  }
}
