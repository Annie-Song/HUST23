document.addEventListener('DOMContentLoaded', function() {
    // 初始化筛选功能
    const searchInput = document.querySelector('.search-box input');
    const statusSelect = document.querySelector('.filter-options select:first-of-type');
    const typeSelect = document.querySelector('.filter-options select:last-of-type');
    const resetButton = document.querySelector('.filter-options button');
    const searchButton = document.querySelector('.search-box button');

    // 搜索功能
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        filterAds(searchTerm, statusSelect.value, typeSelect.value);
    });

    // 筛选功能
    statusSelect.addEventListener('change', function() {
        filterAds(searchInput.value.trim(), this.value, typeSelect.value);
    });

    typeSelect.addEventListener('change', function() {
        filterAds(searchInput.value.trim(), statusSelect.value, this.value);
    });

    // 重置功能
    resetButton.addEventListener('click', function() {
        searchInput.value = '';
        statusSelect.value = '';
        typeSelect.value = '';
        filterAds('', '', '');
    });

    // 广告操作按钮事件处理
    const actionButtons = document.querySelectorAll('.action-buttons button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            const adRow = this.closest('tr');
            const adName = adRow.querySelector('.ad-details h4').textContent;
            
            handleAdAction(action, adName, adRow);
        });
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

    // 辅助函数
    function filterAds(searchTerm, status, type) {
        const adRows = document.querySelectorAll('.ad-list tbody tr');
        
        adRows.forEach(row => {
            const adName = row.querySelector('.ad-details h4').textContent.toLowerCase();
            const adStatus = row.querySelector('.status').classList[1];
            const adType = row.querySelector('td:nth-child(2)').textContent;
            
            const matchesSearch = !searchTerm || adName.includes(searchTerm.toLowerCase());
            const matchesStatus = !status || adStatus === status;
            const matchesType = !type || adType === type;
            
            row.style.display = matchesSearch && matchesStatus && matchesType ? '' : 'none';
        });
    }

    function handleAdAction(action, adName, adRow) {
        switch(action) {
            case '编辑':
                window.location.href = `/ads/edit?name=${encodeURIComponent(adName)}`;
                break;
            case '暂停':
                if (confirm(`确定要暂停广告"${adName}"吗？`)) {
                    pauseAd(adName, adRow);
                }
                break;
            case '继续投放':
                if (confirm(`确定要继续投放广告"${adName}"吗？`)) {
                    resumeAd(adName, adRow);
                }
                break;
            case '删除':
                if (confirm(`确定要删除广告"${adName}"吗？此操作不可恢复。`)) {
                    deleteAd(adName, adRow);
                }
                break;
            case '分析':
                window.location.href = `/ads/analytics?name=${encodeURIComponent(adName)}`;
                break;
        }
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
    function pauseAd(adName, adRow) {
        // 模拟API调用
        setTimeout(() => {
            const statusElement = adRow.querySelector('.status');
            statusElement.textContent = '已暂停';
            statusElement.className = 'status paused';
            
            // 更新操作按钮
            const actionButtons = adRow.querySelector('.action-buttons');
            actionButtons.innerHTML = `
                <button class="btn btn-sm">编辑</button>
                <button class="btn btn-sm">继续投放</button>
                <button class="btn btn-sm">分析</button>
            `;
        }, 500);
    }

    function resumeAd(adName, adRow) {
        // 模拟API调用
        setTimeout(() => {
            const statusElement = adRow.querySelector('.status');
            statusElement.textContent = '投放中';
            statusElement.className = 'status running';
            
            // 更新操作按钮
            const actionButtons = adRow.querySelector('.action-buttons');
            actionButtons.innerHTML = `
                <button class="btn btn-sm">编辑</button>
                <button class="btn btn-sm">暂停</button>
                <button class="btn btn-sm">分析</button>
            `;
        }, 500);
    }

    function deleteAd(adName, adRow) {
        // 模拟API调用
        setTimeout(() => {
            adRow.remove();
            // 检查是否还有广告
            const remainingAds = document.querySelectorAll('.ad-list tbody tr');
            if (remainingAds.length === 0) {
                const tbody = document.querySelector('.ad-list tbody');
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">暂无广告</td></tr>';
            }
        }, 500);
    }
}); 