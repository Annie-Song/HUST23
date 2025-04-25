# 广告展示系统部署文档

## 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.0
- 阿里云账号（OSS、ARMS服务）
- 支付宝开放平台账号

## 安装步骤

1. 克隆代码库
```bash
git clone https://github.com/your-username/ad-display.git
cd ad-display
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，填写必要的配置信息
```

4. 启动开发服务器
```bash
npm run dev
```

## 生产环境部署

1. 安装PM2
```bash
npm install -g pm2
```

2. 构建前端资源
```bash
npm run build
```

3. 启动生产服务器
```bash
pm2 start server/index.js --name ad-display
```

4. 设置开机自启
```bash
pm2 startup
pm2 save
```

## 配置说明

### 数据库配置
- 创建MongoDB数据库
- 设置数据库连接字符串

### 阿里云OSS配置
1. 创建OSS Bucket
2. 获取AccessKey
3. 配置Bucket权限

### 阿里云ARMS配置
1. 创建ARMS项目
2. 获取AccessKey
3. 配置监控指标

### 支付宝配置
1. 创建应用
2. 配置应用密钥
3. 设置回调地址

## 监控和维护

### 日志查看
```bash
pm2 logs ad-display
```

### 性能监控
- 访问阿里云ARMS控制台
- 查看应用性能指标
- 设置告警规则

### 备份策略
1. 数据库备份
```bash
mongodump --uri="mongodb://localhost:27017/ad-system"
```

2. 文件备份
- 定期备份上传的广告素材
- 使用OSS版本控制功能

## 常见问题

### 文件上传失败
- 检查OSS配置
- 检查文件大小限制
- 检查文件类型限制

### 支付回调失败
- 检查支付宝配置
- 检查服务器网络
- 检查回调地址

### 性能问题
- 检查服务器资源使用
- 检查数据库索引
- 检查缓存配置

## 更新部署

1. 拉取最新代码
```bash
git pull
```

2. 更新依赖
```bash
npm install
```

3. 重启服务
```bash
pm2 restart ad-display
```

## 安全建议

1. 定期更新依赖包
2. 使用HTTPS
3. 设置防火墙规则
4. 定期备份数据
5. 监控异常访问 