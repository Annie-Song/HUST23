// 初始化图表
document.addEventListener('DOMContentLoaded', function() {
    // 性能趋势图表
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '展示量',
                data: [1200, 1900, 3000, 5000, 2000, 3000, 4000],
                borderColor: '#1890ff',
                tension: 0.1
            }, {
                label: '点击量',
                data: [50, 100, 200, 300, 150, 200, 250],
                borderColor: '#52c41a',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // 渠道分布图表
    const channelCtx = document.getElementById('channelChart').getContext('2d');
    new Chart(channelCtx, {
        type: 'doughnut',
        data: {
            labels: ['网站', '移动应用', '社交媒体', '视频平台'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: [
                    '#1890ff',
                    '#52c41a',
                    '#faad14',
                    '#f5222d'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });

    // 下拉菜单交互
    const dropdownBtn = document.querySelector('.dropdown button');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    dropdownBtn.addEventListener('click', function() {
        dropdownMenu.classList.toggle('show');
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            dropdownMenu.classList.remove('show');
        }
    });

    // 模拟数据更新
    function updateDashboardData() {
        // 这里可以添加实时数据更新的逻辑
        // 例如通过WebSocket或定时请求API
    }

    // 每5分钟更新一次数据
    setInterval(updateDashboardData, 5 * 60 * 1000);
}); 