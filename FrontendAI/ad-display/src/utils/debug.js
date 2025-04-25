/**
 * ���Թ���ģ��
 * ������չʾ�����еĵ��Ժ���־��¼
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
     * ��¼��־
     * @param {string} message - ��־��Ϣ
     * @param {string} level - ��־����
     * @param {Object} data - ��������
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

        // ������־����
        if (this.logs.length > this.options.maxLogSize) {
            this.logs.shift();
        }

        // ������־�������������̨
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
     * ��ʼ���ܼ�ʱ
     * @param {string} name - ��ʱ������
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
     * �������ܼ�ʱ
     * @param {string} name - ��ʱ������
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
     * ��ȡ����ָ��
     * @returns {Object} ����ָ��
     */
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }

    /**
     * ��ȡ��־��¼
     * @returns {Array} ��־��¼
     */
    getLogs() {
        return this.logs;
    }

    /**
     * �����־��¼
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * �������ָ��
     */
    clearPerformanceMetrics() {
        this.performanceMetrics = {};
    }

    /**
     * ������־
     * @returns {string} JSON��ʽ����־
     */
    exportLogs() {
        return JSON.stringify({
            logs: this.logs,
            performanceMetrics: this.performanceMetrics
        }, null, 2);
    }

    /**
     * ���Ԫ�ؿɼ���
     * @param {HTMLElement} element - Ҫ����Ԫ��
     * @returns {boolean} �Ƿ�ɼ�
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
     * ���Ԫ���Ƿ����ӿ���
     * @param {HTMLElement} element - Ҫ����Ԫ��
     * @returns {boolean} �Ƿ����ӿ���
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
     * ��ȡԪ�صĿ���������Ϣ
     * @param {HTMLElement} element - Ҫ����Ԫ��
     * @returns {Object} ����������Ϣ
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

// �������Թ�����
export default DebugUtils; 