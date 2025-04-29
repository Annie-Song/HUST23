const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * 创建邮件传输器
 */
const createTransporter = async () => {
  // 在开发环境中使用Ethereal测试邮箱
  if (config.environment === 'development' && !config.email.smtp.host) {
    logger.info('使用Ethereal测试邮箱');
    
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  
  // 生产环境使用配置的SMTP
  return nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.port === 465,
    auth: {
      user: config.email.smtp.auth.user,
      pass: config.email.smtp.auth.pass
    }
  });
};

/**
 * 发送电子邮件
 * @param {Object} options - 邮件选项
 * @param {String} options.to - 收件人邮箱
 * @param {String} options.subject - 邮件主题
 * @param {String} options.text - 纯文本内容
 * @param {String} options.html - HTML内容
 * @returns {Promise} - 发送结果
 */
const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"${config.email.from}" <${config.email.smtp.auth.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || ''
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`邮件已发送: ${info.messageId}`);
    
    // 如果是测试账号，显示预览URL
    if (config.environment === 'development') {
      logger.info(`邮件预览URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    logger.error(`发送邮件失败: ${error.message}`);
    throw error;
  }
};

/**
 * 发送密码重置邮件
 * @param {String} to - 收件人邮箱
 * @param {String} resetToken - 重置令牌
 * @param {String} userName - 用户名
 * @returns {Promise} - 发送结果
 */
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  const resetUrl = `${config.server.host}:${config.server.port}/api/v1/auth/resetpassword/${resetToken}`;
  
  const subject = '密码重置请求';
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">您好，${userName || '尊敬的用户'}</h2>
      <p>我们收到了重置您账户密码的请求。如果您没有请求重置密码，请忽略此邮件。</p>
      <p>请点击以下链接重置您的密码：</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          重置密码
        </a>
      </p>
      <p>或者复制以下链接到浏览器地址栏：</p>
      <p>${resetUrl}</p>
      <p>此链接将在10分钟后失效。</p>
      <p>如果您没有请求重置密码，请忽略此邮件，您的账户将保持安全。</p>
      <p>谢谢！</p>
      <p>广告平台团队</p>
    </div>
  `;
  
  const text = `您好，${userName || '尊敬的用户'}\n\n我们收到了重置您账户密码的请求。如果您没有请求重置密码，请忽略此邮件。\n\n请访问以下链接重置您的密码：${resetUrl}\n\n此链接将在10分钟后失效。\n\n如果您没有请求重置密码，请忽略此邮件，您的账户将保持安全。\n\n谢谢！\n广告平台团队`;
  
  return sendEmail({
    to,
    subject,
    text,
    html
  });
};

/**
 * 发送欢迎邮件
 * @param {String} to - 收件人邮箱
 * @param {String} userName - 用户名
 * @returns {Promise} - 发送结果
 */
const sendWelcomeEmail = async (to, userName) => {
  const subject = '欢迎加入广告平台';
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">欢迎加入广告平台，${userName || '尊敬的用户'}！</h2>
      <p>感谢您注册我们的服务。我们很高兴能够为您提供广告管理和投放服务。</p>
      <p>以下是一些您可能会感兴趣的资源：</p>
      <ul>
        <li><a href="${config.server.host}:${config.server.port}/api/v1/docs">API文档</a></li>
        <li><a href="${config.server.host}:${config.server.port}/api/v1/help">帮助中心</a></li>
      </ul>
      <p>如果您有任何问题，请随时联系我们的支持团队。</p>
      <p>祝您使用愉快！</p>
      <p>广告平台团队</p>
    </div>
  `;
  
  const text = `欢迎加入广告平台，${userName || '尊敬的用户'}！\n\n感谢您注册我们的服务。我们很高兴能够为您提供广告管理和投放服务。\n\n如果您有任何问题，请随时联系我们的支持团队。\n\n祝您使用愉快！\n广告平台团队`;
  
  return sendEmail({
    to,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
