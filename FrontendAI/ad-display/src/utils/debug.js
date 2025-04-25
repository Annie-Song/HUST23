/**
 * 调试工具模块
 * 负责广告展示过程中的调试和日志记录
 */

class DebugUtils {
    constructor(options = {}) {
        this.options = {
            enabled: false,
            logLevel: 'info',
            maxLogSize: 1000,
            ...options
        };

        this.logs = [];
        this.performanceMetrics = {};
    }

    /**
     * 记录日志
     * @param {string} message - 日志消息
     * @param {string} level - 日志级别
     * @param {Object} data - 附加数据
     */
    log(message, level = 'info', data = {}) {
        if (!this.options.enabled) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        this.logs.push(logEntry);

        // 限制日志数量
        if (this.logs.length > this.options.maxLogSize) {
            this.logs.shift();
        }

        // 根据日志级别输出到控制台
        switch (level) {
            case 'error':
                console.error(`[${timestamp}] ${message}`, data);
                break;
            case 'warn':
                console.warn(`[${timestamp}] ${message}`, data);
                break;
            case 'debug':
                console.debug(`[${timestamp}] ${message}`, data);
                break;
            default:
                console.log(`[${timestamp}] ${message}`, data);
        }
    }

    /**
     * 开始性能计时
     * @param {string} name - 计时器名称
     */
    startTimer(name) {
        if (!this.options.enabled) return;

        this.performanceMetrics[name] = {
            start: performance.now(),
            end: null,
            duration: null
        };
    }

    /**
     * 结束性能计时
     * @param {string} name - 计时器名称
     */
    endTimer(name) {
        if (!this.options.enabled || !this.performanceMetrics[name]) return;

        const metric = this.performanceMetrics[name];
        metric.end = performance.now();
        metric.duration = metric.end - metric.start;

        this.log(`Performance metric: ${name}`, 'debug', {
            duration: metric.duration
        });
    }

    /**
     * 获取性能指标
     * @returns {Object} 性能指标
     */
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }

    /**
     * 获取日志记录
     * @returns {Array} 日志记录
     */
    getLogs() {
        return this.logs;
    }

    /**
     * 清除日志记录
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * 清除性能指标
     */
    clearPerformanceMetrics() {
        this.performanceMetrics = {};
    }

    /**
     * 导出日志
     * @returns {string} JSON格式的日志
     */
    exportLogs() {
        return JSON.stringify({
            logs: this.logs,
            performanceMetrics: this.performanceMetrics
        }, null, 2);
    }

    /**
     * 检查元素可见性
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否可见
     */
    isElementVisible(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= viewportHeight &&
            rect.right <= viewportWidth
        );
    }

    /**
     * 检查元素是否在视口中
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否在视口中
     */
    isElementInViewport(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
    }

    /**
     * 获取元素的可视区域信息
     * @param {HTMLElement} element - 要检查的元素
     * @returns {Object} 可视区域信息
     */
    getElementVisibilityInfo(element) {
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        return {
            isVisible: this.isElementVisible(element),
            isInViewport: this.isElementInViewport(element),
            viewportPercentage: {
                width: Math.min(100, (rect.width / viewportWidth) * 100),
                height: Math.min(100, (rect.height / viewportHeight) * 100)
            },
            position: {
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right
            }
        };
    }
}

// 导出调试工具类
export default DebugUtils; 