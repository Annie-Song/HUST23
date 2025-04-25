document.addEventListener('DOMContentLoaded', function() {
    // 加载日志数据
    loadLogs();
    
    // 绑定筛选事件
    document.getElementById('timeRange').addEventListener('change', function() {
        if (this.value === 'custom') {
            showCustomDateRange();
        }
    });
});

// 加载日志数据
function loadLogs() {
    // 模拟API调用获取数据
    fetchLogs().then(data => {
        updateLogTable(data.logs);
        updatePagination(data.totalPages);
    });
}

// 应用筛选
function applyFilters() {
    const filters = {
        operationType: document.getElementById('operationType').value,
        operator: document.getElementById('operator').value,
        timeRange: document.getElementById('timeRange').value
    };

    // 显示加载状态
    showLoading();

    // 模拟API调用获取筛选后的数据
    fetchLogs(filters).then(data => {
        updateLogTable(data.logs);
        updatePagination(data.totalPages);
        hideLoading();
    });
}

// 重置筛选
function resetFilters() {
    document.getElementById('operationType').value = 'all';
    document.getElementById('operator').value = '';
    document.getElementById('timeRange').value = 'month';
    
    // 重新加载数据
    loadLogs();
}

// 更新日志表格
function updateLogTable(logs) {
    const tbody = document.getElementById('logTableBody');
    tbody.innerHTML = '';

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(log.time)}</td>
            <td>${getOperationTypeText(log.type)}</td>
            <td>${log.target}</td>
            <td>${log.operator}</td>
            <td>${log.ip}</td>
            <td><span class="status ${log.result === 'success' ? 'success' : 'failed'}">${getResultText(log.result)}</span></td>
            <td>
                <button class="btn btn-sm" onclick="showLogDetail(${log.id})">查看详情</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 更新分页信息
function updatePagination(totalPages) {
    document.getElementById('totalPages').textContent = totalPages;
}

// 显示日志详情
function showLogDetail(logId) {
    // 模拟API调用获取日志详情
    getLogDetail(logId).then(log => {
        document.getElementById('detailTime').textContent = formatDateTime(log.time);
        document.getElementById('detailType').textContent = getOperationTypeText(log.type);
        document.getElementById('detailTarget').textContent = log.target;
        document.getElementById('detailOperator').textContent = log.operator;
        document.getElementById('detailIp').textContent = log.ip;
        document.getElementById('detailResult').textContent = getResultText(log.result);
        document.getElementById('detailRemark').textContent = log.remark || '无';
        
        document.getElementById('logDetailModal').style.display = 'flex';
    });
}

// 关闭日志详情
function closeLogDetail() {
    document.getElementById('logDetailModal').style.display = 'none';
}

// 导出日志
function exportLogs() {
    const filters = {
        operationType: document.getElementById('operationType').value,
        operator: document.getElementById('operator').value,
        timeRange: document.getElementById('timeRange').value
    };

    // 模拟API调用导出日志
    exportLogData(filters).then(() => {
        alert('日志导出成功！');
    });
}

// 分页控制
let currentPage = 1;
const pageSize = 10;

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPageData();
    }
}

function nextPage() {
    if (currentPage < parseInt(document.getElementById('totalPages').textContent)) {
        currentPage++;
        loadPageData();
    }
}

function loadPageData() {
    const filters = {
        operationType: document.getElementById('operationType').value,
        operator: document.getElementById('operator').value,
        timeRange: document.getElementById('timeRange').value,
        page: currentPage,
        pageSize: pageSize
    };

    fetchLogs(filters).then(data => {
        updateLogTable(data.logs);
        document.getElementById('currentPage').textContent = currentPage;
    });
}

// 显示自定义日期范围选择器
function showCustomDateRange() {
    // 这里可以添加自定义日期范围选择器的逻辑
    alert('自定义日期范围功能开发中...');
}

// 显示加载状态
function showLoading() {
    // 这里可以添加加载状态的显示逻辑
    console.log('Loading...');
}

// 隐藏加载状态
function hideLoading() {
    // 这里可以添加加载状态的隐藏逻辑
    console.log('Loading complete');
}

// 辅助函数
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function getOperationTypeText(type) {
    const types = {
        create: '创建',
        update: '更新',
        delete: '删除',
        approve: '审核通过',
        reject: '审核拒绝'
    };
    return types[type] || type;
}

function getResultText(result) {
    return result === 'success' ? '成功' : '失败';
}

// 模拟API调用
function fetchLogs(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟数据
            const data = {
                logs: [
                    {
                        id: 1,
                        time: '2024-01-01 10:00:00',
                        type: 'approve',
                        target: '广告ID: 1001',
                        operator: '管理员',
                        ip: '192.168.1.1',
                        result: 'success',
                        remark: '广告内容符合规范'
                    },
                    // 更多数据...
                ],
                totalPages: 10
            };
            resolve(data);
        }, 500);
    });
}

function getLogDetail(logId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟数据
            resolve({
                id: logId,
                time: '2024-01-01 10:00:00',
                type: 'approve',
                target: '广告ID: 1001',
                operator: '管理员',
                ip: '192.168.1.1',
                result: 'success',
                remark: '广告内容符合规范，图片清晰，文字描述准确'
            });
        }, 500);
    });
}

function exportLogData(filters) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Exporting log data with filters:', filters);
            resolve();
        }, 1000);
    });
}

// 点击模态框外部关闭
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLogDetail();
        }
    });
}); 