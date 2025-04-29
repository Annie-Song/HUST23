# 互联网广告平台后端

本项目是基于Node.js和Express框架的互联网广告平台后端服务，提供广告管理、支付充值、统计分析等功能。

## 重要说明

目前项目仅使用Node.js和Express框架。

## 功能特性

- 广告购买和审核
- 广告充值（模拟支付）
- 浏览充值历史
- 广告客户管理购买的广告
- 浏览和查询广告展示情况
- 提供各种前台广告使用接口
- 开具发票

## 技术栈

- Node.js
- Express
- MongoDB (Mongoose)
- JWT认证
- 多种支付方式集成（支付宝、微信支付）

## 安装和运行

### 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后根据需要修改配置：

```bash
cp .env.example .env
```

### 启动服务

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

## API文档

### 用户认证

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/logout` - 用户退出
- `GET /api/v1/auth/me` - 获取当前用户信息

### 广告管理

- `GET /api/v1/ads` - 获取广告列表
- `GET /api/v1/ads/:id` - 获取单个广告
- `POST /api/v1/ads` - 创建广告
- `PUT /api/v1/ads/:id` - 更新广告
- `DELETE /api/v1/ads/:id` - 删除广告
- `POST /api/v1/ads/:id/media` - 上传广告媒体文件
- `PUT /api/v1/ads/:id/review` - 提交广告审核
- `PUT /api/v1/ads/:id/pause` - 暂停广告
- `PUT /api/v1/ads/:id/resume` - 恢复广告

### 支付管理

- `GET /api/v1/payments` - 获取支付列表
- `GET /api/v1/payments/:id` - 获取单个支付
- `POST /api/v1/payments` - 创建支付
- `GET /api/v1/payments/history` - 获取支付历史
- `POST /api/v1/payments/auto-recharge` - 设置自动充值

### 发票管理

- `GET /api/v1/invoices` - 获取发票列表
- `GET /api/v1/invoices/:id` - 获取单个发票
- `POST /api/v1/invoices` - 申请发票
- `PUT /api/v1/invoices/:id` - 更新发票
- `DELETE /api/v1/invoices/:id` - 取消发票
- `GET /api/v1/invoices/:id/download` - 下载发票
- `PUT /api/v1/invoices/:id/status` - 更新发票状态(管理员)

### 统计分析

- `GET /api/v1/stats/ads/:id` - 获取广告统计
- `GET /api/v1/stats/overall` - 获取整体统计
- `POST /api/v1/stats/custom-report` - 生成自定义报表

### 广告API（供前台使用）

- `GET /api/v1/api/ads` - 获取广告内容
- `POST /api/v1/api/track/impression/:adId` - 记录广告展示
- `POST /api/v1/api/track/click/:adId` - 记录广告点击
- `GET /api/v1/api/keys` - 获取API密钥
- `POST /api/v1/api/keys/regenerate` - 重新生成API密钥
- `GET /api/v1/api/stats` - 获取API使用统计

## 项目结构

```
backend/
├── src/                 # 源代码
│   ├── app.js           # 应用入口
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── middlewares/     # 中间件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑
│   └── utils/           # 工具函数
├── uploads/             # 上传文件目录
├── logs/                # 日志文件
├── tests/               # 测试文件
├── .env.example         # 环境变量示例
├── package.json         # 项目依赖
└── README.md            # 项目说明
```

## 开发指南

### 代码风格

本项目使用ESLint进行代码风格检查，确保代码提交前通过检查：

```bash
npm run lint
```

### 测试

运行测试：

```bash
npm test
```

## 生产部署

推荐使用Docker进行部署，项目包含了`Dockerfile`和`docker-compose.yml`文件：

```bash
docker-compose up -d
```


