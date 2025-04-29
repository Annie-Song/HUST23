const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const User = require('../models/User');
const errorHandler = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    获取用户所有发票
 * @route   GET /api/v1/invoices
 * @access  私有
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .sort('-requestedAt')
      .populate({
        path: 'payments',
        select: 'amount type status createdAt'
      });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取单个发票
 * @route   GET /api/v1/invoices/:id
 * @access  私有
 */
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: 'payments',
      select: 'amount type status createdAt'
    });

    if (!invoice) {
      return next(new errorHandler.ErrorResponse('找不到该发票', 404));
    }

    // 确保用户只能查看自己的发票
    if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new errorHandler.ErrorResponse('无权查看此发票', 403));
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    申请发票
 * @route   POST /api/v1/invoices
 * @access  私有
 */
exports.requestInvoice = async (req, res, next) => {
  try {
    // 添加用户ID到请求体
    req.body.user = req.user.id;

    // 检查关联的支付记录是否存在且属于该用户
    if (req.body.payments && req.body.payments.length > 0) {
      for (const paymentId of req.body.payments) {
        const payment = await Payment.findById(paymentId);
        
        if (!payment) {
          return next(new errorHandler.ErrorResponse(`支付记录 ${paymentId} 不存在`, 404));
        }
        
        if (payment.user.toString() !== req.user.id) {
          return next(new errorHandler.ErrorResponse(`支付记录 ${paymentId} 不属于当前用户`, 403));
        }
        
        if (payment.status !== 'completed') {
          return next(new errorHandler.ErrorResponse(`只能为已完成的支付申请发票`, 400));
        }
      }
    }

    // 如果用户有默认发票信息，使用默认信息填充未提供的字段
    if (!req.body.title || !req.body.type) {
      const user = await User.findById(req.user.id);
      
      if (user.defaultInvoiceInfo) {
        if (!req.body.title && user.defaultInvoiceInfo.title) {
          req.body.title = user.defaultInvoiceInfo.title;
        }
        
        if (!req.body.type && user.defaultInvoiceInfo.type) {
          req.body.type = user.defaultInvoiceInfo.type;
        }
        
        if (!req.body.taxNumber && user.defaultInvoiceInfo.taxNumber) {
          req.body.taxNumber = user.defaultInvoiceInfo.taxNumber;
        }
        
        if (!req.body.bankName && user.defaultInvoiceInfo.bankName) {
          req.body.bankName = user.defaultInvoiceInfo.bankName;
        }
        
        if (!req.body.bankAccount && user.defaultInvoiceInfo.bankAccount) {
          req.body.bankAccount = user.defaultInvoiceInfo.bankAccount;
        }
        
        if (!req.body.companyAddress && user.defaultInvoiceInfo.address) {
          req.body.companyAddress = user.defaultInvoiceInfo.address;
        }
        
        if (!req.body.companyPhone && user.defaultInvoiceInfo.phone) {
          req.body.companyPhone = user.defaultInvoiceInfo.phone;
        }
      }
    }

    // 创建发票
    const invoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    更新发票信息
 * @route   PUT /api/v1/invoices/:id
 * @access  私有
 */
exports.updateInvoice = async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return next(new errorHandler.ErrorResponse('找不到该发票', 404));
    }

    // 确保用户只能更新自己的发票，管理员可以更新任何发票
    if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new errorHandler.ErrorResponse('无权更新此发票', 403));
    }

    // 只有待处理的发票可以更新
    if (invoice.status !== 'pending' && req.user.role !== 'admin') {
      return next(new errorHandler.ErrorResponse('只能更新待处理的发票', 400));
    }

    // 更新发票
    invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    取消发票申请
 * @route   DELETE /api/v1/invoices/:id
 * @access  私有
 */
exports.cancelInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return next(new errorHandler.ErrorResponse('找不到该发票', 404));
    }

    // 确保用户只能取消自己的发票，管理员可以取消任何发票
    if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new errorHandler.ErrorResponse('无权取消此发票', 403));
    }

    // 只有待处理和处理中的发票可以取消
    if (invoice.status !== 'pending' && invoice.status !== 'processing' && req.user.role !== 'admin') {
      return next(new errorHandler.ErrorResponse('只能取消待处理或处理中的发票', 400));
    }

    // 更新发票状态为已取消
    await invoice.updateStatus('cancelled', { notes: req.body.notes || '用户取消' });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    下载发票
 * @route   GET /api/v1/invoices/:id/download
 * @access  私有
 */
