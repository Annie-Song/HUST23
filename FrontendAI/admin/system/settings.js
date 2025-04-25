document.addEventListener('DOMContentLoaded', function() {
    // 选项卡切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // 更新按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新内容显示
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-settings`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // 基本设置表单处理
    const basicSettingsForm = document.getElementById('basicSettingsForm');
    basicSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            platformName: document.getElementById('platformName').value,
            supportEmail: document.getElementById('supportEmail').value,
            supportPhone: document.getElementById('supportPhone').value,
            workingHours: document.getElementById('workingHours').value
        };

        // 处理Logo上传
        const logoFile = document.getElementById('logoUpload').files[0];
        if (logoFile) {
            // 这里可以添加文件上传逻辑
            console.log('Uploading logo:', logoFile);
        }

        // 保存设置
        saveBasicSettings(settings).then(() => {
            alert('基本设置已保存');
        });
    });

    // 计费规则表单处理
    const billingSettingsForm = document.getElementById('billingSettingsForm');
    billingSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            cpcRate: parseFloat(document.getElementById('cpcRate').value),
            cpmRate: parseFloat(document.getElementById('cpmRate').value),
            minRecharge: parseFloat(document.getElementById('minRecharge').value),
            withdrawFee: parseFloat(document.getElementById('withdrawFee').value)
        };

        // 保存设置
        saveBillingSettings(settings).then(() => {
            alert('计费规则已保存');
        });
    });

    // 广告位表单处理
    const slotForm = document.getElementById('slotForm');
    let currentSlotId = null;

    slotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const slotData = {
            name: document.getElementById('slotName').value,
            width: parseInt(document.getElementById('slotWidth').value),
            height: parseInt(document.getElementById('slotHeight').value),
            type: document.getElementById('slotType').value,
            description: document.getElementById('slotDescription').value
        };

        if (currentSlotId) {
            // 更新广告位
            updateAdSlot(currentSlotId, slotData).then(() => {
                alert('广告位已更新');
                closeSlotModal();
                loadAdSlots();
            });
        } else {
            // 添加广告位
            createAdSlot(slotData).then(() => {
                alert('广告位已添加');
                closeSlotModal();
                loadAdSlots();
            });
        }
    });

    // 显示添加广告位模态框
    window.showAddSlotModal = function() {
        currentSlotId = null;
        document.getElementById('slotModalTitle').textContent = '添加广告位';
        document.getElementById('slotForm').reset();
        document.getElementById('slotModal').style.display = 'flex';
    };

    // 显示编辑广告位模态框
    window.showEditSlotModal = function(slotId) {
        currentSlotId = slotId;
        document.getElementById('slotModalTitle').textContent = '编辑广告位';
        
        // 获取广告位信息
        getAdSlotDetails(slotId).then(slot => {
            document.getElementById('slotName').value = slot.name;
            document.getElementById('slotWidth').value = slot.width;
            document.getElementById('slotHeight').value = slot.height;
            document.getElementById('slotType').value = slot.type;
            document.getElementById('slotDescription').value = slot.description;
            
            document.getElementById('slotModal').style.display = 'flex';
        });
    };

    // 关闭广告位模态框
    window.closeSlotModal = function() {
        document.getElementById('slotModal').style.display = 'none';
        document.getElementById('slotForm').reset();
    };

    // 显示禁用广告位确认模态框
    window.showDisableSlotModal = function(slotId) {
        if (confirm('确定要禁用该广告位吗？')) {
            disableAdSlot(slotId).then(() => {
                alert('广告位已禁用');
                loadAdSlots();
            });
        }
    };

    // 辅助函数
    function loadAdSlots() {
        // 这里可以添加加载广告位列表的逻辑
        console.log('Loading ad slots...');
    }

    // 模拟API调用
    function saveBasicSettings(settings) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Saving basic settings:', settings);
                resolve();
            }, 500);
        });
    }

    function saveBillingSettings(settings) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Saving billing settings:', settings);
                resolve();
            }, 500);
        });
    }

    function getAdSlotDetails(slotId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: slotId,
                    name: '首页横幅',
                    width: 1200,
                    height: 200,
                    type: 'image',
                    description: '网站首页顶部横幅广告位'
                });
            }, 500);
        });
    }

    function createAdSlot(slotData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Creating ad slot:', slotData);
                resolve();
            }, 500);
        });
    }

    function updateAdSlot(slotId, slotData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Updating ad slot ${slotId}:`, slotData);
                resolve();
            }, 500);
        });
    }

    function disableAdSlot(slotId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Disabling ad slot ${slotId}`);
                resolve();
            }, 500);
        });
    }

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeSlotModal();
            }
        });
    });
}); 