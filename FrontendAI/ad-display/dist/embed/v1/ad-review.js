class AdReview {
    constructor(options) {
        this.apiEndpoint = options.apiEndpoint || '/api/review';
        this.adId = options.adId;
        this.contentRules = options.contentRules || {};
        this.init();
    }

    init() {
        // 初始化内容检查规则
        this.setupContentRules();
    }

    setupContentRules() {
        // 默认内容规则
        this.contentRules = {
            sensitiveWords: this.contentRules.sensitiveWords || [],
            imageRules: this.contentRules.imageRules || {
                minWidth: 300,
                minHeight: 250,
                maxFileSize: 1024 * 1024, // 1MB
                allowedFormats: ['jpg', 'jpeg', 'png', 'gif']
            },
            videoRules: this.contentRules.videoRules || {
                minDuration: 5,
                maxDuration: 30,
                maxFileSize: 10 * 1024 * 1024, // 10MB
                allowedFormats: ['mp4', 'webm']
            }
        };
    }

    // 检查文本内容
    checkTextContent(text) {
        // 检查敏感词
        if (this.contentRules.sensitiveWords.length > 0) {
            const hasSensitiveWord = this.contentRules.sensitiveWords.some(word => 
                text.toLowerCase().includes(word.toLowerCase())
            );
            if (hasSensitiveWord) {
                return {
                    passed: false,
                    reason: '包含敏感词'
                };
            }
        }

        return {
            passed: true
        };
    }

    // 检查图片内容
    async checkImageContent(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // 检查文件大小
            if (blob.size > this.contentRules.imageRules.maxFileSize) {
                return {
                    passed: false,
                    reason: '图片文件过大'
                };
            }

            // 检查文件格式
            const fileExtension = imageUrl.split('.').pop().toLowerCase();
            if (!this.contentRules.imageRules.allowedFormats.includes(fileExtension)) {
                return {
                    passed: false,
                    reason: '不支持的图片格式'
                };
            }

            // 检查图片尺寸
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            if (img.width < this.contentRules.imageRules.minWidth ||
                img.height < this.contentRules.imageRules.minHeight) {
                return {
                    passed: false,
                    reason: '图片尺寸过小'
                };
            }

            return {
                passed: true
            };
        } catch (error) {
            return {
                passed: false,
                reason: '图片加载失败'
            };
        }
    }

    // 检查视频内容
    async checkVideoContent(videoUrl) {
        try {
            const response = await fetch(videoUrl, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            
            // 检查文件大小
            if (parseInt(contentLength) > this.contentRules.videoRules.maxFileSize) {
                return {
                    passed: false,
                    reason: '视频文件过大'
                };
            }

            // 检查文件格式
            const fileExtension = videoUrl.split('.').pop().toLowerCase();
            if (!this.contentRules.videoRules.allowedFormats.includes(fileExtension)) {
                return {
                    passed: false,
                    reason: '不支持的视频格式'
                };
            }

            // 检查视频时长
            const video = document.createElement('video');
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = reject;
                video.src = videoUrl;
            });

            if (video.duration < this.contentRules.videoRules.minDuration ||
                video.duration > this.contentRules.videoRules.maxDuration) {
                return {
                    passed: false,
                    reason: '视频时长不符合要求'
                };
            }

            return {
                passed: true
            };
        } catch (error) {
            return {
                passed: false,
                reason: '视频加载失败'
            };
        }
    }

    // 提交审核
    async submitReview(adContent) {
        try {
            const textCheck = this.checkTextContent(adContent.title + ' ' + adContent.description);
            if (!textCheck.passed) {
                return textCheck;
            }

            if (adContent.imageUrl) {
                const imageCheck = await this.checkImageContent(adContent.imageUrl);
                if (!imageCheck.passed) {
                    return imageCheck;
                }
            }

            if (adContent.videoUrl) {
                const videoCheck = await this.checkVideoContent(adContent.videoUrl);
                if (!videoCheck.passed) {
                    return videoCheck;
                }
            }

            // 提交到服务器进行最终审核
            const response = await fetch(`${this.apiEndpoint}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    adId: this.adId,
                    content: adContent
                })
            });

            return await response.json();
        } catch (error) {
            return {
                passed: false,
                reason: '审核提交失败'
            };
        }
    }

    // 获取审核状态
    async getReviewStatus() {
        try {
            const response = await fetch(`${this.apiEndpoint}/status?adId=${this.adId}`);
            return await response.json();
        } catch (error) {
            return {
                status: 'error',
                message: '获取审核状态失败'
            };
        }
    }
}

export default AdReview; 