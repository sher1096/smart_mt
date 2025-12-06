import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 安全中间件
  app.use(helmet());

  // 全局前缀
  app.setGlobalPrefix('api');

  // CORS配置
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 过滤掉DTO中未定义的属性
      forbidNonWhitelisted: true, // 如果有未定义的属性则报错
      transform: true, // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger文档配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SmartMT 医疗系统 API')
    .setDescription('智能医疗管理系统后端接口文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('认证', '用户登录、注册、Token刷新')
    .addTag('管理员', '管理员账户管理')
    .addTag('患者', '患者账户管理')
    .addTag('医生', '医生账户管理')
    .addTag('科室', '科室信息管理')
    .addTag('排班', '医生排班管理')
    .addTag('挂号', '在线挂号预约')
    .addTag('病历', '病历信息管理')
    .addTag('处方', '处方信息管理')
    .addTag('药品', '药品信息管理')
    .addTag('体检', '体检预约与报告')
    .addTag('缴费', '费用支付管理')
    .addTag('消息', '消息咨询系统')
    .addTag('新闻', '新闻公告管理')
    .addTag('配置', '系统配置管理')
    .addTag('文件', '文件上传管理')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   SmartMT 医疗系统后端服务已启动                            ║
  ║                                                           ║
  ║   服务地址: http://localhost:${port}                        ║
  ║   API文档:  http://localhost:${port}/api/docs               ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
