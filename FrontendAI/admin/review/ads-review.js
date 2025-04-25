document.addEventListener('DOMContentLoaded', function() {
    // 初始化筛选功能
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const resetFilterBtn = document.getElementById('resetFilter');

    // 筛选功能
    statusFilter.addEventListener('change', function() {
        filterAds(this.value, typeFilter.value);
    });

    typeFilter.addEventListener('change', function() {
        filterAds(statusFilter.value, this.value);
    });

    // 重置功能
    resetFilterBtn.addEventListener('click', function() {
        statusFilter.value = '';
        typeFilter.value = '';
        filterAds('', '');
    });

    // 分页功能
    const prevPageButton = document.querySelector('.pagination button:first-of-type');
    const nextPageButton = document.querySelector('.pagination button:last-of-type');
    let currentPage = 1;
    const totalPages = 5;

    prevPageButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            loadPageData(currentPage);
        }
    });

    nextPageButton.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            loadPageData(currentPage);
        }
    });

    // 审核模态框
    const reviewModal = document.getElementById('reviewModal');
    let currentAdId = null;

    // 显示审核模态框
    window.showReviewModal = function(adId) {
        currentAdId = adId;
        // 获取广告详情
        getAdDetails(adId).then(ad => {
            // 填充模态框数据
            document.getElementById('modalAdPreview').src = ad.image;
            document.getElementById('modalAdTitle').textContent = ad.name;
            document.getElementById('modalAdvertiser').textContent = ad.advertiser;
            document.getElementById('modalAdType').textContent = ad.type;
            document.getElementById('modalAdDuration').textContent = `${ad.startTime} 至 ${ad.endTime}`;
            document.getElementById('modalAdUrl').href = ad.targetUrl;

            // 显示模态框
            reviewModal.style.display = 'flex';
        });
    };

    // 关闭审核模态框
    window.closeReviewModal = function() {
        reviewModal.style.display = 'none';
        // 重置表单
        document.querySelector('input[name="reviewResult"]:checked').checked = false;
        document.getElementById('reviewComment').value = '';
    };

    // 提交审核
    window.submitReview = function() {
        const result = document.querySelector('input[name="reviewResult"]:checked');
        const comment = document.getElementById('reviewComment').value;

        if (!result) {
            alert('请选择审核结果');
            return;
        }

        if (result.value === 'rejected' && !comment.trim()) {
            alert('拒绝时请填写审核意见');
            return;
        }

        // 提交审核
        submitReviewResult(currentAdId, result.value, comment).then(() => {
            alert('审核提交成功');
            closeReviewModal();
            // 刷新列表
            loadPageData(currentPage);
        });
    };

    // 辅助函数
    function filterAds(status, type) {
        const adRows = document.querySelectorAll('.review-list tbody tr');
        
        adRows.forEach(row => {
            const adStatus = row.querySelector('.status').classList[1];
            const adType = row.querySelector('td:nth-child(3)').textContent;
            
            const matchesStatus = !status || adStatus === status;
            const matchesType = !type || adType === type;
            
            row.style.display = matchesStatus && matchesType ? '' : 'none';
        });
    }

    function updatePagination() {
        const pageInfo = document.querySelector('.page-info');
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
        
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function loadPageData(page) {
        // 这里可以添加加载页面数据的逻辑
        // 例如通过API获取数据并更新表格
        console.log(`Loading page ${page} data...`);
    }

    // 模拟API调用
    function getAdDetails(adId) {
        return new Promise((resolve) => {
            // 模拟API调用延迟
            setTimeout(() => {
                resolve({
                    id: adId,
                    name: '夏季促销活动',
                    advertiser: '示例广告主',
                    type: '横幅广告',
                    startTime: '2024-06-01',
                    endTime: '2024-08-31',
                    image: '../../public/images/ads/sample1.jpg',
                    targetUrl: 'https://example.com'
                });
            }, 500);
        });
    }

    function submitReviewResult(adId, result, comment) {
        return new Promise((resolve) => {
            // 模拟API调用延迟
            setTimeout(() => {
                console.log(`Review submitted for ad ${adId}:`, { result, comment });
                resolve();
            }, 500);
        });
    }

    // 点击模态框外部关闭
    reviewModal.addEventListener('click', function(e) {
        if (e.target === reviewModal) {
            closeReviewModal();
        }
    });
}); 