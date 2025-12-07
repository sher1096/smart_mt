import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileService } from './file.service';
import { Public } from '../../common/decorators';

// 允许的文件类型
const ALLOWED_MIMETYPES = [
  // 图片类型
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // 文档类型
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// 允许的文件扩展名
const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
  '.doc',
  '.docx',
];

// 最大文件大小 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@ApiTags('文件上传')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 文件过滤器
   */
  private fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
    // 检查MIME类型
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `不支持的文件类型。允许的类型：${ALLOWED_EXTENSIONS.join(', ')}`,
        ),
        false,
      );
    }

    // 检查文件扩展名
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return callback(
        new BadRequestException(
          `不支持的文件扩展名。允许的扩展名：${ALLOWED_EXTENSIONS.join(', ')}`,
        ),
        false,
      );
    }

    callback(null, true);
  };

  /**
   * 磁盘存储配置
   */
  private storage = diskStorage({
    destination: (req, file, callback) => {
      const datePath = this.fileService.getDateBasedPath();
      this.fileService.ensureDateDirExists(datePath);
      callback(null, this.fileService.getFilePath(datePath));
    },
    filename: (req, file, callback) => {
      // 使用UUID生成唯一文件名
      const ext = extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;

      // 将完整路径（包含日期目录）保存到文件名中
      const datePath = this.fileService.getDateBasedPath();
      const fullFilename = `${datePath}/${filename}`;

      callback(null, fullFilename);
    },
  });

  @Post('upload')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const fileService = new FileService((req as any).configService);
          const datePath = fileService.getDateBasedPath();
          fileService.ensureDateDirExists(datePath);
          callback(null, fileService.getFilePath(datePath));
        },
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          const fileService = new FileService((req as any).configService);
          const datePath = fileService.getDateBasedPath();
          const fullFilename = `${datePath}/${filename}`;
          callback(null, fullFilename);
        },
      }),
      fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
        if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              `不支持的文件类型。允许的类型：${ALLOWED_EXTENSIONS.join(', ')}`,
            ),
            false,
          );
        }
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return callback(
            new BadRequestException(
              `不支持的文件扩展名。允许的扩展名：${ALLOWED_EXTENSIONS.join(', ')}`,
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '要上传的文件',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '文件上传成功',
    schema: {
      type: 'object',
      properties: {
        originalName: { type: 'string', description: '原始文件名' },
        filename: { type: 'string', description: '保存的文件名' },
        size: { type: 'number', description: '文件大小（字节）' },
        mimetype: { type: 'string', description: 'MIME类型' },
        url: { type: 'string', description: '文件访问URL' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '文件验证失败' })
  @ApiResponse({ status: 413, description: '文件过大（最大10MB）' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未选择文件');
    }

    if (file.size > MAX_FILE_SIZE) {
      // 如果文件已保存，删除它
      this.fileService.deleteFile(file.filename);
      throw new BadRequestException(`文件大小超过限制（最大10MB）`);
    }

    return this.fileService.handleUploadedFile(file);
  }

  @Post('uploads')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const fileService = new FileService((req as any).configService);
          const datePath = fileService.getDateBasedPath();
          fileService.ensureDateDirExists(datePath);
          callback(null, fileService.getFilePath(datePath));
        },
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          const fileService = new FileService((req as any).configService);
          const datePath = fileService.getDateBasedPath();
          const fullFilename = `${datePath}/${filename}`;
          callback(null, fullFilename);
        },
      }),
      fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
        if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              `不支持的文件类型。允许的类型：${ALLOWED_EXTENSIONS.join(', ')}`,
            ),
            false,
          );
        }
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return callback(
            new BadRequestException(
              `不支持的文件扩展名。允许的扩展名：${ALLOWED_EXTENSIONS.join(', ')}`,
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @ApiOperation({ summary: '上传多个文件', description: '最多同时上传10个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '要上传的文件列表（最多10个）',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '文件上传成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          originalName: { type: 'string', description: '原始文件名' },
          filename: { type: 'string', description: '保存的文件名' },
          size: { type: 'number', description: '文件大小（字节）' },
          mimetype: { type: 'string', description: 'MIME类型' },
          url: { type: 'string', description: '文件访问URL' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '文件验证失败' })
  @ApiResponse({ status: 413, description: '文件过大（最大10MB）' })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('未选择文件');
    }

    if (files.length > 10) {
      // 删除已上传的文件
      files.forEach(file => this.fileService.deleteFile(file.filename));
      throw new BadRequestException('最多只能上传10个文件');
    }

    // 检查每个文件的大小
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      // 删除所有已上传的文件
      files.forEach(file => this.fileService.deleteFile(file.filename));
      throw new BadRequestException(`部分文件大小超过限制（最大10MB）`);
    }

    return this.fileService.handleUploadedFiles(files);
  }

  @Get(':filename(*)')
  @Public()
  @ApiOperation({ summary: '获取文件', description: '公开访问，无需认证' })
  @ApiResponse({ status: 200, description: '文件内容' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    // 安全性检查：防止路径遍历攻击
    if (filename.includes('..') || filename.startsWith('/')) {
      throw new BadRequestException('无效的文件名');
    }

    const filePath = this.fileService.getFilePath(filename);

    if (!this.fileService.fileExists(filename)) {
      throw new NotFoundException('文件不存在');
    }

    // 发送文件
    return res.sendFile(filePath, { root: '.' });
  }
}
