const axios = require('axios');

// In-memory Cache store
let cache = {
    data: null,
    timestamp: 0
};

/**
 * Chuyển đổi link Google Drive sang link Thumbnail trực tiếp tốc độ cao
 */
function driveToDirectUrl(url, sz = 'w800') {
    if (!url || typeof url !== 'string') return url;
    const trimmed = url.trim();

    function toThumbnail(fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}`;
    }

    // drive.google.com/file/d/FILE_ID/view
    const m1 = trimmed.match(/drive\.google\.com\/file\/d\/([^/&#?]+)/);
    if (m1) return toThumbnail(m1[1]);

    // drive.google.com/open?id=FILE_ID
    const m2 = trimmed.match(/drive\.google\.com\/open\?id=([^&#?]+)/);
    if (m2) return toThumbnail(m2[1]);

    // drive.google.com/uc?id=FILE_ID
    const m3 = trimmed.match(/[?&]id=([^&#?]+)/);
    if (m3 && trimmed.includes("drive.google.com")) return toThumbnail(m3[1]);

    if (trimmed.includes("drive.google.com/thumbnail")) {
        const m4 = trimmed.match(/[?&]id=([^&#?]+)/);
        if (m4) return toThumbnail(m4[1]);
    }

    return trimmed;
}

/**
 * Bộ phân tích cú pháp CSV an toàn (hỗ trợ ngoặc kép và dấu phẩy)
 */
function parseCSV(text) {
    let r = [];
    let q = false;
    let row = [''];
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        let nextChar = text[i + 1];
        if (c === '"') {
            if (q && nextChar === '"') {
                row[row.length - 1] += '"';
                i++;
            } else {
                q = !q;
            }
        } else if (c === ',' && !q) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !q) {
            if (c === '\r' && nextChar === '\n') { i++; }
            r.push(row);
            row = [''];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== '') { r.push(row); }
    return r;
}

/**
 * Tải và chuẩn hóa dữ liệu từ Google Sheets
 */
async function fetchAndParseGoogleSheets() {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const gid = process.env.GOOGLE_SHEET_GID || '0';

    if (!sheetId) {
        throw new Error('Chưa cấu hình GOOGLE_SHEET_ID trong biến môi trường');
    }

    // Gọi trực tiếp CSV export endpoint từ Google Sheets (Server-side)
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    const response = await axios.get(exportUrl, {
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GoldenStudio-Backend/1.0'
        }
    });

    const csvData = response.data;
    if (!csvData || typeof csvData !== 'string') {
        throw new Error('Dữ liệu trả về từ Google Sheets trống hoặc không hợp lệ');
    }

    const rows = parseCSV(csvData);
    if (!rows || rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(h => h.trim());
    const concepts = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || row.every(cell => cell.trim() === '')) continue;

        const rowObj = {};
        headers.forEach((header, idx) => {
            rowObj[header] = (row[idx] || '').trim();
        });

        // Hàm lấy giá trị linh hoạt theo mảng alias
        function getVal(keys, defaultVal = '') {
            const lowerKeys = keys.map(k => k.toLowerCase().trim());
            for (const [k, v] of Object.entries(rowObj)) {
                if (lowerKeys.includes(k.toLowerCase().trim())) {
                    if (v !== undefined && v !== null && String(v).trim() !== '') {
                        return String(v).trim();
                    }
                }
            }
            return defaultVal;
        }

        const title = getVal(['Tên concept', 'Tên Concept', 'Concept', 'Title', 'Name'], `Concept #${i}`);
        const branch = getVal(['Chi nhánh', 'Chi Nhánh', 'Branch'], '');
        const rawCategories = getVal(['Chủ đề', 'Chủ Đề', 'Category', 'Danh mục'], '');
        const price = getVal(['Giá gói', 'Giá', 'Price'], '');
        const desc = getVal(['Mô tả', 'Mô tả ngắn', 'Description'], '');

        const categories = rawCategories
            ? rawCategories.split(/[,;\/]+/).map(c => c.trim()).filter(Boolean)
            : ['Tất cả'];

        const coverRaw = getVal(['Ảnh đại diện', 'Ảnh đại diện (Bìa)', 'Cover Image', 'Cover', 'Ảnh bìa'], '');
        const coverImage = driveToDirectUrl(coverRaw, 'w800');

        // Tập hợp danh sách ảnh chi tiết
        const galleryImages = [];
        const seenUrls = new Set();

        if (coverRaw) {
            const highResCover = driveToDirectUrl(coverRaw, 'w1600');
            galleryImages.push(highResCover);
            seenUrls.add(highResCover);
        }

        for (const [key, value] of Object.entries(rowObj)) {
            const keyLower = key.toLowerCase();
            const isImageKey = keyLower.includes('ảnh') || 
                               keyLower.includes('image') || 
                               keyLower.includes('photo') || 
                               keyLower.includes('pic') || 
                               /^ảnh\s*\d+/i.test(keyLower);

            const isCoverKey = keyLower.includes('bìa') || keyLower.includes('cover');

            if (isImageKey && !isCoverKey && value && value.trim() !== '') {
                const highResUrl = driveToDirectUrl(value.trim(), 'w1600');
                if (!seenUrls.has(highResUrl)) {
                    seenUrls.add(highResUrl);
                    galleryImages.push(highResUrl);
                }
            }
        }

        const stt = parseInt(getVal(['STT', 'Số thứ tự', 'Order'], String(i)), 10) || i;
        const bestSellerVal = getVal(['Best Seller', 'Bestseller', 'Nổi bật', 'Featured'], 'false').toLowerCase();
        const bestSeller = bestSellerVal === 'true' || bestSellerVal === 'có' || bestSellerVal === '1' || bestSellerVal === 'yes';

        concepts.push({
            id: `concept-${stt}`,
            stt,
            title,
            branch: branch || 'Hồ Chí Minh',
            categories,
            coverImage: coverImage || 'images/banner-1.jpg',
            galleryImages: galleryImages.length > 0 ? galleryImages : [coverImage || 'images/banner-1.jpg'],
            price: price || 'Liên hệ',
            desc: desc || `Bộ sưu tập ảnh phong cách ${title} được thực hiện bởi đội ngũ nghệ thuật Golden Studio.`,
            bestSeller
        });
    }

    // Sắp xếp theo thứ tự STT
    concepts.sort((a, b) => a.stt - b.stt);
    return concepts;
}

