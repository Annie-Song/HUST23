document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期选择器
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyDateRangeBtn = document.getElementById('applyDateRange');
    const dataGroupingSelect = document.getElementById('dataGrouping');
    const exportDataBtn = document.getElementById('exportData');

    // 设置默认日期范围（最近30天）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    startDateInput.value = formatDate(startDate);
    endDateInput.value = formatDate(endDate);

    // 初始化图表
    initCharts();

    // 日期范围变更事件
    applyDateRangeBtn.addEventListener('click', function() {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        if (end < start) {
            alert('结束日期不能早于开始日期');
            return;
        }

        if ((end - start) / (1000 * 60 * 60 * 24) > 90) {
            alert('日期范围不能超过90天');
            return;
        }

        updateCharts(start, end);
        updateTableData(start, end);
    });

    // 数据分组变更事件
    dataGroupingSelect.addEventListener('change', function() {
        updateTableData(
            new Date(startDateInput.value),
            new Date(endDateInput.value)
        );
    });

    // 导出数据事件
    exportDataBtn.addEventListener('click', function() {
        exportDataToCSV();
    });

    // 图表初始化
    function initCharts() {
        // 展示量与点击量趋势图
        const impressionsCtx = document.getElementById('impressionsChart').getContext('2d');
        new Chart(impressionsCtx, {
            type: 'line',
            data: {
                labels: generateDateLabels(30),
                datasets: [{
                    label: '展示量',
                    data: generateRandomData(30, 1000, 1500),
                    borderColor: '#1890ff',
                    tension: 0.1
                }, {
                    label: '点击量',
                    data: generateRandomData(30, 20, 40),
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

        // 点击率与转化率趋势图
        const conversionCtx = document.getElementById('conversionChart').getContext('2d');
        new Chart(conversionCtx, {
            type: 'line',
            data: {
                labels: generateDateLabels(30),
                datasets: [{
                    label: '点击率',
                    data: generateRandomData(30, 2, 3, true),
                    borderColor: '#faad14',
                    tension: 0.1
                }, {
                    label: '转化率',
                    data: generateRandomData(30, 1, 2, true),
                    borderColor: '#f5222d',
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
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // 投放渠道分布图
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

        // 受众特征分析图
        const audienceCtx = document.getElementById('audienceChart').getContext('2d');
        new Chart(audienceCtx, {
            type: 'bar',
            data: {
                labels: ['18-24岁', '25-34岁', '35-44岁', '45-54岁', '55岁以上'],
                datasets: [{
                    label: '用户分布',
                    data: [25, 35, 20, 15, 5],
                    backgroundColor: '#1890ff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // 更新图表数据
    function updateCharts(start, end) {
        // 这里可以添加更新图表数据的逻辑
        // 例如通过API获取新数据并更新图表
        console.log('Updating charts with date range:', start, end);
    }

    // 更新表格数据
    function updateTableData(start, end) {
        // 这里可以添加更新表格数据的逻辑
        // 例如通过API获取新数据并更新表格
        console.log('Updating table data with date range:', start, end);
        console.log('Data grouping:', dataGroupingSelect.value);
    }

    // 导出数据为CSV
    function exportDataToCSV() {
        const table = document.querySelector('.data-grid');
        const rows = table.querySelectorAll('tr');
        let csv = [];

        // 添加表头
        const headers = Array.from(rows[0].querySelectorAll('th'))
            .map(th => th.textContent);
        csv.push(headers.join(','));

        // 添加数据行
        for (let i = 1; i < rows.length; i++) {
            const row = Array.from(rows[i].querySelectorAll('td'))
                .map(td => td.textContent);
            csv.push(row.join(','));
        }

        // 创建下载链接
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', '广告数据.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 辅助函数
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(formatDate(date));
        }
        return labels;
    }

    function generateRandomData(count, min, max, isPercentage = false) {
        const data = [];
        for (let i = 0; i < count; i++) {
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            data.push(isPercentage ? value.toFixed(1) : value);
        }
        return data;
    }
}); 