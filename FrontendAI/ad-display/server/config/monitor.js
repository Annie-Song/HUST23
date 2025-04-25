const ARMS = require('@alicloud/arms20190808');
const { Config } = require('@alicloud/openapi-client');
const { RuntimeOptions } = require('@alicloud/tea-util');

// ARMS配置
const armsClient = new ARMS(new Config({
    accessKeyId: process.env.ARMS_ACCESS_KEY_ID,
    accessKeySecret: process.env.ARMS_ACCESS_KEY_SECRET,
    endpoint: 'arms.cn-hangzhou.aliyuncs.com'
}));

// 记录性能指标
const recordPerformance = async (metrics) => {
    try {
        const runtime = new RuntimeOptions({});
        await armsClient.createMetricWithOptions({
            project: process.env.ARMS_PROJECT,
            metric: metrics
        }, runtime);
    } catch (error) {
        console.error('记录性能指标失败:', error);
    }
};

// 记录错误
const recordError = async (error) => {
    try {
        const runtime = new RuntimeOptions({});
        await armsClient.createErrorWithOptions({
            project: process.env.ARMS_PROJECT,
            error: {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            }
        }, runtime);
    } catch (err) {
        console.error('记录错误失败:', err);
    }
};

// 记录业务指标
const recordBusinessMetric = async (metricName, value, tags = {}) => {
    try {
        const runtime = new RuntimeOptions({});
        await armsClient.createMetricWithOptions({
            project: process.env.ARMS_PROJECT,
            metric: {
                name: metricName,
                value,
                tags,
                timestamp: new Date().toISOString()
            }
        }, runtime);
    } catch (error) {
        console.error('记录业务指标失败:', error);
    }
};

module.exports = {
    recordPerformance,
    recordError,
    recordBusinessMetric
}; 