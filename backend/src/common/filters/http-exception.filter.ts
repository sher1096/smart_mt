import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 全局HTTP异常过滤器
 * 统一处理所有HTTP异常，返回标准格式的错误响应
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string) || exception.message;

        // 处理class-validator的验证错误
        if (Array.isArray(res.message)) {
          errors = res.message;
          message = '参数验证失败';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`未处理的异常: ${exception.message}`, exception.stack);
    }

    // 错误码映射
    const codeMap: Record<number, number> = {
      400: 40000, // Bad Request
      401: 40100, // Unauthorized
      403: 40300, // Forbidden
      404: 40400, // Not Found
      409: 40900, // Conflict
      422: 42200, // Unprocessable Entity
      429: 42900, // Too Many Requests
      500: 50000, // Internal Server Error
    };

    const errorResponse = {
      code: codeMap[status] || status * 100,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 记录错误日志
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
