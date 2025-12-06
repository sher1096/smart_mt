# 系统管理模块示例数据

## 导航示例数据

```json
// 创建首页导航
POST /system/navigations
{
  "name": "首页",
  "icon": "el-icon-s-home",
  "path": "/home",
  "sort": 1,
  "status": 1
}

// 创建医生列表导航
POST /system/navigations
{
  "name": "医生团队",
  "icon": "el-icon-user",
  "path": "/doctors",
  "sort": 2,
  "status": 1
}

// 创建科室导航
POST /system/navigations
{
  "name": "科室介绍",
  "icon": "el-icon-office-building",
  "path": "/departments",
  "sort": 3,
  "status": 1
}

// 创建预约挂号导航
POST /system/navigations
{
  "name": "预约挂号",
  "icon": "el-icon-date",
  "path": "/appointment",
  "sort": 4,
  "status": 1
}

// 创建个人中心导航
POST /system/navigations
{
  "name": "个人中心",
  "icon": "el-icon-user",
  "path": "/profile",
  "sort": 5,
  "status": 1
}
```

## 系统配置示例数据

```json
// 医院名称
POST /system/configs
{
  "key": "hospital_name",
  "value": "智慧医疗系统",
  "name": "医院名称",
  "type": "text"
}

// 联系电话
POST /system/configs
{
  "key": "contact_phone",
  "value": "400-123-4567",
  "name": "联系电话",
  "type": "text"
}

// 医院地址
POST /system/configs
{
  "key": "hospital_address",
  "value": "深圳市南山区科技园南区",
  "name": "医院地址",
  "type": "text"
}

// 工作时间
POST /system/configs
{
  "key": "work_time",
  "value": "周一至周日 08:00-18:00",
  "name": "工作时间",
  "type": "text"
}

// 医院简介
POST /system/configs
{
  "key": "hospital_intro",
  "value": "智慧医疗系统是一家集医疗、教学、科研为一体的现代化综合性医院...",
  "name": "医院简介",
  "type": "textarea"
}

// Logo图片URL
POST /system/configs
{
  "key": "logo_url",
  "value": "https://example.com/logo.png",
  "name": "Logo图片",
  "type": "image"
}

// 备案号
POST /system/configs
{
  "key": "icp_number",
  "value": "粤ICP备12345678号",
  "name": "备案号",
  "type": "text"
}

// 客服邮箱
POST /system/configs
{
  "key": "service_email",
  "value": "service@hospital.com",
  "name": "客服邮箱",
  "type": "text"
}
```

## 页面内容示例数据

```json
// 关于我们
POST /system/page-contents
{
  "code": "about_us",
  "title": "关于我们",
  "content": "<h1>关于我们</h1><p>智慧医疗系统成立于2020年，是一家专注于提供优质医疗服务的现代化医院。</p><h2>我们的使命</h2><p>为患者提供最优质的医疗服务，关注患者健康...</p>"
}

// 服务协议
POST /system/page-contents
{
  "code": "service_agreement",
  "title": "服务协议",
  "content": "<h1>服务协议</h1><h2>一、服务条款的确认和接受</h2><p>本协议是您与智慧医疗系统之间关于使用本系统服务的协议...</p>"
}

// 隐私政策
POST /system/page-contents
{
  "code": "privacy_policy",
  "title": "隐私政策",
  "content": "<h1>隐私政策</h1><p>智慧医疗系统（以下简称"我们"）非常重视您的隐私保护...</p>"
}

// 常见问题
POST /system/page-contents
{
  "code": "faq",
  "title": "常见问题",
  "content": "<h1>常见问题</h1><h2>Q: 如何预约挂号？</h2><p>A: 您可以通过本系统在线预约...</p><h2>Q: 如何取消预约？</h2><p>A: 在个人中心的预约记录中可以取消...</p>"
}

// 联系我们
POST /system/page-contents
{
  "code": "contact_us",
  "title": "联系我们",
  "content": "<h1>联系我们</h1><p><strong>地址：</strong>深圳市南山区科技园南区</p><p><strong>电话：</strong>400-123-4567</p><p><strong>邮箱：</strong>service@hospital.com</p>"
}

// 医院介绍
POST /system/page-contents
{
  "code": "hospital_intro",
  "title": "医院介绍",
  "content": "<h1>医院介绍</h1><p>智慧医疗系统拥有先进的医疗设备和经验丰富的医疗团队...</p>"
}
```

