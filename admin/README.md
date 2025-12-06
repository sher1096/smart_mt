# 智慧医疗管理后台

基于 Vue 3 + TypeScript + Vite + Naive UI 构建的智慧医疗管理后台系统。

## 技术栈

- **框架**: Vue 3
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios

## 功能模块

- 登录认证
- 仪表盘
- 科室管理
- 医生管理
- 排班管理
- 挂号管理
- 病历管理
- 处方管理
- 药品管理
- 体检管理
- 缴费管理
- 消息管理
- 新闻管理
- 系统设置

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:5173

### 生产环境构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
admin/
├── src/
│   ├── api/              # API 接口
│   ├── layouts/          # 布局组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

## 开发说明

### 路由守卫

系统实现了路由守卫，未登录用户访问需要认证的页面会自动跳转到登录页。

### API 请求

所有 API 请求都会自动添加 Bearer token，token 存储在 localStorage 中。

### 状态管理

使用 Pinia 进行状态管理，用户信息和 token 存储在 user store 中。

## 环境配置

开发环境配置文件: `.env.development`
生产环境配置文件: `.env.production`

## 注意事项

- API 代理配置在 `vite.config.ts` 中，默认代理到 `http://localhost:3000`
- 所有组件使用 Composition API + setup 语法糖
- 使用中文界面
