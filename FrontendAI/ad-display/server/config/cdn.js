const OSS = require('ali-oss');
const path = require('path');

// 阿里云OSS配置
const ossClient = new OSS({
    region: process.env.OSS_REGION || 'oss-cn-hangzhou',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET || 'ad-display'
});

// 上传文件到OSS
const uploadToOSS = async (file, folder = 'ads') => {
    try {
        const fileName = `${folder}/${Date.now()}${path.extname(file.originalname)}`;
        const result = await ossClient.put(fileName, file.buffer);
        return result.url;
    } catch (error) {
        console.error('上传文件到OSS失败:', error);
        throw error;
    }
};

// 删除OSS文件
const deleteFromOSS = async (url) => {
    try {
        const fileName = url.split('/').pop();
        await ossClient.delete(fileName);
    } catch (error) {
        console.error('删除OSS文件失败:', error);
        throw error;
    }
};

// 获取文件URL
const getFileUrl = (fileName) => {
    return `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com/${fileName}`;
};

module.exports = {
    uploadToOSS,
    deleteFromOSS,
    getFileUrl
}; 