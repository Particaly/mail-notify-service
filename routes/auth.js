const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// 检查是否有用户存在
router.get('/check', async (req, res) => {
    try {
        const hasUser = await authService.hasUser();
        res.json({ success: true, hasUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 注册
router.post('/signup', async (req, res) => {
    try {
        const hasUser = await authService.hasUser();
        if (hasUser) {
            return res.status(403).json({ success: false, error: '已存在用户，不能重复注册' });
        }

        const { username, password } = req.body;
        const user = await authService.signup(username, password);
        req.session.userId = user.id;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authService.login(username, password);
        req.session.userId = user.id;
        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});

// 登出
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

module.exports = router; 