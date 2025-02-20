const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const config = require('config');
const webhookRoutes = require('./routes/webhook');
const authRoutes = require('./routes/auth');

// 检查并初始化配置文件
function initConfig() {
  const configPath = path.join(__dirname, 'config', 'default.json');
  const examplePath = path.join(__dirname, 'config', 'default.example.json');

  if (!fs.existsSync(configPath)) {
    // 确保 config 目录存在
    if (!fs.existsSync(path.dirname(configPath))) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    
    // 复制示例配置文件
    try {
      fs.copyFileSync(examplePath, configPath);
      console.log('已创建默认配置文件 config/default.json');
      console.log('请修改配置文件中的邮箱设置后再启动服务');
      process.exit(1);
    } catch (error) {
      console.error('创建配置文件失败:', error);
      process.exit(1);
    }
  }
}

// 在应用启动前初始化配置
initConfig();

const app = express();
const port = 3000;

// 获取 session secret，如果未配置则使用默认值
const sessionSecret = config.has('session.secret') 
  ? config.get('session.secret') 
  : 'default-secret-key-please-change-in-production';

// 添加会话中间件
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// 解析JSON请求体
app.use(express.json());
// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));

// 认证中间件
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    // API 请求返回 401，但排除所有 auth 相关接口
    if (req.path.startsWith('/api/') && !req.path.startsWith('/api/auth/')) {
      return res.status(401).json({ success: false, error: '未登录或会话已过期' });
    }
    // 页面请求重定向到登录页
    if (req.path !== '/login.html' && !req.path.startsWith('/api/auth/')) {
      return res.redirect('/login.html');
    }
  }
  next();
}

// 静态文件服务
app.use(express.static('public'));

// 添加认证中间件
app.use(requireAuth);

// 添加webhook路由
app.use('/api/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === 'production' && sessionSecret === 'default-secret-key-please-change-in-production') {
  console.warn('警告: 正在使用默认的 session secret。在生产环境中，请在 config/default.json 中设置自定义的 secret。');
}

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 