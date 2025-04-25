document.addEventListener('DOMContentLoaded', function() {
    // ��ʼ������ѡ����
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyDateRangeBtn = document.getElementById('applyDateRange');
    const dataGroupingSelect = document.getElementById('dataGrouping');
    const exportDataBtn = document.getElementById('exportData');

    // ����Ĭ�����ڷ�Χ�����30�죩
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    startDateInput.value = formatDate(startDate);
    endDateInput.value = formatDate(endDate);

    // ��ʼ��ͼ��
    initCharts();

    // ���ڷ�Χ����¼�
    applyDateRangeBtn.addEventListener('click', function() {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        if (end < start) {
            alert('�������ڲ������ڿ�ʼ����');
            return;
        }

        if ((end - start) / (1000 * 60 * 60 * 24) > 90) {
            alert('���ڷ�Χ���ܳ���90��');
            return;
        }

        updateCharts(start, end);
        updateTableData(start, end);
    });

    // ���ݷ������¼�
    dataGroupingSelect.addEventListener('change', function() {
        updateTableData(
            new Date(startDateInput.value),
            new Date(endDateInput.value)
        );
    });

    // ���������¼�
    exportDataBtn.addEventListener('click', function() {
        exportDataToCSV();
    });

    // ͼ���ʼ��
    function initCharts() {
        // չʾ������������ͼ
        const impressionsCtx = document.getElementById('impressionsChart').getContext('2d');
        new Chart(impressionsCtx, {
            type: 'line',
            data: {
                labels: generateDateLabels(30),
                datasets: [{
                    label: 'չʾ��',
                    data: generateRandomData(30, 1000, 1500),
                    borderColor: '#1890ff',
                    tension: 0.1
                }, {
                    label: '�����',
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

        // �������ת��������ͼ
        const conversionCtx = document.getElementById('conversionChart').getContext('2d');
        new Chart(conversionCtx, {
            type: 'line',
            data: {
                labels: generateDateLabels(30),
                datasets: [{
                    label: '�����',
                    data: generateRandomData(30, 2, 3, true),
                    borderColor: '#faad14',
                    tension: 0.1
                }, {
                    label: 'ת����',
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

        // Ͷ�������ֲ�ͼ
        const channelCtx = document.getElementById('channelChart').getContext('2d');
        new Chart(channelCtx, {
            type: 'doughnut',
            data: {
                labels: ['��վ', '�ƶ�Ӧ��', '�罻ý��', '��Ƶƽ̨'],
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

        // ������������ͼ
        const audienceCtx = document.getElementById('audienceChart').getContext('2d');
        new Chart(audienceCtx, {
            type: 'bar',
            data: {
                labels: ['18-24��', '25-34��', '35-44��', '45-54��', '55������'],
                datasets: [{
                    label: '�û��ֲ�',
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

    // ����ͼ������
    function updateCharts(start, end) {
        // ���������Ӹ���ͼ�����ݵ��߼�
        // ����ͨ��API��ȡ�����ݲ�����ͼ��
        console.log('Updating charts with date range:', start, end);
    }

    // ���±������
    function updateTableData(start, end) {
        // ���������Ӹ��±�����ݵ��߼�
        // ����ͨ��API��ȡ�����ݲ����±��
        console.log('Updating table data with date range:', start, end);
        console.log('Data grouping:', dataGroupingSelect.value);
    }

    // ��������ΪCSV
    function exportDataToCSV() {
        const table = document.querySelector('.data-grid');
        const rows = table.querySelectorAll('tr');
        let csv = [];

        // ��ӱ�ͷ
        const headers = Array.from(rows[0].querySelectorAll('th'))
            .map(th => th.textContent);
        csv.push(headers.join(','));

        // ���������
        for (let i = 1; i < rows.length; i++) {
            const row = Array.from(rows[i].querySelectorAll('td'))
                .map(td => td.textContent);
            csv.push(row.join(','));
        }

        // ������������
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', '�������.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ��������
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