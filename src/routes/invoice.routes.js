const express = require('express');
const router = express.Router();
const { 
  getInvoices, 
  getInvoice, 
  requestInvoice, 
  updateInvoice,
  cancelInvoice,
  downloadInvoice,
  updateInvoiceStatus,
  generateInvoicePdf,
  previewInvoice,
  getEligiblePayments
} = require('../controllers/invoiceController');

const { protect, authorize } = require('../middlewares/auth');

// 保护所有路由，需要登录
router.use(protect);

// 获取可开票的支付记录
router.get('/eligible-payments', getEligiblePayments);

// 基本发票路由
router
  .route('/')
  .get(getInvoices)     // 获取用户所有发票
  .post(requestInvoice); // 申请发票

// 单个发票路由
router
  .route('/:id')
  .get(getInvoice)     // 获取单个发票
  .put(updateInvoice)  // 更新发票信息
  .delete(cancelInvoice); // 取消发票申请

// 下载发票
router.get('/:id/download', downloadInvoice);

// 预览发票
router.get('/:id/preview', previewInvoice);

// 管理员生成发票PDF
router.post('/:id/generate', authorize('admin'), generateInvoicePdf);

// 管理员更新发票状态
router.put('/:id/status', authorize('admin'), updateInvoiceStatus);

module.exports = router; 