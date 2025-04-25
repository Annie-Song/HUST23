const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const { requestLogger } = require('./middleware/logger');

// 创建Express应用
const app = express();

// 设置字符编码
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// 设置响应头
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 连接数据库
mongoose.connect(config.database.uri, {
  ...config.database.options,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

// 中间件
app.use(requestLogger);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res) => {
    res.set('Content-Type', 'text/html; charset=utf-8');
  }
}));

// API路由
app.use('/api', routes);

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 