## 诊前须知示例数据

```json
// 预约前准备
POST /system/diagnosis-guides
{
  "title": "预约前准备",
  "content": "1. 请提前准备好身份证、医保卡等证件\n2. 如有既往病历，请一并携带\n3. 建议提前15分钟到达医院",
  "sort": 1,
  "status": 1
}

// 就诊须知
POST /system/diagnosis-guides
{
  "title": "就诊须知",
  "content": "1. 请按预约时间准时就诊\n2. 如需取消预约，请提前24小时操作\n3. 就诊时请配合医生如实告知病情",
  "sort": 2,
  "status": 1
}

// 检查注意事项
POST /system/diagnosis-guides
{
  "title": "检查注意事项",
  "content": "1. 抽血检查需空腹8-12小时\n2. B超检查请提前憋尿\n3. CT检查前请摘除身上金属物品",
  "sort": 3,
  "status": 1
}

// 取药流程
POST /system/diagnosis-guides
{
  "title": "取药流程",
  "content": "1. 就诊结束后请到收费处缴费\n2. 凭缴费单到药房取药\n3. 取药时请仔细核对药品信息",
  "sort": 4,
  "status": 1
}

// 医保使用说明
POST /system/diagnosis-guides
{
  "title": "医保使用说明",
  "content": "1. 就诊时请出示医保卡\n2. 部分项目需自费，请注意区分\n3. 医保报销比例请咨询医保办",
  "sort": 5,
  "status": 1
}

// 复诊提醒
POST /system/diagnosis-guides
{
  "title": "复诊提醒",
  "content": "1. 请按医生要求的时间复诊\n2. 复诊时请携带上次检查报告\n3. 如有特殊情况请及时联系医生",
  "sort": 6,
  "status": 1
}
```

## 前端调用示例

### 获取导航列表
```javascript
// GET /system/navigations/public
fetch('/system/navigations/public')
  .then(res => res.json())
  .then(data => {
    // data: [{ id: 1, name: "首页", icon: "el-icon-s-home", path: "/home", ... }]
    console.log('导航列表:', data);
  });
```

### 获取系统配置
```javascript
// GET /system/configs/public
fetch('/system/configs/public')
  .then(res => res.json())
  .then(config => {
    // config: { hospital_name: "智慧医疗系统", contact_phone: "400-123-4567", ... }
    console.log('医院名称:', config.hospital_name);
    console.log('联系电话:', config.contact_phone);
  });
```

### 获取单个配置
```javascript
// GET /system/configs/key/hospital_name
fetch('/system/configs/key/hospital_name')
  .then(res => res.json())
  .then(data => {
    // data: { id: 1, key: "hospital_name", value: "智慧医疗系统", ... }
    console.log('医院名称:', data.value);
  });
```

### 获取页面内容
```javascript
// GET /system/page-contents/code/about_us
fetch('/system/page-contents/code/about_us')
  .then(res => res.json())
  .then(page => {
    // page: { id: 1, code: "about_us", title: "关于我们", content: "<h1>...</h1>", ... }
    document.getElementById('page-title').innerText = page.title;
    document.getElementById('page-content').innerHTML = page.content;
  });
```

### 获取诊前须知
```javascript
// GET /system/diagnosis-guides/public
fetch('/system/diagnosis-guides/public')
  .then(res => res.json())
  .then(guides => {
    // guides: [{ id: 1, title: "预约前准备", content: "...", sort: 1 }]
    guides.forEach(guide => {
      console.log(`${guide.title}: ${guide.content}`);
    });
  });
```

## 管理端操作示例

### 更新导航状态
```javascript
// PATCH /system/navigations/:id
fetch('/system/navigations/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    status: 0  // 禁用导航
  })
});
```

### 更新系统配置
```javascript
// PATCH /system/configs/:id
fetch('/system/configs/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    value: "新的医院名称"
  })
});
```

### 更新页面内容
```javascript
// PATCH /system/page-contents/:id
fetch('/system/page-contents/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    title: "更新后的标题",
    content: "<h1>更新后的内容</h1>"
  })
});
```

### 删除诊前须知
```javascript
// DELETE /system/diagnosis-guides/:id
fetch('/system/diagnosis-guides/1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```
