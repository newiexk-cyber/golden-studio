/**
 * ==============================================================================
 * 🌟 STUDIO_CONFIG - TRUNG TÂM CẤU HÌNH WEBSITE GOLDEN STUDIO (MINIMALISM)
 * ==============================================================================
 */

const STUDIO_CONFIG = {
    // --------------------------------------------------------------------------
    // 1. THÔNG TIN THƯƠNG HIỆU (BRANDING)
    // --------------------------------------------------------------------------
    branding: {
        studioName: "GOLDEN STUDIO",
        studioTagline: "CONTEMPORARY & EDITORIAL PHOTOGRAPHY",
        establishedYear: "2026",
    },

    // --------------------------------------------------------------------------
    // 2. KẾT NỐI BACKEND API EXPRESS & GOOGLE SHEETS
    // --------------------------------------------------------------------------
    backendApi: {
        enabled: true,
        // Điền URL backend khi deploy lên Render/Railway (Ví dụ: "https://golden-studio-api.onrender.com")
        // Hoặc "http://localhost:5000" khi test dưới máy local. Để trống "" để tự động fallback Google Sheets trực tiếp.
        baseUrl: "",
    },

    googleSheets: {
        enabled: true,
        sheetId: "1oMuNluQ6hKDzf-_nj8No1CM4Ez0fSYlHYDsrHdgzjcI",
        sheetGid: "0",
        driveFolderId: "1WQRFi6lQqTgkEtvRijZCX--sHTUjroUL",
        sheetName: "cập nhật concept",
    },

    // --------------------------------------------------------------------------
    // 3. HÌNH BÌA SLIDER TRANG CHỦ TỰ ĐỘNG CHUYỂN ĐỘNG (HERO COVER SLIDER)
    // --------------------------------------------------------------------------
    heroSlider: {
        autoplaySpeed: 5000, // Tự động chuyển ảnh sau 5 giây (5000ms)
        slides: [
            {
                image: "images/banner-1.jpg",
                tag: "✦ GOLDEN STUDIO SIGNATURE",
                title: "TÔN VINH VẺ ĐẸP CẢM XÚC & NÀNG THƠ",
                subtitle: "Không gian studio ấm cúng kết hợp cùng nghệ thuật ánh sáng tinh tế, khắc họa chân thực thần thái và vẻ đẹp riêng biệt của bạn.",
                ctaPrimary: "ĐẶT LỊCH HẸN",
                ctaSecondary: "XEM BẢNG GIÁ",
            },
            {
                image: "images/banner-2.jpg",
                tag: "✦ HIGH-FASHION & DRAMATIC NOIR",
                title: "NGHỆ THUẬT THỊ GIÁC ĐIỆN ẢNH ĐỘC BẢN",
                subtitle: "Đầu tư bối cảnh công phu, tone đỏ hoàng gia huyền bí cùng phong cách trang điểm concept tạo nên những tác phẩm xuất sắc nhất.",
                ctaPrimary: "KHÁM PHÁ BỘ ẢNH",
                ctaSecondary: "TƯ VẤN GÓI CHỤP",
            }
        ]
    },

    // --------------------------------------------------------------------------
    // 4. CÁC ĐỀ MỤC VĂN BẢN (DYNAMIC HEADINGS & TEXTS)
    // --------------------------------------------------------------------------
    headings: {
        nav: {
            portfolio: "PORTFOLIO",
            pricing: "BẢNG GIÁ & PHÂN KHÚC",
            about: "TRIẾT LÝ NGHỆ THUẬT",
            contact: "LIÊN HỆ",
            bookNow: "ĐẶT LỊCH HẸN",
        },

        portfolio: {
            allTabLabel: "ALL WORKS",
        },

        pricing: {
            tag: "PRICING & SEGMENTS",
            title: "PHÂN KHÚC DỊCH VỤ & BẢNG GIÁ",
            subtitle: "Hệ thống gói chụp được phân tầng minh bạch từ cơ bản đến độc bản may đo riêng.",
        },

        about: {
            quote: "“Chúng tôi không chỉ ghi lại hình ảnh, chúng tôi kiến tạo ngôn ngữ thị giác và cảm xúc độc bản cho từng khách hàng.”",
            author: "GOLDEN STUDIO — CREATIVE DIRECTOR",
        },

        contact: {
            tag: "GET IN TOUCH",
            title: "KẾT NỐI VÀ ĐẶT LỊCH",
            subtitle: "Hãy để chúng tôi đồng hành cùng bạn trong buổi chụp ảnh tiếp theo.",
        },

        footer: {
            copyright: "© 2026 GOLDEN STUDIO. ALL RIGHTS RESERVED.",
        }
    },

    // --------------------------------------------------------------------------
    // 5. THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI (CONTACT & SOCIALS)
    // --------------------------------------------------------------------------
    contact: {
        hotline: "0387 244 387",
        zaloUrl: "https://zalo.me/0387244387",
        mapUrl: "https://maps.app.goo.gl/7dGpQ6c3dHyFEKJN6",
        messengerUrl: "https://m.me/100094054747317",
        email: "hoangthetoan07061996@gmail.com",
        address: "GOLDEN Studio — Xem bản đồ chỉ đường",
        socials: {
            facebook: "https://www.facebook.com/profile.php?id=100094054747317",
            instagram: "https://www.instagram.com/golden_studio192/",
            tiktok: "https://www.tiktok.com/@golden_studio1",
            youtube: "https://www.youtube.com/@goldenstudio",
        }
    },

    // --------------------------------------------------------------------------
    // 6. CÁC PHÂN KHÚC GÓI CHỤP (PRICING SEGMENTS)
    // --------------------------------------------------------------------------
    packages: [
        {
            id: "basic",
            segment: "BASIC SEGMENT",
            name: "GÓI BASIC",
            price: "2.500.000 đ",
            priceSub: "/ concept",
            featured: false,
            badge: "",
            features: [
                "<strong>CONCEPT:</strong> Beauty, thời trang, profile cơ bản.",
                "<strong>BACKGROUND:</strong> Background phông trơn, set up đèn phù hợp.",
                "<strong>TRANG PHỤC:</strong> 01 outfit, 1 nail cơ bản.",
                "<strong>MAKEUP – TÓC:</strong> Makeup + Tóc phù hợp với concept.",
                "<strong>SỐ LƯỢNG ẢNH:</strong> 06 ảnh chỉnh sửa + gửi toàn bộ file gốc.",
                "<strong>HỖ TRỢ:</strong> Hướng dẫn tạo dáng pose trong set chụp.",
                "<strong>THỜI GIAN CHỤP:</strong> 30 phút – 45 phút."
            ]
        },
        {
            id: "standard",
            segment: "STANDARD SEGMENT",
            name: "GÓI STANDARD",
            price: "3.500.000 đ",
            priceSub: "/ concept",
            featured: true,
            badge: "POPULAR",
            features: [
                "<strong>CONCEPT:</strong> Đa dạng concept: nàng thơ, cá tính, sexy, fashion,…",
                "<strong>BACKGROUND:</strong> Setup theo từng concept và có đạo cụ riêng đi kèm.",
                "<strong>TRANG PHỤC:</strong> 01 outfit theo concept riêng, kèm phụ kiện, nail thiết kế.",
                "<strong>MAKEUP – TÓC:</strong> Makeup riêng theo từng concept. Có hairstylist riêng tạo kiểu.",
                "<strong>SỐ LƯỢNG ẢNH:</strong> 08 ảnh chỉnh sửa + gửi toàn bộ file gốc.",
                "<strong>HỖ TRỢ:</strong> Hỗ trợ tạo dáng, takecare outfit và quay video trong suốt buổi chụp.",
                "<strong>THỜI GIAN CHỤP:</strong> 50 phút – 1 tiếng 30 phút."
            ]
        },
        {
            id: "premium",
            segment: "PREMIUM SEGMENT",
            name: "GÓI PREMIUM",
            price: "5.000.000 đ",
            priceSub: "/ concept",
            featured: false,
            badge: "VIP",
            features: [
                "<strong>CONCEPT:</strong> Concept độc quyền, thiết kế riêng theo phong cách của Studio.",
                "<strong>BACKGROUND:</strong> Studio setup riêng theo concept độc quyền.",
                "<strong>TRANG PHỤC:</strong> Trang phục riêng theo concept, kèm phụ kiện và nail thiết kế.",
                "<strong>MAKEUP – TÓC:</strong> Makeup & hairstylist thiết kế riêng theo concept, hair stylist riêng.",
                "<strong>SỐ LƯỢNG ẢNH:</strong> 08 ảnh chỉnh sửa + gửi toàn bộ file gốc.",
                "<strong>HỖ TRỢ:</strong> Hỗ trợ tạo dáng, takecare outfit và quay video trong suốt buổi chụp.",
                "<strong>THỜI GIAN CHỤP:</strong> Thời gian chụp không giới hạn."
            ]
        }
    ],

    // --------------------------------------------------------------------------
    // 6.1 LƯU Ý DÀNH CHO KHÁCH HÀNG (CUSTOMER POLICY & NOTES)
    // --------------------------------------------------------------------------
    customerNotes: {
        title: "LƯU Ý DÀNH CHO KHÁCH HÀNG",
        studioName: "GOLDEN Studio",
        hotline: "0387 244 387",
        zaloUrl: "https://zalo.me/0387244387",
        mapUrl: "https://maps.app.goo.gl/7dGpQ6c3dHyFEKJN6",
        items: [
            { type: "check", text: "Quý khách hàng cọc trước 1.000.000đ/bộ, phần còn lại sẽ thanh toán sau khi chụp xong." },
            { type: "check", text: "Hỗ trợ dời lịch 1 lần nếu khách hàng thanh toán đầy đủ gói chụp và phí trang phục để giữ lịch." },
            { type: "check", text: "Khách hàng sẽ nhận được ảnh chỉnh sửa sau 8–10 ngày (kể từ khi chọn ảnh)." },
            { type: "check", text: "Phụ thu 2.000.000đ đối với trang phục thứ 2 cùng bối cảnh hoặc tường vô cực." },
            { type: "check", text: "Ảnh Edit tiêu chuẩn: 8 ảnh / 1 bộ." },
            { type: "check", text: "Ảnh chỉnh sửa thêm: 100k/ảnh." },
            { type: "surcharge", text: "Phụ thu đối với: Những set up cần sử dụng riêng cho buổi chụp như hoa tươi, bánh kem tươi,… hoặc các props studio chưa có sẵn, cần làm mới, thiết kế cầu kỳ hay trang phục ngoài concept. Các khoản phụ thu bên mình sẽ trao đổi và báo trước với bạn để bạn nắm rõ chi phí trước khi chụp." },
            { type: "warning", text: "Tiền cọc sẽ không được hoàn lại nếu khách hủy gói chụp." }
        ]
    },

    // --------------------------------------------------------------------------
    // 7. DỮ LIỆU ALBUM MẪU SẴN CÓ (FALLBACK DATA)
    // --------------------------------------------------------------------------
    defaultConcepts: [
        {
            stt: 1,
            title: "Muse In White",
            categories: ["Nữ", "Beauty", "Nàng Thơ"],
            price: "3.500.000 đ",
            bestSeller: true,
            thumbnail: "images/banner-1.jpg",
            images: [
                "images/banner-1.jpg"
            ]
        },
        {
            stt: 2,
            title: "Crimson Butterfly Noir",
            categories: ["Nữ", "Fashion", "Heritage", "Cổ Trang"],
            price: "4.500.000 đ",
            bestSeller: true,
            thumbnail: "images/banner-2.jpg",
            images: [
                "images/banner-2.jpg"
            ]
        },
        {
            stt: 3,
            title: "Bạch Nguyệt Quang",
            categories: ["Nữ", "Beauty", "Nàng Thơ"],
            price: "3.500.000 đ",
            bestSeller: true,
            thumbnail: "https://tranvubang.com/wp-content/uploads/2026/07/Standard-Bach-Nguyet-Quang.jpg",
            images: [
                "https://tranvubang.com/wp-content/uploads/2026/07/Standard-Bach-Nguyet-Quang.jpg",
                "https://tranvubang.com/wp-content/uploads/2026/06/Main-Quytquyt-Beauty.jpg"
            ]
        },
        {
            stt: 4,
            title: "Quýt Quýt Beauty",
            categories: ["Nữ", "Beauty", "Fashion"],
            price: "4.500.000 đ",
            bestSeller: true,
            thumbnail: "https://tranvubang.com/wp-content/uploads/2026/06/Main-Quytquyt-Beauty.jpg",
            images: [
                "https://tranvubang.com/wp-content/uploads/2026/06/Main-Quytquyt-Beauty.jpg"
            ]
        },
        {
            stt: 5,
            title: "Cinematic Mood Noir",
            categories: ["Nam", "Fashion", "Cinematic"],
            price: "4.000.000 đ",
            bestSeller: false,
            thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            stt: 6,
            title: "Eternal Romance",
            categories: ["Couple", "Wedding"],
            price: "6.500.000 đ",
            bestSeller: true,
            thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            stt: 7,
            title: "Minimalist Studio Editorial",
            categories: ["Fashion", "Nữ"],
            price: "5.000.000 đ",
            bestSeller: false,
            thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
            ]
        },
        {
            stt: 8,
            title: "Gentlemen Executive",
            categories: ["Nam", "Profile"],
            price: "4.500.000 đ",
            bestSeller: false,
            thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"
            ]
        }
    ]
};

window.STUDIO_CONFIG = STUDIO_CONFIG;
