require('dotenv').config();
const express = require('express');
const { helmetConfig, corsMiddleware, generalLimiter } = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Bật trust proxy khi chạy sau Cloudflare / Nginx / Render Reverse Proxy
app.set('trust proxy', 1);

// 1. Áp dụng các tầng Middleware bảo mật
app.use(helmetConfig);
app.use(corsMiddleware);
app.use(generalLimiter);

// 2. Parser dữ liệu
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Logger đơn giản
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toLocaleTimeString('vi-VN')}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// 4. Định tuyến API
app.use('/api', apiRoutes);

// 5. Trang chào mừng cho root /
app.get('/', (req, res) => {
    res.json({
        service: "Golden Studio Backend API (BFF)",
        status: "RUNNING",
        documentation: "/api/health",
        endpoints: [
            "/api/health",
            "/api/concepts",
            "/api/booking"
        ]
    });
});

// 6. Xử lý 404 và Lỗi
app.use(notFoundHandler);
app.use(errorHandler);

// 7. Khởi động Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 [GOLDEN STUDIO] Backend API đang chạy tại:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`👉 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`👉 Concepts API: http://localhost:${PORT}/api/concepts`);
    console.log(`🛡️ Chế độ: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
});