/**
 * Controller: Lấy danh sách Concepts (có Cache & Lọc)
 */
async function getConcepts(req, res, next) {
    try {
        const ttl = (parseInt(process.env.CACHE_TTL_SECONDS, 10) || 300) * 1000;
        const forceRefresh = req.query.refresh === 'true';
        const now = Date.now();

        let concepts = [];
        let fromCache = false;

        if (!forceRefresh && cache.data && (now - cache.timestamp < ttl)) {
            concepts = cache.data;
            fromCache = true;
        } else {
            concepts = await fetchAndParseGoogleSheets();
            cache.data = concepts;
            cache.timestamp = now;
        }

        // Lọc theo query params nếu có
        let filtered = [...concepts];

        if (req.query.category && req.query.category !== 'all' && req.query.category !== 'Tất cả') {
            const catQuery = req.query.category.toLowerCase().trim();
            filtered = filtered.filter(item => 
                item.categories.some(c => c.toLowerCase().includes(catQuery))
            );
        }

        if (req.query.bestseller === 'true') {
            filtered = filtered.filter(item => item.bestSeller);
        }

        if (req.query.search) {
            const searchKeyword = req.query.search.toLowerCase().trim();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchKeyword) || 
                item.desc.toLowerCase().includes(searchKeyword)
            );
        }

        res.json({
            success: true,
            total: filtered.length,
            fromCache,
            cacheAgeSeconds: Math.round((now - cache.timestamp) / 1000),
            data: filtered
        });
    } catch (error) {
        // Nếu lỗi nhưng có cache cũ, trả về cache cũ để đảm bảo website không bị chết
        if (cache.data) {
            console.warn('⚠️ Lỗi fetch Google Sheets, phục hồi dữ liệu từ cache cũ:', error.message);
            return res.json({
                success: true,
                total: cache.data.length,
                fromCache: true,
                stale: true,
                data: cache.data
            });
        }
        next(error);
    }
}

module.exports = {
    getConcepts
};
