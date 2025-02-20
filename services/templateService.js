class TemplateService {
  // 解析模板字符串
  parseTemplate(template, context) {
    return template.replace(/\${(.*?)}/g, (match, key) => {
      const value = this.getValueByPath(context, key.trim());
      return value !== undefined ? value : match;
    });
  }

  // 从对象中获取嵌套属性值
  getValueByPath(obj, path) {
    return path.split('.').reduce((acc, part) => {
      if (acc === undefined) return undefined;
      return acc[part];
    }, obj);
  }

  // 处理webhook配置中的所有模板
  processWebhookTemplates(webhook, req) {
    const context = {
      headers: req.headers,
      query: req.query,
      body: req.body,
      params: req.params
    };

    return {
      to: this.parseTemplate(webhook.to, context),
      from: this.parseTemplate(webhook.from, context),
      subject: this.parseTemplate(webhook.subject, context),
      content: this.parseTemplate(webhook.content, context)
    };
  }
}

module.exports = new TemplateService(); 