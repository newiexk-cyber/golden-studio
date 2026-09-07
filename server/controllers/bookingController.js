const axios = require('axios');

/**
 * Xóa ký tự độc hại (Sanitization cơ bản phòng chống XSS)
 */
function sanitizeInput(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/[<>]/g, '') // Chặn thẻ HTML nhúng
        .slice(0, 200);       // Giới hạn độ dài tránh tràn bộ đệm
}

/**
 * Kiểm tra định dạng số điện thoại Việt Nam hợp lệ
 */
function isValidVietnamesePhone(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    const phoneRegex = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    return phoneRegex.test(cleanPhone);
}

/**
 * Gửi thông báo ngầm qua Webhook (nếu được cấu hình)
 */
async function sendNotificationWebhook(booking) {
    // 1. Discord Webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
        try {
            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                embeds: [{
                    title: "🔔 YÊU CẦU ĐẶT LỊCH MỚI - GOLDEN STUDIO",
                    color: 0xD4AF37, // Gold color
                    fields: [
                        { name: "Họ và Tên", value: booking.name, inline: true },
                        { name: "Số Điện Thoại", value: booking.phone, inline: true },
                        { name: "Concept Quan Tâm", value: booking.concept || "Chưa chọn", inline: false },
                        { name: "Ngày Dự Kiến", value: booking.date || "Chưa chọn", inline: true },
                        { name: "Thời Gian Gửi", value: booking.createdAt, inline: true },
                    ],
                    footer: { text: "Golden Studio Security Backend" }
                }]
            }, { timeout: 5000 });
        } catch (err) {
            console.error("⚠️ Không thể gửi thông báo tới Discord Webhook:", err.message);
        }
    }

    // 2. Telegram Bot Webhook
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
            const text = `🔔 *YÊU CẦU ĐẶT LỊCH MỚI - GOLDEN STUDIO*\n\n` +
                `👤 *Họ tên:* ${booking.name}\n` +
                `📱 *SĐT:* ${booking.phone}\n` +
                `📷 *Concept:* ${booking.concept || "Chưa chọn"}\n` +
                `📅 *Ngày dự kiến:* ${booking.date || "Chưa chọn"}\n` +
                `⏰ *Thời gian:* ${booking.createdAt}`;

            const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
            await axios.post(url, {
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            }, { timeout: 5000 });
        } catch (err) {
            console.error("⚠️ Không thể gửi thông báo tới Telegram Bot:", err.message);
        }
    }
}

/**
 * Controller: Nhận và xử lý form Đặt lịch từ Website
 */
async function handleBooking(req, res, next) {
    try {
        const { name, phone, concept, date, notes } = req.body || {};

        const cleanName = sanitizeInput(name);
        const cleanPhone = sanitizeInput(phone);
        const cleanConcept = sanitizeInput(concept);
        const cleanDate = sanitizeInput(date);
        const cleanNotes = sanitizeInput(notes);

        if (!cleanName || cleanName.length < 2) {
            return res.status(400).json({
                success: false,
                error: "Họ tên không được để trống và phải có ít nhất 2 ký tự."
            });
        }

        if (!cleanPhone || !isValidVietnamesePhone(cleanPhone)) {
            return res.status(400).json({
                success: false,
                error: "Số điện thoại không đúng định dạng di động Việt Nam hợp lệ (10 chữ số)."
            });
        }

        const booking = {
            id: `BK-${Date.now()}`,
            name: cleanName,
            phone: cleanPhone,
            concept: cleanConcept || 'Tư vấn theo phong cách',
            date: cleanDate || 'Linh hoạt',
            notes: cleanNotes || '',
            createdAt: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            ip: req.ip || req.headers['x-forwarded-for'] || 'Unknown'
        };

        console.log(`📋 [BOOKING] Khách hàng mới: ${booking.name} | SĐT: ${booking.phone} | Concept: ${booking.concept}`);

        // Gửi thông báo ngầm (không chặn luồng phản hồi cho khách)
        sendNotificationWebhook(booking).catch(() => {});

        res.status(200).json({
            success: true,
            message: "Yêu cầu đặt lịch của bạn đã được ghi nhận an toàn vào hệ thống Golden Studio. Chuyên viên sẽ liên hệ trong vòng 15 phút.",
            bookingId: booking.id
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    handleBooking
};
