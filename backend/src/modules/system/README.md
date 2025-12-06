# 系统管理模块 (System Module)

## 概述

系统管理模块提供了系统配置相关的功能，包括导航管理、系统配置、页面内容管理和诊前须知管理。

## 功能特性

### 1. 导航管理
- 创建/更新/删除导航
- 管理员查看所有导航
- 公开接口获取已启用的导航列表（按sort排序）

### 2. 系统配置
- 创建/更新/删除系统配置
- 支持不同类型的配置（text, textarea, image等）
- 管理员查看所有配置
- 公开接口获取配置（键值对格式）
- 支持按key查询单个配置

### 3. 页面内容管理
- 管理静态页面内容（如关于我们、服务协议等）
- 创建/更新/删除页面内容
- 管理员查看所有页面
- 公开接口按code获取页面内容

### 4. 诊前须知管理
- 创建/更新/删除诊前须知
- 管理员查看所有须知
- 公开接口获取已启用的须知列表（按sort排序）

## API 端点

### 导航管理

#### 管理员接口
- `POST /system/navigations` - 创建导航
- `GET /system/navigations` - 获取所有导航
- `GET /system/navigations/:id` - 获取单个导航
- `PATCH /system/navigations/:id` - 更新导航
- `DELETE /system/navigations/:id` - 删除导航

#### 公开接口
- `GET /system/navigations/public` - 获取前端导航列表（仅启用状态）

### 系统配置

#### 管理员接口
- `POST /system/configs` - 创建系统配置
- `GET /system/configs` - 获取所有配置
- `GET /system/configs/:id` - 获取单个配置
- `PATCH /system/configs/:id` - 更新配置
- `DELETE /system/configs/:id` - 删除配置

#### 公开接口
- `GET /system/configs/public` - 获取所有配置（键值对格式）
- `GET /system/configs/key/:key` - 根据key获取配置

### 页面内容

#### 管理员接口
- `POST /system/page-contents` - 创建页面内容
- `GET /system/page-contents` - 获取所有页面内容
- `GET /system/page-contents/:id` - 获取单个页面内容
- `PATCH /system/page-contents/:id` - 更新页面内容
- `DELETE /system/page-contents/:id` - 删除页面内容

#### 公开接口
- `GET /system/page-contents/code/:code` - 根据code获取页面内容

### 诊前须知

#### 管理员接口
- `POST /system/diagnosis-guides` - 创建诊前须知
- `GET /system/diagnosis-guides` - 获取所有诊前须知
- `GET /system/diagnosis-guides/:id` - 获取单个诊前须知
- `PATCH /system/diagnosis-guides/:id` - 更新诊前须知
- `DELETE /system/diagnosis-guides/:id` - 删除诊前须知

#### 公开接口
- `GET /system/diagnosis-guides/public` - 获取诊前须知列表（仅启用状态）

## 数据模型

### Navigation（导航）
```typescript
{
  id: number;
  name: string;      // 导航名称
  icon?: string;     // 图标
  path: string;      // 路径
  sort: number;      // 排序
  status: number;    // 状态：0-禁用，1-启用
  createdAt: Date;
  updatedAt: Date;
}
```

### SystemConfig（系统配置）
```typescript
{
  id: number;
  key: string;       // 配置键（唯一）
  value: string;     // 配置值
  name: string;      // 配置名称
  type: string;      // 配置类型：text, textarea, image等
  createdAt: Date;
  updatedAt: Date;
}
```

### PageContent（页面内容）
```typescript
{
  id: number;
  code: string;      // 页面代码（唯一）
  title: string;     // 页面标题
  content: string;   // 页面内容
  createdAt: Date;
  updatedAt: Date;
}
```

### DiagnosisGuide（诊前须知）
```typescript
{
  id: number;
  title: string;     // 标题
  content: string;   // 内容
  sort: number;      // 排序
  status: number;    // 状态：0-禁用，1-启用
  createdAt: Date;
  updatedAt: Date;
}
```

## 使用示例

### 1. 创建导航
```bash
POST /system/navigations
{
  "name": "首页",
  "icon": "icon-home",
  "path": "/home",
  "sort": 1,
  "status": 1
}
```

### 2. 创建系统配置
```bash
POST /system/configs
{
  "key": "hospital_name",
  "value": "智慧医疗系统",
  "name": "医院名称",
  "type": "text"
}
```

### 3. 创建页面内容
```bash
POST /system/page-contents
{
  "code": "about_us",
  "title": "关于我们",
  "content": "这是关于我们的详细内容..."
}
```

### 4. 创建诊前须知
```bash
POST /system/diagnosis-guides
{
  "title": "预约前准备",
  "content": "请携带身份证、医保卡等相关证件...",
  "sort": 1,
  "status": 1
}
```

### 5. 获取系统配置（前端）
```bash
GET /system/configs/public

Response:
{
  "hospital_name": "智慧医疗系统",
  "contact_phone": "400-123-4567",
  "address": "深圳市南山区..."
}
```

### 6. 获取页面内容（前端）
```bash
GET /system/page-contents/code/about_us

Response:
{
  "id": 1,
  "code": "about_us",
  "title": "关于我们",
  "content": "这是关于我们的详细内容...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 权限说明

- **管理员权限** (`@Roles(UserType.ADMIN)`): 所有CRUD操作
- **公开接口** (`@Public()`):
  - 导航列表（仅显示启用状态）
  - 系统配置（所有配置）
  - 页面内容（按code查询）
  - 诊前须知列表（仅显示启用状态）

## 注意事项

1. 公开接口只返回状态为启用(status=1)的数据（导航和诊前须知）
2. 导航和诊前须知会按sort字段升序排序
3. 系统配置的key和页面内容的code必须唯一
4. 系统配置的公开接口返回键值对格式，方便前端使用
5. 页面内容支持富文本，可存储HTML内容

## 集成到主应用

在 `app.module.ts` 中导入此模块：

```typescript
import { SystemModule } from './modules/system/system.module';

@Module({
  imports: [
    // ... other modules
    SystemModule,
  ],
})
export class AppModule {}
```

## Swagger文档

启动应用后，访问 `/api` 查看完整的API文档。所有接口都在 "系统管理" 标签下。
