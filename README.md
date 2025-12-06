# SmartMT 智慧医疗系统 V2

基于 NestJS + Vue 3 + Naive UI 重构的现代化医院管理系统。

## 技术栈

### 后端
- **框架**: NestJS 10.x + TypeScript
- **ORM**: Prisma 5.x
- **数据库**: MySQL 8.0
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **安全**: Helmet, CORS, 限流

### 前端
- **框架**: Vue 3 + TypeScript
- **构建**: Vite 5.x
- **UI库**: Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **请求**: Axios

## 项目结构

```
smart_mt_v2/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── common/          # 公共模块（装饰器、拦截器、过滤器等）
│   │   ├── modules/         # 业务模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── admin/       # 管理员模块
│   │   │   ├── patient/     # 患者模块
│   │   │   ├── doctor/      # 医生模块
│   │   │   ├── department/  # 科室模块
│   │   │   ├── schedule/    # 排班模块
│   │   │   ├── appointment/ # 挂号模块
│   │   │   ├── medical-record/ # 病历模块
│   │   │   ├── prescription/   # 处方模块
│   │   │   ├── medicine/    # 药品模块
│   │   │   ├── examination/ # 体检模块
│   │   │   ├── payment/     # 缴费模块
│   │   │   ├── message/     # 消息模块
│   │   │   ├── news/        # 新闻模块
│   │   │   ├── system/      # 系统配置模块
│   │   │   └── file/        # 文件上传模块
│   │   └── prisma/          # Prisma服务
│   └── prisma/
│       ├── schema.prisma    # 数据库模型
│       └── seed.ts          # 初始化数据
├── admin/                   # 管理后台（Vue 3）
└── patient/                 # 患者端（Vue 3，移动端优先）
```

## 功能模块

### 核心业务
- 科室管理（分类、科室信息）
- 医生管理（信息、排班）
- 预约挂号（在线挂号、取消、状态管理）
- 病历管理（创建、查询、权限控制）
- 处方管理（开药、药品关联、状态流转）
- 药品管理（分类、库存、进出库）
- 体检管理（项目、体检单、结果录入）
- 缴费系统（挂号费、处方费、体检费、充值）

### 辅助功能
- 消息通知（系统消息、提醒）
- 新闻公告（医院动态、健康资讯）
- 系统设置（导航、配置、页面内容、诊前须知）
- 文件上传（图片、文档）

### 用户管理
- 管理员登录
- 医生登录
- 患者注册/登录
- JWT认证 + 刷新令牌

## 快速开始

### 环境要求
- Node.js 18+
- MySQL 8.0+
- pnpm (推荐) 或 npm

### 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等

# 生成 Prisma 客户端
npx prisma generate

# 同步数据库结构
npx prisma db push

# 初始化数据
npx prisma db seed

# 启动开发服务器
pnpm run start:dev
```

后端服务默认运行在 http://localhost:3000

API 文档访问 http://localhost:3000/api

### 管理后台启动

```bash
# 进入管理后台目录
cd admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

管理后台默认运行在 http://localhost:5173

### 患者端启动

```bash
# 进入患者端目录
cd patient

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

患者端默认运行在 http://localhost:5174

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 医生 | doctor_zhangming | doctor123 |

## API 接口

所有接口以 `/api` 为前缀，主要模块：

- `/api/auth` - 认证（登录、注册、刷新令牌）
- `/api/admins` - 管理员管理
- `/api/patients` - 患者管理
- `/api/doctors` - 医生管理
- `/api/departments` - 科室管理
- `/api/schedules` - 排班管理
- `/api/appointments` - 挂号管理
- `/api/medical-records` - 病历管理
- `/api/prescriptions` - 处方管理
- `/api/medicines` - 药品管理
- `/api/examinations` - 体检管理
- `/api/payments` - 缴费管理
- `/api/messages` - 消息管理
- `/api/news` - 新闻管理
- `/api/system` - 系统配置
- `/api/files` - 文件上传

## 安全特性

- 密码 BCrypt 加密存储
- JWT 令牌认证
- 角色权限控制 (RBAC)
- 请求限流保护
- SQL 注入防护 (Prisma ORM)
- XSS 防护 (Helmet)
- CORS 跨域配置

## 部署

### 生产环境构建

```bash
# 后端构建
cd backend
pnpm run build

# 管理后台构建
cd admin
pnpm run build

# 患者端构建
cd patient
pnpm run build
```

### Docker 部署 (可选)

```bash
docker-compose up -d
```

## 开发规范

- 使用 TypeScript 强类型
- 遵循 RESTful API 设计
- 统一响应格式 `{ code, message, data }`
- 使用 DTO 进行数据验证
- 编写 Swagger 文档注解

## License

MIT
