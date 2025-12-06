# SmartMT 智慧医疗系统 V2

基于 NestJS + Vue 3 + Naive UI 重构的现代化医院管理系统，包含完整的后端 API、管理后台和患者端移动应用。

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [API 文档](#api-文档)
- [默认账号](#默认账号)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

## 功能特性

### 核心业务模块
| 模块 | 功能描述 |
|------|----------|
| 科室管理 | 科室分类、科室信息、科室状态管理 |
| 医生管理 | 医生信息、职称、专长、排班关联 |
| 排班管理 | 医生排班、批量排班、排班状态 |
| 预约挂号 | 在线挂号、取消预约、排队叫号 |
| 病历管理 | 电子病历、主诉、诊断、治疗方案 |
| 处方管理 | 开具处方、药品明细、处方状态流转 |
| 药品管理 | 药品分类、库存管理、进出库记录 |
| 体检管理 | 体检项目、体检套餐、结果录入 |
| 缴费系统 | 挂号费、处方费、体检费、余额充值 |

### 辅助功能模块
| 模块 | 功能描述 |
|------|----------|
| 消息通知 | 系统消息、挂号提醒、缴费提醒 |
| 新闻公告 | 医院公告、健康资讯、医院动态 |
| 系统配置 | 导航管理、系统参数、页面内容、诊前须知 |
| 文件上传 | 图片上传、文件管理 |

### 用户角色
- **管理员**: 系统全部功能管理
- **医生**: 排班查看、接诊、开处方、写病历
- **患者**: 预约挂号、查看病历、缴费充值

## 技术栈

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| NestJS | 10.x | 后端框架 |
| TypeScript | 5.x | 开发语言 |
| Prisma | 5.x | ORM 框架 |
| MySQL | 8.0+ | 数据库 |
| JWT | - | 身份认证 |
| Swagger | - | API 文档 |

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| TypeScript | 5.x | 开发语言 |
| Vite | 5.x | 构建工具 |
| Naive UI | 2.x | UI 组件库 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由管理 |
| Axios | 1.x | HTTP 客户端 |

## 项目结构

```
smart_mt/
├── backend/                    # 后端项目 (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma       # 数据库模型定义
│   │   └── seed.ts             # 数据库初始化脚本
│   ├── src/
│   │   ├── common/             # 公共模块
│   │   │   ├── decorators/     # 自定义装饰器
│   │   │   ├── dto/            # 通用 DTO
│   │   │   ├── filters/        # 异常过滤器
│   │   │   ├── guards/         # 守卫
│   │   │   └── interceptors/   # 拦截器
│   │   ├── modules/            # 业务模块
│   │   │   ├── admin/          # 管理员模块
│   │   │   ├── appointment/    # 挂号模块
│   │   │   ├── auth/           # 认证模块
│   │   │   ├── department/     # 科室模块
│   │   │   ├── doctor/         # 医生模块
│   │   │   ├── examination/    # 体检模块
│   │   │   ├── file/           # 文件模块
│   │   │   ├── medical-record/ # 病历模块
│   │   │   ├── medicine/       # 药品模块
│   │   │   ├── message/        # 消息模块
│   │   │   ├── news/           # 新闻模块
│   │   │   ├── patient/        # 患者模块
│   │   │   ├── payment/        # 缴费模块
│   │   │   ├── prescription/   # 处方模块
│   │   │   ├── schedule/       # 排班模块
│   │   │   └── system/         # 系统配置模块
│   │   ├── prisma/             # Prisma 服务
│   │   ├── app.module.ts       # 主模块
│   │   └── main.ts             # 入口文件
│   ├── .env.example            # 环境变量示例
│   ├── package.json
│   └── tsconfig.json
│
├── admin/                      # 管理后台 (Vue 3)
│   ├── src/
│   │   ├── api/                # API 接口
│   │   ├── layouts/            # 布局组件
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # 状态管理
│   │   ├── utils/              # 工具函数
│   │   └── views/              # 页面组件
│   ├── .env.development
│   ├── package.json
│   └── vite.config.ts
│
├── patient/                    # 患者端 (Vue 3 移动端)
│   ├── src/
│   │   ├── api/                # API 接口
│   │   ├── layouts/            # 布局组件
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # 状态管理
│   │   ├── utils/              # 工具函数
│   │   └── views/              # 页面组件
│   ├── .env.development
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 环境准备

### 1. 安装 Node.js

#### Windows
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本 (18.x 或更高)
3. 运行安装程序，一路 Next 完成安装
4. 打开命令提示符验证安装：
```bash
node -v    # 应显示 v18.x.x 或更高
npm -v     # 应显示 9.x.x 或更高
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install node@18

# 或下载安装包
# 访问 https://nodejs.org/ 下载 macOS 版本
```

#### Ubuntu/Debian
```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

#### CentOS/RHEL
```bash
# 添加 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# 安装 Node.js
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 2. 安装 pnpm (推荐) 或 yarn

```bash
# 安装 pnpm (推荐，更快更省空间)
npm install -g pnpm

# 或安装 yarn
npm install -g yarn

# 验证安装
pnpm -v
```

### 3. 安装 MySQL 8.0

#### Windows
1. 访问 [MySQL 下载页](https://dev.mysql.com/downloads/mysql/)
2. 下载 MySQL Installer
3. 运行安装程序，选择 "Developer Default"
4. 设置 root 密码（请记住这个密码）
5. 完成安装

#### macOS
```bash
# 使用 Homebrew
brew install mysql@8.0

# 启动 MySQL
brew services start mysql@8.0

# 设置 root 密码
mysql_secure_installation
```

#### Ubuntu/Debian
```bash
# 更新包列表
sudo apt update

# 安装 MySQL
sudo apt install mysql-server-8.0

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置（设置 root 密码）
sudo mysql_secure_installation
```

#### CentOS/RHEL
```bash
# 添加 MySQL 仓库
sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm

# 安装 MySQL
sudo yum install mysql-community-server

# 启动 MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 安全配置
mysql_secure_installation
```

### 4. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE smart_mt_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选，生产环境推荐）
CREATE USER 'smart_mt'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smart_mt_v2.* TO 'smart_mt'@'localhost';
FLUSH PRIVILEGES;

# 退出
exit;
```

### 5. 安装 Git（如果还没有）

#### Windows
访问 [Git 官网](https://git-scm.com/) 下载安装

#### macOS
```bash
brew install git
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/sher1096/smart_mt.git
cd smart_mt
```

### 2. 后端配置与启动

```bash
# 进入后端目录
cd backend

# 安装依赖
pnpm install
# 或 npm install
# 或 yarn install

# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
# 根据你的 MySQL 配置修改以下内容：
# DATABASE_URL="mysql://root:your_password@localhost:3306/smart_mt_v2"
```

编辑 `.env` 文件：
```env
# 数据库配置
DATABASE_URL="mysql://root:your_password@localhost:3306/smart_mt_v2"

# JWT配置（生产环境请修改为随机字符串）
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# 应用配置
PORT=3000
NODE_ENV=development

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 跨域配置
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

继续执行：
```bash
# 生成 Prisma 客户端
npx prisma generate

# 同步数据库结构（创建表）
npx prisma db push

# 初始化示例数据
npx prisma db seed

# 启动开发服务器
pnpm run start:dev
```

后端启动成功后：
- API 服务: http://localhost:3000
- Swagger 文档: http://localhost:3000/api

### 3. 管理后台配置与启动

打开新的终端窗口：

```bash
# 进入管理后台目录
cd admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

管理后台启动成功后访问: http://localhost:5173

### 4. 患者端配置与启动

打开新的终端窗口：

```bash
# 进入患者端目录
cd patient

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

患者端启动成功后访问: http://localhost:5174

## 详细配置

### 后端环境变量说明

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| DATABASE_URL | MySQL 连接字符串 | - | 是 |
| JWT_SECRET | JWT 签名密钥 | - | 是 |
| JWT_EXPIRES_IN | JWT 过期时间 | 2h | 否 |
| JWT_REFRESH_SECRET | 刷新令牌密钥 | - | 是 |
| JWT_REFRESH_EXPIRES_IN | 刷新令牌过期时间 | 7d | 否 |
| PORT | 服务端口 | 3000 | 否 |
| NODE_ENV | 运行环境 | development | 否 |
| UPLOAD_DIR | 文件上传目录 | ./uploads | 否 |
| MAX_FILE_SIZE | 最大文件大小(字节) | 10485760 | 否 |
| CORS_ORIGIN | 允许的跨域来源 | * | 否 |

### 数据库连接字符串格式

```
mysql://用户名:密码@主机:端口/数据库名
```

示例：
```
mysql://root:123456@localhost:3306/smart_mt_v2
mysql://smart_mt:password@127.0.0.1:3306/smart_mt_v2
```

## API 文档

启动后端后访问 Swagger 文档: http://localhost:3000/api

### 主要 API 端点

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | /api/auth | 登录、注册、刷新令牌 |
| 管理员 | /api/admins | 管理员 CRUD |
| 患者 | /api/patients | 患者 CRUD |
| 医生 | /api/doctors | 医生 CRUD |
| 科室 | /api/departments | 科室管理 |
| 排班 | /api/schedules | 排班管理 |
| 挂号 | /api/appointments | 预约挂号 |
| 病历 | /api/medical-records | 病历管理 |
| 处方 | /api/prescriptions | 处方管理 |
| 药品 | /api/medicines | 药品管理 |
| 体检 | /api/examinations | 体检管理 |
| 缴费 | /api/payments | 缴费管理 |
| 消息 | /api/messages | 消息通知 |
| 新闻 | /api/news | 新闻公告 |
| 系统 | /api/system | 系统配置 |
| 文件 | /api/files | 文件上传 |

### API 响应格式

成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

错误响应：
```json
{
  "code": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

分页响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

## 默认账号

系统初始化后包含以下测试账号：

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 系统管理员 |
| 医生 | doctor_zhangming | doctor123 | 张明医生 |
| 医生 | doctor_lihua | doctor123 | 李华医生 |
| 医生 | doctor_wangqiang | doctor123 | 王强医生 |

患者账号需要通过注册创建。

## 部署指南

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

### 使用 PM2 部署后端

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start dist/main.js --name smart-mt-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs smart-mt-backend

# 设置开机自启
pm2 startup
pm2 save
```

### Nginx 配置示例

```nginx
# 后端 API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# 管理后台
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /path/to/smart_mt/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 患者端
server {
    listen 80;
    server_name m.yourdomain.com;
    root /path/to/smart_mt/patient/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker 部署（可选）

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: smart-mt-mysql
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: smart_mt_v2
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smart-mt-backend
    environment:
      DATABASE_URL: mysql://root:your_root_password@mysql:3306/smart_mt_v2
      JWT_SECRET: your-production-secret
      JWT_REFRESH_SECRET: your-refresh-secret
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

启动：
```bash
docker-compose up -d
```

## 常见问题

### 1. 数据库连接失败

**错误**: `Can't connect to MySQL server`

**解决方案**:
- 确认 MySQL 服务已启动
- 检查用户名密码是否正确
- 确认数据库已创建
- 检查防火墙是否阻止了 3306 端口

```bash
# Linux 检查 MySQL 状态
sudo systemctl status mysql

# 启动 MySQL
sudo systemctl start mysql
```

### 2. Prisma 生成失败

**错误**: `prisma generate` 失败

**解决方案**:
```bash
# 清除 node_modules 重新安装
rm -rf node_modules
pnpm install

# 重新生成
npx prisma generate
```

### 3. 端口被占用

**错误**: `Port 3000 is already in use`

**解决方案**:
```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000

# 杀死进程或修改 .env 中的 PORT
```

### 4. 前端无法连接后端

**错误**: `Network Error` 或 `CORS error`

**解决方案**:
- 确认后端已启动
- 检查 `.env` 中的 `CORS_ORIGIN` 配置
- 检查前端 `vite.config.ts` 中的代理配置

### 5. 登录失败

**错误**: 使用默认账号无法登录

**解决方案**:
```bash
# 重新初始化数据
cd backend
npx prisma db push --force-reset
npx prisma db seed
```

## 安全建议

1. **生产环境务必修改默认密钥**
   - 修改 `JWT_SECRET`
   - 修改 `JWT_REFRESH_SECRET`
   - 修改默认管理员密码

2. **数据库安全**
   - 不要使用 root 账户连接生产数据库
   - 创建专用数据库用户并限制权限
   - 定期备份数据库

3. **HTTPS**
   - 生产环境务必使用 HTTPS
   - 配置 SSL 证书

4. **防火墙**
   - 只开放必要端口 (80, 443)
   - 数据库端口不要对外开放

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请提交 [Issue](https://github.com/sher1096/smart_mt/issues)。
