const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const { requestLogger } = require('./middleware/logger');

// ����ExpressӦ��
const app = express();

// �����ַ�����
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// ������Ӧͷ
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// �������ݿ�
mongoose.connect(config.database.uri, {
  ...config.database.options,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('���ݿ����ӳɹ�'))
  .catch(err => console.error('���ݿ�����ʧ��:', err));

// �м��
app.use(requestLogger);

// ��̬�ļ�����
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res) => {
    res.set('Content-Type', 'text/html; charset=utf-8');
  }
}));

// API·��
app.use('/api', routes);

// ������
app.use(notFoundHandler);
app.use(errorHandler);

// ����������
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`������������ http://localhost:${PORT}`);
}); 