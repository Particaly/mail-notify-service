const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// 获取所有webhook配置
router.get('/', async (req, res) => {
  try {
    const webhooks = await emailService.getAllWebhooks();
    res.json({ success: true, webhooks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个webhook配置
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const webhook = await emailService.getWebhook(id);
    if (!webhook) {
      return res.status(404).json({ success: false, error: 'Webhook不存在' });
    }
    res.json({ success: true, webhook });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建新的webhook配置
router.post('/', async (req, res) => {
  try {
    const webhook = await emailService.createWebhook(req.body);
    res.status(201).json({ success: true, webhook });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新webhook配置
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const webhook = await emailService.updateWebhook(id, req.body);
    res.json({ success: true, webhook });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除webhook配置
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await emailService.deleteWebhook(id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 触发webhook发送邮件
router.post('/:id/trigger', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await emailService.sendEmail(id, req);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启用/禁用webhook
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    const id = req.params.id; // 确保移除连字符
    const webhook = await emailService.toggleWebhookStatus(id, active);
    res.json({ success: true, webhook });
  } catch (error) {
    console.error('Toggle webhook status error:', error);
    res.status(error.message.includes('不存在') ? 404 : 500)
       .json({ success: false, error: error.message });
  }
});

module.exports = router; 