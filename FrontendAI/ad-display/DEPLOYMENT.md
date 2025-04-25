# ���չʾϵͳ�����ĵ�

## ����Ҫ��

- Node.js >= 14.0.0
- MongoDB >= 4.0
- �������˺ţ�OSS��ARMS����
- ֧��������ƽ̨�˺�

## ��װ����

1. ��¡�����
```bash
git clone https://github.com/your-username/ad-display.git
cd ad-display
```

2. ��װ����
```bash
npm install
```

3. ���û�������
```bash
cp .env.example .env
# �༭.env�ļ�����д��Ҫ��������Ϣ
```

4. ��������������
```bash
npm run dev
```

## ������������

1. ��װPM2
```bash
npm install -g pm2
```

2. ����ǰ����Դ
```bash
npm run build
```

3. ��������������
```bash
pm2 start server/index.js --name ad-display
```

4. ���ÿ�������
```bash
pm2 startup
pm2 save
```

## ����˵��

### ���ݿ�����
- ����MongoDB���ݿ�
- �������ݿ������ַ���

### ������OSS����
1. ����OSS Bucket
2. ��ȡAccessKey
3. ����BucketȨ��

### ������ARMS����
1. ����ARMS��Ŀ
2. ��ȡAccessKey
3. ���ü��ָ��

### ֧��������
1. ����Ӧ��
2. ����Ӧ����Կ
3. ���ûص���ַ

## ��غ�ά��

### ��־�鿴
```bash
pm2 logs ad-display
```

### ���ܼ��
- ���ʰ�����ARMS����̨
- �鿴Ӧ������ָ��
- ���ø澯����

### ���ݲ���
1. ���ݿⱸ��
```bash
mongodump --uri="mongodb://localhost:27017/ad-system"
```

2. �ļ�����
- ���ڱ����ϴ��Ĺ���ز�
- ʹ��OSS�汾���ƹ���

## ��������

### �ļ��ϴ�ʧ��
- ���OSS����
- ����ļ���С����
- ����ļ���������

### ֧���ص�ʧ��
- ���֧��������
- ������������
- ���ص���ַ

### ��������
- ����������Դʹ��
- ������ݿ�����
- ��黺������

## ���²���

1. ��ȡ���´���
```bash
git pull
```

2. ��������
```bash
npm install
```

3. ��������
```bash
pm2 restart ad-display
```

## ��ȫ����

1. ���ڸ���������
2. ʹ��HTTPS
3. ���÷���ǽ����
4. ���ڱ�������
5. ����쳣���� 