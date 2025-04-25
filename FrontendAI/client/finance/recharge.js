document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rechargeForm');
    const amountInput = form.querySelector('input[name="amount"]');
    const paymentMethods = form.querySelectorAll('input[name="paymentMethod"]');
    const invoiceOptions = form.querySelectorAll('input[name="invoiceType"]');

    // 表单提交处理
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 获取表单数据
        const formData = new FormData(form);
        const rechargeData = {
            amount: parseFloat(formData.get('amount')),
            paymentMethod: formData.get('paymentMethod'),
            invoiceType: formData.get('invoiceType')
        };

        // 验证数据
        if (!validateForm(rechargeData)) {
            return;
        }

        // 提交数据
        submitRecharge(rechargeData);
    });

    // 金额输入验证
    amountInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (value < 100) {
            this.setCustomValidity('充值金额不能低于100元');
        } else {
            this.setCustomValidity('');
        }
    });

    // 支付方式选择处理
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            updatePaymentMethod(this.value);
        });
    });

    // 发票类型选择处理
    invoiceOptions.forEach(option => {
        option.addEventListener('change', function() {
            updateInvoiceType(this.value);
        });
    });

    // 表单验证
    function validateForm(data) {
        if (data.amount < 100) {
            alert('充值金额不能低于100元');
            return false;
        }

        if (!data.paymentMethod) {
            alert('请选择支付方式');
            return false;
        }

        return true;
    }

    // 提交充值
    function submitRecharge(data) {
        // 显示加载状态
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '处理中...';

        // 模拟API调用
        setTimeout(() => {
            // 根据支付方式跳转到相应的支付页面
            switch(data.paymentMethod) {
                case 'alipay':
                    window.location.href = '/payment/alipay?amount=' + data.amount;
                    break;
                case 'wechat':
                    window.location.href = '/payment/wechat?amount=' + data.amount;
                    break;
                case 'bank':
                    showBankTransferInfo(data.amount);
                    break;
            }

            // 重置按钮状态
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1000);
    }

    // 更新支付方式UI
    function updatePaymentMethod(method) {
        const methodElements = document.querySelectorAll('.payment-method');
        methodElements.forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`.payment-method input[value="${method}"]`).parentElement.classList.add('selected');
    }

    // 更新发票类型UI
    function updateInvoiceType(type) {
        const optionElements = document.querySelectorAll('.invoice-option');
        optionElements.forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`.invoice-option input[value="${type}"]`).parentElement.classList.add('selected');
    }

    // 显示银行转账信息
    function showBankTransferInfo(amount) {
        const bankInfo = `
            <div class="bank-transfer-info">
                <h3>银行转账信息</h3>
                <div class="info-item">
                    <span>开户行：</span>
                    <span>中国工商银行北京分行</span>
                </div>
                <div class="info-item">
                    <span>账户名：</span>
                    <span>广告平台科技有限公司</span>
                </div>
                <div class="info-item">
                    <span>账号：</span>
                    <span>6222 0000 0000 0000</span>
                </div>
                <div class="info-item">
                    <span>转账金额：</span>
                    <span>?${amount.toFixed(2)}</span>
                </div>
                <div class="info-item">
                    <span>备注：</span>
                    <span>充值-${generateOrderNumber()}</span>
                </div>
                <p class="notice">请使用您注册的手机号作为转账备注，以便我们及时确认到账</p>
                <button class="btn btn-primary" onclick="window.location.href='/finance/history'">已完成转账</button>
            </div>
        `;

        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                ${bankInfo}
                <button class="modal-close">&times;</button>
            </div>
        `;

        document.body.appendChild(modal);

        // 关闭模态框
        modal.querySelector('.modal-close').addEventListener('click', function() {
            document.body.removeChild(modal);
        });

        // 点击模态框外部关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // 生成订单号
    function generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${year}${month}${day}${random}`;
    }
}); 