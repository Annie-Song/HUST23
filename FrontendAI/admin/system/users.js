document.addEventListener('DOMContentLoaded', function() {
    // 初始化筛选功能
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetFilterBtn = document.getElementById('resetFilter');

    // 筛选功能
    roleFilter.addEventListener('change', function() {
        filterUsers(this.value, statusFilter.value);
    });

    statusFilter.addEventListener('change', function() {
        filterUsers(roleFilter.value, this.value);
    });

    // 重置功能
    resetFilterBtn.addEventListener('click', function() {
        roleFilter.value = '';
        statusFilter.value = '';
        filterUsers('', '');
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

    // 用户表单处理
    const userForm = document.getElementById('userForm');
    let currentUserId = null;

    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;

        // 表单验证
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        if (currentUserId) {
            // 编辑用户
            updateUser(currentUserId, { username, email, password, role });
        } else {
            // 添加用户
            createUser({ username, email, password, role });
        }
    });

    // 显示添加用户模态框
    window.showAddUserModal = function() {
        currentUserId = null;
        document.getElementById('modalTitle').textContent = '添加用户';
        document.getElementById('userForm').reset();
        document.getElementById('userModal').style.display = 'flex';
    };

    // 显示编辑用户模态框
    window.showEditUserModal = function(userId) {
        currentUserId = userId;
        document.getElementById('modalTitle').textContent = '编辑用户';
        
        // 获取用户信息
        getUserDetails(userId).then(user => {
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role;
            // 编辑时不需要填写密码
            document.getElementById('password').required = false;
            document.getElementById('confirmPassword').required = false;
            
            document.getElementById('userModal').style.display = 'flex';
        });
    };

    // 关闭用户模态框
    window.closeUserModal = function() {
        document.getElementById('userModal').style.display = 'none';
        document.getElementById('userForm').reset();
        // 重置密码字段为必填
        document.getElementById('password').required = true;
        document.getElementById('confirmPassword').required = true;
    };

    // 显示禁用用户确认模态框
    window.showDisableUserModal = function(userId) {
        currentUserId = userId;
        document.getElementById('confirmMessage').textContent = '确定要禁用该用户吗？';
        document.getElementById('confirmModal').style.display = 'flex';
    };

    // 关闭确认模态框
    window.closeConfirmModal = function() {
        document.getElementById('confirmModal').style.display = 'none';
    };

    // 确认操作
    window.confirmAction = function() {
        disableUser(currentUserId).then(() => {
            alert('用户已禁用');
            closeConfirmModal();
            loadPageData(currentPage);
        });
    };

    // 辅助函数
    function filterUsers(role, status) {
        const userRows = document.querySelectorAll('.user-list tbody tr');
        
        userRows.forEach(row => {
            const userRole = row.querySelector('.role-tag').classList[1];
            const userStatus = row.querySelector('.status').classList[1];
            
            const matchesRole = !role || userRole === role;
            const matchesStatus = !status || userStatus === status;
            
            row.style.display = matchesRole && matchesStatus ? '' : 'none';
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
    function getUserDetails(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: userId,
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin'
                });
            }, 500);
        });
    }

    function createUser(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Creating user:', userData);
                resolve();
            }, 500);
        });
    }

    function updateUser(userId, userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Updating user ${userId}:`, userData);
                resolve();
            }, 500);
        });
    }

    function disableUser(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Disabling user ${userId}`);
                resolve();
            }, 500);
        });
    }

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                if (modal.id === 'userModal') {
                    closeUserModal();
                } else if (modal.id === 'confirmModal') {
                    closeConfirmModal();
                }
            }
        });
    });
}); 