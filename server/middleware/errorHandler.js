/**
 * Middleware bắt lỗi tập trung (Centralized Error Handler)
 * Ngăn chặn việc để lộ Stack Trace hoặc thông tin nhạy cảm của Server ra bên ngoài
 */
function errorHandler(err, req, res, next) {
    console.error(`❌ [ERROR] ${req.method} ${req.url}:`, err.message || err);

    const isProduction = process.env.NODE_ENV === 'production';
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        error: isProduction && statusCode === 500 
            ? 'Đã xảy ra sự cố nội bộ trên máy chủ. Vui lòng thử lại sau.' 
            : (err.message || 'Lỗi không xác định'),
        timestamp: new Date().toISOString()
    });
}

/**
 * Xử lý khi truy cập route không tồn tại (404 Not Found)
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: `Tài nguyên '${req.originalUrl}' không tồn tại trên hệ thống.`,
        availableEndpoints: [
            "GET  /api/health",
            "GET  /api/concepts",
            "POST /api/booking"
        ]
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
