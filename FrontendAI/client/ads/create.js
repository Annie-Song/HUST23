document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createAdForm');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const uploadInput = imageUpload.querySelector('.upload-input');
    const previewImage = imagePreview.querySelector('.preview-image');
    const removeImageBtn = imagePreview.querySelector('.remove-image');

    // 图片上传处理
    imageUpload.addEventListener('click', function() {
        uploadInput.click();
    });

    imageUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    imageUpload.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });

    imageUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        handleImageUpload(e.dataTransfer.files[0]);
    });

    uploadInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleImageUpload(this.files[0]);
        }
    });

    removeImageBtn.addEventListener('click', function() {
        imagePreview.style.display = 'none';
        imageUpload.style.display = 'block';
        uploadInput.value = '';
    });

    function handleImageUpload(file) {
        // 检查文件类型
        if (!file.type.match('image.*')) {
            alert('请上传图片文件');
            return;
        }

        // 检查文件大小
        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            imageUpload.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // 表单验证
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 获取表单数据
        const formData = new FormData(form);
        const adData = {
            name: formData.get('adName'),
            type: formData.get('adType'),
            description: formData.get('adDescription'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            dailyBudget: parseFloat(formData.get('dailyBudget')),
            totalBudget: parseFloat(formData.get('totalBudget')),
            title: formData.get('adTitle'),
            copy: formData.get('adCopy'),
            image: previewImage.src,
            targetUrl: formData.get('targetUrl'),
            regions: formData.getAll('regions'),
            minAge: parseInt(formData.get('minAge')) || null,
            maxAge: parseInt(formData.get('maxAge')) || null,
            interests: formData.getAll('interests')
        };

        // 验证数据
        if (!validateForm(adData)) {
            return;
        }

        // 提交数据
        submitAd(adData);
    });

    function validateForm(data) {
        // 验证时间
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        if (endTime <= startTime) {
            alert('结束时间必须晚于开始时间');
            return false;
        }

        // 验证预算
        if (data.dailyBudget <= 0 || data.totalBudget <= 0) {
            alert('预算金额必须大于0');
            return false;
        }

        // 验证年龄范围
        if (data.minAge && data.maxAge && data.minAge > data.maxAge) {
            alert('最小年龄不能大于最大年龄');
            return false;
        }

        // 验证图片
        if (!data.image) {
            alert('请上传广告图片');
            return false;
        }

        return true;
    }

    function submitAd(data) {
        // 显示加载状态
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';

        // 模拟API调用
        setTimeout(() => {
            // 重置按钮状态
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // 模拟成功响应
            alert('广告创建成功！');
            window.location.href = '/ads/list';
        }, 1000);
    }

    // 日期时间选择器初始化
    const startTimeInput = form.querySelector('input[name="startTime"]');
    const endTimeInput = form.querySelector('input[name="endTime"]');

    // 设置最小日期为当前时间
    const now = new Date();
    const minDate = now.toISOString().slice(0, 16);
    startTimeInput.min = minDate;
    endTimeInput.min = minDate;

    // 当开始时间改变时，更新结束时间的最小值
    startTimeInput.addEventListener('change', function() {
        endTimeInput.min = this.value;
        if (endTimeInput.value && endTimeInput.value < this.value) {
            endTimeInput.value = this.value;
        }
    });

    // 预算输入验证
    const dailyBudgetInput = form.querySelector('input[name="dailyBudget"]');
    const totalBudgetInput = form.querySelector('input[name="totalBudget"]');

    dailyBudgetInput.addEventListener('input', function() {
        if (this.value && totalBudgetInput.value) {
            const days = Math.ceil((new Date(endTimeInput.value) - new Date(startTimeInput.value)) / (1000 * 60 * 60 * 24));
            if (parseFloat(this.value) * days > parseFloat(totalBudgetInput.value)) {
                alert('每日预算乘以投放天数不能超过总预算');
                this.value = '';
            }
        }
    });

    totalBudgetInput.addEventListener('input', function() {
        if (this.value && dailyBudgetInput.value) {
            const days = Math.ceil((new Date(endTimeInput.value) - new Date(startTimeInput.value)) / (1000 * 60 * 60 * 24));
            if (parseFloat(dailyBudgetInput.value) * days > parseFloat(this.value)) {
                alert('总预算必须大于或等于每日预算乘以投放天数');
                this.value = '';
            }
        }
    });
}); 