exports.downloadInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return next(new errorHandler.ErrorResponse('找不到该发票', 404));
    }

    // 确保用户只能下载自己的发票
    if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new errorHandler.ErrorResponse('无权下载此发票', 403));
    }

    // 检查发票是否已开具
    if (invoice.status !== 'issued' && invoice.status !== 'mailed' && invoice.status !== 'received') {
      return next(new errorHandler.ErrorResponse('此发票尚未开具，无法下载', 400));
    }

    // 检查发票是否有下载链接
    if (!invoice.downloadUrl) {
      return next(new errorHandler.ErrorResponse('此发票暂无电子版本', 404));
    }

    // 如果有本地存储的文件，则返回文件
    // 这里使用重定向到下载URL，实际项目中可能需要从文件系统或云存储中获取文件
    res.redirect(invoice.downloadUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    管理员更新发票状态
 * @route   PUT /api/v1/invoices/:id/status
 * @access  私有 (仅管理员)
 */
exports.updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status, details } = req.body;
    
    if (!status) {
      return next(new errorHandler.ErrorResponse('请提供更新的状态', 400));
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return next(new errorHandler.ErrorResponse('找不到该发票', 404));
    }

    // 更新发票状态
    await invoice.updateStatus(status, details);

    // 如果状态更新为已开具，则标记相关支付记录为已开票
    if (status === 'issued' && invoice.payments && invoice.payments.length > 0) {
      for (const paymentId of invoice.payments) {
        await Payment.findByIdAndUpdate(paymentId, { invoiced: true });
      }
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    生成发票PDF
 * @route   POST /api/v1/invoices/:id/generate
 * @access  私有 (仅管理员)
 */
exports.generateInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: 'payments',
      select: 'amount type status createdAt description'
    }).populate({
      path: 'user',
      select: 'name email phone company'
    });

    if (!invoice) {
      return next(new errorHandler.ErrorResponse('找不到该发票', 404));
    }

    // 生成发票号和发票代码
    const invoiceNumber = req.body.invoiceNumber || generateInvoiceNumber();
    const invoiceCode = req.body.invoiceCode || generateInvoiceCode();
    
    // 此处应该有生成PDF的逻辑
    // 实际项目中应该使用PDF生成库如PDFKit或调用专门的发票服务
    
    // 生成下载URL (实际项目需要存储PDF并返回真实URL)
    const downloadUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/invoices/pdf/${invoice._id}.pdf`;
    
    // 更新发票状态为已开具
    await invoice.updateStatus('issued', {
      issuedAt: new Date(),
      invoiceNumber,
      invoiceCode,
      downloadUrl
    });
    
    // 标记相关支付记录为已开票
    if (invoice.payments && invoice.payments.length > 0) {
      for (const payment of invoice.payments) {
        await Payment.findByIdAndUpdate(payment._id, { invoiced: true });
      }
    }

    res.status(200).json({
      success: true,
      message: '发票已生成',
      data: {
        invoice,
        downloadUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    预览发票
 * @route   GET /api/v1/invoices/:id/preview
 * @access  私有
 */
exports.previewInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({
      path: 'payments',
      select: 'amount type status createdAt description'
    });

    if (!invoice) {
      return next(new errorHandler.ErrorResponse('找不到该发票', 404));
    }

    // 确保用户只能预览自己的发票
    if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new errorHandler.ErrorResponse('无权预览此发票', 403));
    }

    // 获取申请人信息
    const user = await User.findById(invoice.user).select('name email phone company');

    // 构建预览数据
    const previewData = {
      invoice: {
        ...invoice.toObject(),
        user: user
      },
      // 发票预览相关配置
      config: {
        title: '发票预览',
        logo: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/logo.png`,
        company: '广告平台有限公司',
        address: '北京市海淀区中关村大街1号',
        phone: '010-12345678',
        bank: '中国银行',
        account: '6222020200123456789'
      }
    };

    res.status(200).json({
      success: true,
      data: previewData
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    获取未开票的支付记录
 * @route   GET /api/v1/invoices/eligible-payments
 * @access  私有
 */
exports.getEligiblePayments = async (req, res, next) => {
  try {
    // 获取用户已完成但未开票的支付记录
    const eligiblePayments = await Payment.find({
      user: req.user.id,
      status: 'completed',
      invoiced: false
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: eligiblePayments.length,
      data: eligiblePayments
    });
  } catch (err) {
    next(err);
  }
};

// 辅助函数：生成发票号
function generateInvoiceNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV${timestamp.slice(-8)}${random}`;
}

// 辅助函数：生成发票代码
function generateInvoiceCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${random}`;
} 