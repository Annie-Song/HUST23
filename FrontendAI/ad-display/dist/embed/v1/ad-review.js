class AdReview {
    constructor(options) {
        this.apiEndpoint = options.apiEndpoint || '/api/review';
        this.adId = options.adId;
        this.contentRules = options.contentRules || {};
        this.init();
    }

    init() {
        // ��ʼ�����ݼ�����
        this.setupContentRules();
    }

    setupContentRules() {
        // Ĭ�����ݹ���
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

    // ����ı�����
    checkTextContent(text) {
        // ������д�
        if (this.contentRules.sensitiveWords.length > 0) {
            const hasSensitiveWord = this.contentRules.sensitiveWords.some(word => 
                text.toLowerCase().includes(word.toLowerCase())
            );
            if (hasSensitiveWord) {
                return {
                    passed: false,
                    reason: '�������д�'
                };
            }
        }

        return {
            passed: true
        };
    }

    // ���ͼƬ����
    async checkImageContent(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // ����ļ���С
            if (blob.size > this.contentRules.imageRules.maxFileSize) {
                return {
                    passed: false,
                    reason: 'ͼƬ�ļ�����'
                };
            }

            // ����ļ���ʽ
            const fileExtension = imageUrl.split('.').pop().toLowerCase();
            if (!this.contentRules.imageRules.allowedFormats.includes(fileExtension)) {
                return {
                    passed: false,
                    reason: '��֧�ֵ�ͼƬ��ʽ'
                };
            }

            // ���ͼƬ�ߴ�
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
                    reason: 'ͼƬ�ߴ��С'
                };
            }

            return {
                passed: true
            };
        } catch (error) {
            return {
                passed: false,
                reason: 'ͼƬ����ʧ��'
            };
        }
    }

    // �����Ƶ����
    async checkVideoContent(videoUrl) {
        try {
            const response = await fetch(videoUrl, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            
            // ����ļ���С
            if (parseInt(contentLength) > this.contentRules.videoRules.maxFileSize) {
                return {
                    passed: false,
                    reason: '��Ƶ�ļ�����'
                };
            }

            // ����ļ���ʽ
            const fileExtension = videoUrl.split('.').pop().toLowerCase();
            if (!this.contentRules.videoRules.allowedFormats.includes(fileExtension)) {
                return {
                    passed: false,
                    reason: '��֧�ֵ���Ƶ��ʽ'
                };
            }

            // �����Ƶʱ��
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
                    reason: '��Ƶʱ��������Ҫ��'
                };
            }

            return {
                passed: true
            };
        } catch (error) {
            return {
                passed: false,
                reason: '��Ƶ����ʧ��'
            };
        }
    }

    // �ύ���
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

            // �ύ�������������������
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
                reason: '����ύʧ��'
            };
        }
    }

    // ��ȡ���״̬
    async getReviewStatus() {
        try {
            const response = await fetch(`${this.apiEndpoint}/status?adId=${this.adId}`);
            return await response.json();
        } catch (error) {
            return {
                status: 'error',
                message: '��ȡ���״̬ʧ��'
            };
        }
    }
}

export default AdReview; 