const nodemailer = require('nodemailer');
const config = require('config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const templateService = require('./templateService');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(config.get('email'));
  }

  async sendEmail(webhookId, req) {
    const webhook = await prisma.webhookConfig.findUnique({
      where: { id: webhookId }
    });

    if (!webhook) {
      throw new Error('Webhook配置不存在');
    }

    if (!webhook.active) {
      throw new Error('Webhook配置已禁用');
    }

    // 处理模板
    const processedData = templateService.processWebhookTemplates(webhook, req);

    const mailOptions = {
      from: processedData.from,
      to: processedData.to,
      subject: processedData.subject,
      html: processedData.content
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('发送邮件失败:', error);
      throw error;
    }
  }

  // 获取所有webhook配置
  async getAllWebhooks() {
    return await prisma.webhookConfig.findMany();
  }

  // 获取单个webhook配置
  async getWebhook(id) {
    return await prisma.webhookConfig.findUnique({
      where: { id: id }
    });
  }

  // 创建webhook配置
  async createWebhook(data) {
    return await prisma.webhookConfig.create({
      data: {
        name: data.name,
        to: data.to,
        from: data.from,
        subject: data.subject,
        content: data.content,
        active: true
      }
    });
  }

  // 更新webhook配置
  async updateWebhook(id, data) {
    return await prisma.webhookConfig.update({
      where: { id: id },
      data
    });
  }

  // 删除webhook配置
  async deleteWebhook(id) {
    // 先检查记录是否存在
    const webhook = await prisma.webhookConfig.findUnique({
      where: { id }
    });

    if (!webhook) {
      throw new Error('Webhook配置不存在');
    }

    return await prisma.webhookConfig.delete({
      where: { id }
    });
  }

  // 启用/禁用webhook
  async toggleWebhookStatus(id, active) {
    // 先检查记录是否存在
    const webhook = await prisma.webhookConfig.findUnique({
      where: { id }
    });

    if (!webhook) {
      throw new Error('Webhook配置不存在');
    }

    return await prisma.webhookConfig.update({
      where: { id },
      data: { active }
    });
  }
}

module.exports = new EmailService(); 