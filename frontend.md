FrontendAI/
├── server/                           # 后端服务目录
│   ├── config/                       # 配置文件目录
│   │   └── index.js                  # 主配置文件
│   ├── controllers/                  # 控制器目录
│   │   ├── ad.js                     # 广告控制器
│   │   ├── analytics.js              # 数据分析控制器
│   │   └── user.js                   # 用户控制器
│   ├── middleware/                   # 中间件目录
│   │   ├── auth.js                   # 认证中间件
│   │   ├── error.js                  # 错误处理中间件
│   │   ├── logger.js                 # 日志中间件
│   │   ├── rate-limit.js             # 速率限制中间件
│   │   ├── upload.js                 # 文件上传中间件
│   │   └── validation.js             # 请求验证中间件
│   ├── models/                       # 数据模型目录
│   │   ├── index.js                  # 模型索引文件
│   │   └── user.js                   # 用户模型
│   ├── routes/                       # 路由目录
│   │   └── index.js                  # 路由配置文件
│   ├── utils/                        # 工具函数目录
│   │   ├── errors.js                 # 错误类型定义
│   │   └── redis.js                  # Redis客户端
│   └── index.js                      # 服务器入口文件
├── ad-display/                       # 广告展示模块
│   ├── dist/                         # 构建输出目录
│   ├── examples/                     # 示例代码
│   ├── src/                          # 源代码目录
│   └── package.json                  # 模块配置
├── admin/                           # 管理后台模块
│   ├── review/                      # 审核管理
│   ├── operations/                  # 运营管理
│   └── system/                      # 系统管理
├── client/                          # 客户端模块
│   ├── finance/                     # 财务管理
│   ├── ads/                         # 广告管理
│   └── dashboard/                   # 数据面板
├── common/                          # 公共资源
│   └── css/                         # 公共样式
├── .env                            # 环境变量配置
├── package.json                    # 项目配置文件
└── vite.config.js                  # Vite配置文件
```

核心文件说明：

1. **服务器入口文件** (`server/index.js`)
   - 初始化 Express 应用
   - 配置中间件
   - 连接数据库
   - 注册路由
   - 启动服务器

2. **配置文件** (`server/config/index.js`)
   - 服务器配置
   - 数据库配置
   - JWT配置
   - 文件上传配置
   - 日志配置

3. **数据模型** (`server/models/index.js`)
   - 广告模型 (Ad)
   - 数据分析模型 (Analytics)
   - 广告策略模型 (Strategy)
   - 审核模型 (Review)
   - 用户模型 (User)

4. **控制器** (`server/controllers/`)
   - `ad.js`: 广告管理相关接口
   - `analytics.js`: 数据分析相关接口
   - `user.js`: 用户管理相关接口

5. **中间件** (`server/middleware/`)
   - `auth.js`: 用户认证和授权
   - `error.js`: 统一错误处理
   - `logger.js`: 请求日志记录
   - `rate-limit.js`: 请求速率限制
   - `upload.js`: 文件上传处理
   - `validation.js`: 请求数据验证

6. **工具函数** (`server/utils/`)
   - `errors.js`: 自定义错误类型
   - `redis.js`: Redis客户端配置

7. **前端配置** (`vite.config.js`)
   - 开发服务器配置
   - 构建配置
   - 路径别名
   - 代理设置

8. **环境配置** (`.env`)
   - 服务器端口
   - 数据库连接
   - JWT密钥
   - Redis配置
   - 文件上传限制

这个结构遵循了模块化和关注点分离的原则，便于维护和扩展。每个模块都有其特定的职责，通过清晰的接口进行交互。
