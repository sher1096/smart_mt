import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessageService } from './message.service';
import {
  CreateMessageDto,
  BatchCreateMessageDto,
  QueryMessageDto,
  MarkReadDto,
} from './dto';
import { Roles, UserType, CurrentUser, JwtPayload } from '../../common/decorators';

@ApiTags('消息管理')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // ==================== 管理员接口 ====================

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '发送消息给患者（管理员）' })
  @ApiResponse({ status: 201, description: '发送成功' })
  @ApiResponse({ status: 404, description: '患者不存在' })
  create(@Body() dto: CreateMessageDto) {
    return this.messageService.create(dto);
  }

  @Post('batch')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '批量发送消息（管理员）' })
  @ApiResponse({ status: 201, description: '发送成功' })
  @ApiResponse({ status: 404, description: '部分患者不存在' })
  batchCreate(@Body() dto: BatchCreateMessageDto) {
    return this.messageService.batchCreate(dto);
  }

  @Get('all')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '查询所有消息列表（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryMessageDto) {
    return this.messageService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: '根据ID查询消息详情（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '消息不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.messageService.findOne(id);
  }

  // ==================== 患者接口 ====================

  @Get('my/list')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '查询我的消息列表（患者）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findMyMessages(@CurrentUser() user: JwtPayload, @Query() query: QueryMessageDto) {
    return this.messageService.findMyMessages(user.sub, query);
  }

  @Get('my/unread-count')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '获取未读消息数量（患者）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.messageService.getUnreadCount(user.sub);
  }

  @Patch('my/mark-read')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '标记消息为已读（患者）' })
  @ApiResponse({ status: 200, description: '标记成功' })
  @ApiResponse({ status: 403, description: '无权操作其他患者的消息' })
  markAsRead(@CurrentUser() user: JwtPayload, @Body() dto: MarkReadDto) {
    return this.messageService.markAsRead(user.sub, dto);
  }

  @Patch('my/mark-all-read')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '标记所有消息为已读（患者）' })
  @ApiResponse({ status: 200, description: '标记成功' })
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.messageService.markAllAsRead(user.sub);
  }

  @Delete('my/:id')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '删除消息（患者）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '消息不存在' })
  @ApiResponse({ status: 403, description: '无权删除其他患者的消息' })
  remove(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return this.messageService.remove(user.sub, id);
  }

  @Delete('my/batch/remove')
  @Roles(UserType.PATIENT)
  @ApiOperation({ summary: '批量删除消息（患者）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '无权删除其他患者的消息' })
  batchRemove(@CurrentUser() user: JwtPayload, @Body() dto: MarkReadDto) {
    // 复用MarkReadDto，因为结构相同（都是messageIds数组）
    return this.messageService.batchRemove(user.sub, dto.messageIds);
  }
}
