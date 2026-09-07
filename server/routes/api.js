const express = require('express');
const router = express.Router();
const { getConcepts } = require('../controllers/conceptController');
const { handleBooking } = require('../controllers/bookingController');
const { bookingLimiter } = require('../middleware/security');

/**
 * GET /api/health
 * Kiểm tra trạng thái máy chủ
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: "OPERATIONAL",
        service: "Golden Studio Backend API",
        version: "1.0.0",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/concepts
 * Lấy danh sách Concepts đã được chuẩn hóa & bảo mật
 * Hỗ trợ: ?category=..., ?bestseller=true, ?search=..., ?refresh=true
 */
router.get('/concepts', getConcepts);

/**
 * POST /api/booking
 * Nhận và xử lý yêu cầu đặt lịch (Có rate-limiter chống spam)
 */
router.post('/booking', bookingLimiter, handleBooking);

module.exports = router;
