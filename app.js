const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
const webhookRoutes = require('./routes/webhook');
const authRoutes = require('./routes/auth');

// 添加会话中间件
app.use(session({
  secret: 'your-secret-key',
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

// 示例路由
app.get('/', (req, res) => {
  res.send('欢迎使用Express!');
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 