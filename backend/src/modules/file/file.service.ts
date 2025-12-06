import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    // 从配置中获取上传目录，默认为 'uploads'
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');

    // 确保上传目录存在
    this.ensureUploadDirExists();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 获取当前日期目录 (YYYY/MM/DD)
   */
  getDateBasedPath(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return path.join(year.toString(), month, day);
  }

  /**
   * 确保日期目录存在
   */
  ensureDateDirExists(datePath: string): void {
    const fullPath = path.join(this.uploadDir, datePath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  /**
   * 生成文件URL
   */
  generateFileUrl(filename: string): string {
    return `${this.baseUrl}/files/${filename}`;
  }

  /**
   * 处理单个文件上传结果
   */
  handleUploadedFile(file: Express.Multer.File): {
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
    url: string;
  } {
    if (!file) {
      throw new BadRequestException('文件上传失败');
    }

    return {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: this.generateFileUrl(file.filename),
    };
  }

  /**
   * 处理多个文件上传结果
   */
  handleUploadedFiles(files: Express.Multer.File[]): Array<{
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
    url: string;
  }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('未选择文件');
    }

    return files.map(file => this.handleUploadedFile(file));
  }

  /**
   * 获取文件路径
   */
  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  /**
   * 检查文件是否存在
   */
  fileExists(filename: string): boolean {
    const filePath = this.getFilePath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * 删除文件
   */
  deleteFile(filename: string): void {
    const filePath = this.getFilePath(filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
