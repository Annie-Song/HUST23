const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { authenticate } = require('./middleware/auth');
const { recordError } = require('./config/monitor');

// 导入路由
const authRoutes = require('./api/auth');
const adRoutes = require('./api/index');
const paymentRoutes = require('./api/payment');
const materialRoutes = require('./api/material');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ad-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('数据库连接成功'))
.catch(err => console.error('数据库连接失败:', err));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api', authenticate, adRoutes);
app.use('/api/payment', authenticate, paymentRoutes);
app.use('/api/material', authenticate, materialRoutes);

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    // 记录错误到监控系统
    recordError(err);
    res.status(500).json({ success: false, error: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 