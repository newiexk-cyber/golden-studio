const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * Cấu hình HTTP Security Headers bằng Helmet
 */
const helmetConfig = helmet({
    contentSecurityPolicy: false, // Để frontend tự do nhúng ảnh Drive và scripts
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

/**
 * Cấu hình CORS Whitelist
 */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép các request không có origin (như Postman, cURL, server-to-server)
        // hoặc khi đang ở môi trường dev, hoặc nếu origin nằm trong danh sách whitelist
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(allowed => 
            normalizedOrigin === allowed || normalizedOrigin.endsWith('.pages.dev')
        );

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error(`CORS Error: Origin '${origin}' không được phép truy cập API này.`));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight trong 24 giờ
};

/**
 * Giới hạn tần suất gọi API chung (Chống DoS / Brute-force)
 */
const generalLimiter = rateLimit({
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút."
    }
});

/**
 * Giới hạn tần suất gửi Đặt Lịch (Chống Spam Bot vào Form)
 */
const bookingLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 phút
    max: parseInt(process.env.BOOKING_RATE_LIMIT_MAX, 10) || 5, // Tối đa 5 lượt gửi trong 10 phút
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Bạn đã gửi yêu cầu đặt lịch nhiều lần liên tiếp. Vui lòng chờ vài phút hoặc liên hệ trực tiếp qua Zalo/Hotline."
    }
});

module.exports = {
    helmetConfig,
    corsMiddleware: cors(corsOptions),
    generalLimiter,
    bookingLimiter
};
