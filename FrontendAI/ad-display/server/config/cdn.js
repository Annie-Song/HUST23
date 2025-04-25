const OSS = require('ali-oss');
const path = require('path');

// ������OSS����
const ossClient = new OSS({
    region: process.env.OSS_REGION || 'oss-cn-hangzhou',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET || 'ad-display'
});

// �ϴ��ļ���OSS
const uploadToOSS = async (file, folder = 'ads') => {
    try {
        const fileName = `${folder}/${Date.now()}${path.extname(file.originalname)}`;
        const result = await ossClient.put(fileName, file.buffer);
        return result.url;
    } catch (error) {
        console.error('�ϴ��ļ���OSSʧ��:', error);
        throw error;
    }
};

// ɾ��OSS�ļ�
const deleteFromOSS = async (url) => {
    try {
        const fileName = url.split('/').pop();
        await ossClient.delete(fileName);
    } catch (error) {
        console.error('ɾ��OSS�ļ�ʧ��:', error);
        throw error;
    }
};

// ��ȡ�ļ�URL
const getFileUrl = (fileName) => {
    return `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com/${fileName}`;
};

module.exports = {
    uploadToOSS,
    deleteFromOSS,
    getFileUrl
}; 