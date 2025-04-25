class VideoAd {
    constructor(options) {
        this.container = options.container;
        this.videoElement = null;
        this.controls = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.currentVolume = 1;
        this.init();
    }

    init() {
        // 创建视频元素
        this.videoElement = document.createElement('video');
        this.videoElement.className = 'ad-video';
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('preload', 'auto');

        // 创建控制栏
        this.controls = document.createElement('div');
        this.controls.className = 'ad-video-controls';

        // 创建播放按钮
        const playButton = document.createElement('button');
        playButton.className = 'video-control-btn ad-video-play';
        playButton.innerHTML = '播放';
        playButton.addEventListener('click', () => this.togglePlay());

        // 创建进度条
        const progressContainer = document.createElement('div');
        progressContainer.className = 'video-progress';
        const progressBar = document.createElement('div');
        progressBar.className = 'video-progress-bar';
        progressContainer.appendChild(progressBar);
        progressContainer.addEventListener('click', (e) => this.seek(e));

        // 创建音量控制
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'video-volume';
        const volumeButton = document.createElement('button');
        volumeButton.className = 'video-control-btn ad-video-volume-button';
        volumeButton.innerHTML = '音量';
        volumeButton.addEventListener('click', () => this.toggleMute());

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.className = 'video-volume-slider';
        volumeSlider.min = 0;
        volumeSlider.max = 100;
        volumeSlider.value = 100;
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));

        volumeContainer.appendChild(volumeButton);
        volumeContainer.appendChild(volumeSlider);

        // 组装控制栏
        this.controls.appendChild(playButton);
        this.controls.appendChild(progressContainer);
        this.controls.appendChild(volumeContainer);

        // 添加到容器
        this.container.appendChild(this.videoElement);
        this.container.appendChild(this.controls);

        // 绑定事件
        this.bindEvents();
    }

    bindEvents() {
        // 视频事件
        this.videoElement.addEventListener('timeupdate', () => this.updateProgress());
        this.videoElement.addEventListener('ended', () => this.onEnded());
        this.videoElement.addEventListener('error', () => this.onError());
        this.videoElement.addEventListener('loadedmetadata', () => this.onLoaded());

        // 鼠标事件
        this.container.addEventListener('mouseenter', () => this.showControls());
        this.container.addEventListener('mouseleave', () => this.hideControls());
    }

    loadAd(adData) {
        this.videoElement.src = adData.videoUrl;
        if (adData.posterUrl) {
            this.videoElement.poster = adData.posterUrl;
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.videoElement.pause();
        } else {
            this.videoElement.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.videoElement.muted = this.isMuted;
        this.updateVolumeButton();
    }

    setVolume(volume) {
        this.currentVolume = volume;
        this.videoElement.volume = volume;
        this.updateVolumeButton();
    }

    seek(e) {
        const rect = e.target.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.videoElement.currentTime = pos * this.videoElement.duration;
    }

    updateProgress() {
        const progress = (this.videoElement.currentTime / this.videoElement.duration) * 100;
        const progressBar = this.controls.querySelector('.video-progress-bar');
        progressBar.style.width = `${progress}%`;
    }

    updatePlayButton() {
        const playButton = this.controls.querySelector('.ad-video-play');
        playButton.innerHTML = this.isPlaying ? '暂停' : '播放';
    }

    updateVolumeButton() {
        const volumeButton = this.controls.querySelector('.ad-video-volume-button');
        if (this.isMuted || this.currentVolume === 0) {
            volumeButton.innerHTML = '静音';
        } else if (this.currentVolume < 0.5) {
            volumeButton.innerHTML = '低音量';
        } else {
            volumeButton.innerHTML = '音量';
        }
    }

    showControls() {
        this.controls.style.opacity = '1';
    }

    hideControls() {
        if (this.isPlaying) {
            this.controls.style.opacity = '0';
        }
    }

    onEnded() {
        this.isPlaying = false;
        this.updatePlayButton();
    }

    onError() {
        console.error('视频加载失败');
        // 显示错误状态
        const errorContainer = document.createElement('div');
        errorContainer.className = 'ad-video-error';
        errorContainer.innerHTML = `
            <div class="ad-video-error-icon">!</div>
            <div class="ad-video-error-message">视频加载失败</div>
            <button class="ad-video-retry-btn">重试</button>
        `;
        this.container.appendChild(errorContainer);
    }

    onLoaded() {
        // 视频元数据加载完成
        console.log('视频加载完成');
    }
}

// 导出VideoAd类
export default VideoAd; 