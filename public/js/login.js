document.addEventListener('DOMContentLoaded', async () => {
    // 检查是否有用户存在
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.hasUser) {
            // 显示注册字段
            document.querySelector('.signup-fields').style.display = 'block';
            document.getElementById('submitBtn').textContent = '创建账号';
        }
    } catch (error) {
        console.error('检查用户失败:', error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 获取注册字段的显示状态
    const isSignup = document.querySelector('.signup-fields').style.display === 'block';
    
    if (isSignup) {
        // 注册流程
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            if (data.success) {
                window.location.href = '/';
            } else {
                alert(data.error || '创建账号失败');
            }
        } catch (error) {
            alert('创建账号失败: ' + error.message);
        }
    } else {
        // 登录流程
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            if (data.success) {
                window.location.href = '/';
            } else {
                alert(data.error || '登录失败');
            }
        } catch (error) {
            alert('登录失败: ' + error.message);
        }
    }
}); 