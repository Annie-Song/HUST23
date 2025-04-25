const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { authenticate } = require('./middleware/auth');
const { recordError } = require('./config/monitor');

// ����·��
const authRoutes = require('./api/auth');
const adRoutes = require('./api/index');
const paymentRoutes = require('./api/payment');
const materialRoutes = require('./api/material');

// ����ExpressӦ��
const app = express();

// �м��
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// �������ݿ�
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ad-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('���ݿ����ӳɹ�'))
.catch(err => console.error('���ݿ�����ʧ��:', err));

// ·��
app.use('/api/auth', authRoutes);
app.use('/api', authenticate, adRoutes);
app.use('/api/payment', authenticate, paymentRoutes);
app.use('/api/material', authenticate, materialRoutes);

// ������
app.use((err, req, res, next) => {
    console.error(err.stack);
    // ��¼���󵽼��ϵͳ
    recordError(err);
    res.status(500).json({ success: false, error: '�������ڲ�����' });
});

// ����������
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`�����������ڶ˿� ${PORT}`);
}); 