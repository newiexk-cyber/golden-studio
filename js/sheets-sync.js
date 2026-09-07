/**
 * ==============================================================================
 * 🔄 SHEETS_SYNC.JS - BỘ XỬ LÝ ĐỒNG BỘ DỮ LIỆU TỪ GOOGLE SHEETS & GOOGLE DRIVE
 * ==============================================================================
 * Tự động tải và bóc tách dữ liệu từ Google Sheets qua chuẩn CSV Export URL.
 * Hỗ trợ tự động chuyển đổi toàn bộ link Google Drive sang URL ảnh trực tiếp độ nét cao (4K/1600px).
 */

const SheetsSync = (function () {
    // 1. Tự động chuyển link Google Drive (View, Open, UC, File ID) -> Direct Image URL (Tối ưu w800 load siêu nhanh, w1600 cho phóng to)
    function driveToDirectUrl(url, sz = 'w800') {
        if (!url || typeof url !== 'string') return url;
        const trimmed = url.trim();

        function toThumbnail(fileId) {
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}`;
        }

        // Dạng 1: drive.google.com/file/d/FILE_ID/view
        const m1 = trimmed.match(/drive\.google\.com\/file\/d\/([^/&#?]+)/);
        if (m1) return toThumbnail(m1[1]);

        // Dạng 2: drive.google.com/open?id=FILE_ID
        const m2 = trimmed.match(/drive\.google\.com\/open\?id=([^&#?]+)/);
        if (m2) return toThumbnail(m2[1]);

        // Dạng 3: drive.google.com/uc?id=FILE_ID hoặc export=view&id=FILE_ID
        const m3 = trimmed.match(/[?&]id=([^&#?]+)/);
        if (m3 && trimmed.includes("drive.google.com")) return toThumbnail(m3[1]);

        // Dạng 4: drive.google.com/thumbnail?id=FILE_ID (đảm bảo sz)
        if (trimmed.includes("drive.google.com/thumbnail")) {
            const m4 = trimmed.match(/[?&]id=([^&#?]+)/);
            if (m4) return toThumbnail(m4[1]);
        }

        return trimmed;
    }

    // 2. Hàm bóc tách chuẩn định dạng CSV (Hỗ trợ cả chuỗi có dấu phẩy và ngoặc kép)
    function parseCSV(text) {
        let p = '', c = '', r = [];
        let q = false;
        let row = [''];
        for (let i = 0; i < text.length; i++) {
            c = text[i];
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

    // 3. Hàm chuẩn hóa 1 dòng dữ liệu từ Google Sheets sang Object Concept
    function parseSheetsRow(rowObj, index) {
        // Hỗ trợ tìm key linh hoạt (không phân biệt hoa/thường hay khoảng trắng)
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

        const title = getVal(['Tên concept', 'Tên Concept', 'Concept', 'Title', 'Name'], `Concept #${index + 1}`);
        const branch = getVal(['Chi nhánh', 'Chi Nhánh', 'Branch'], '');
        const rawCategories = getVal(['Chủ đề', 'Chủ Đề', 'Category', 'Danh mục'], '');
        const price = getVal(['Giá gói', 'Giá', 'Price'], '');
        const desc = getVal(['Mô tả', 'Mô tả ngắn', 'Description'], '');
        
        // Tách các danh mục theo dấu phẩy nếu có
        let categories = [];
        if (rawCategories) {
            categories = rawCategories.split(',').map(cat => cat.trim()).filter(Boolean);
        }
        if (categories.length === 0) {
            categories = ['Concept'];
        }

        // STT chuẩn từ Sheet
        const parsedStt = parseInt(getVal(['STT', 'Stt', 'stt']), 10);
        const stt = (!isNaN(parsedStt) && parsedStt > 0) ? parsedStt : (index + 1);

        // Kiểm tra Best Seller (Chấp nhận TRUE, True, true, 1, Có, Co, x, v, yes)
        const bestSellerVal = getVal(['Best Seller', 'Bán chạy', 'Hot', 'Nổi bật']).toLowerCase();
        const isBestSeller = bestSellerVal === 'true' || bestSellerVal === '1' || bestSellerVal === 'có' || bestSellerVal === 'co' || bestSellerVal === 'x' || bestSellerVal === 'v' || bestSellerVal === 'yes';

        // Kiểm tra Ẩn (Chấp nhận TRUE, True, true, 1, Ẩn, An)
        const hiddenVal = getVal(['Ẩn', 'An', 'Hidden']).toLowerCase();
        const isHidden = hiddenVal === 'true' || hiddenVal === '1' || hiddenVal === 'ẩn' || hiddenVal === 'an';

        // Bóc tách Link Drive và Link Web nếu có
        const driveLink = getVal(['Link ảnh drive', 'Link ảnh driver', 'Link Drive', 'Link Drive Tổng']) || (getVal(['Folder ID']) ? (`https://drive.google.com/drive/folders/${getVal(['Folder ID'])}`) : '');
        const webLink = getVal(['Link ảnh web', 'Link web', 'Link Web']);

        // Thu thập các cột ảnh từ img1 đến img20 + Chuyển đổi: w800 (nhẹ, nhanh cho thẻ/slider) và w1600 (cho phóng to)
        const images = [];
        const highResImages = [];
        for (let i = 1; i <= 20; i++) {
            const rawUrl = getVal([`img${i}`, `Img${i}`, `Ảnh ${i}`, `ảnh ${i}`, `Anh ${i}`]);
            if (rawUrl) {
                const thumbUrl = driveToDirectUrl(rawUrl, 'w800');
                const fullUrl = driveToDirectUrl(rawUrl, 'w1600');
                if (thumbUrl.startsWith('http') || thumbUrl.startsWith('images/')) {
                    images.push(thumbUrl);
                    highResImages.push(fullUrl);
                }
            }
        }

        if (images.length === 0) {
            images.push('images/banner-1.jpg');
            highResImages.push('images/banner-1.jpg');
        }

        return {
            id: `concept-${index}`,
            stt: stt,
            branch: branch.trim(),
            title: title.trim(),
            category: categories[0] || 'Concept',
            categories: categories,
            price: price.trim(),
            desc: desc.trim(),
            isBestSeller: isBestSeller,
            isHidden: isHidden,
            driveLink: driveLink,
            webLink: webLink,
            images: images,
            highResImages: highResImages,
            thumbnail: images[0],
        };
    }

    // 4. Bóc tách bảng Google Visualization API Table thành danh sách Concept
    function parseGvizTable(table) {
        if (!table || !table.cols || !table.rows || table.rows.length === 0) {
            return [];
        }

        const cols = table.cols;
        const rows = table.rows;

        const parsedConcepts = rows.map((row, rowIdx) => {
            if (!row || !row.c) return null;
            const rowObj = {};

            cols.forEach((col, colIdx) => {
                const colLabel = col && col.label ? col.label.trim() : (col && col.id ? col.id.trim() : `col_${colIdx}`);
                const cell = row.c[colIdx];
                let cellVal = '';
                if (cell !== null && cell !== undefined) {
                    if (cell.v !== null && cell.v !== undefined) {
                        cellVal = String(cell.v).trim();
                    } else if (cell.f !== null && cell.f !== undefined) {
                        cellVal = String(cell.f).trim();
                    }
                }
                rowObj[colLabel] = cellVal;
            });

            const concept = parseSheetsRow(rowObj, rowIdx);
            if (!concept || concept.isHidden) return null;
            if (!concept.title && (!concept.images || concept.images.length === 0)) return null;
            return concept;
        }).filter(Boolean);

        return parsedConcepts;
    }

    // 5. Tải dữ liệu qua cơ chế JSONP (Khắc phục 100% giới hạn CORS khi mở bằng file://)
    function fetchViaJSONP(sheetId, gid, timeoutMs = 8000) {
        return new Promise((resolve, reject) => {
            const callbackName = 'gvizCb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
            const script = document.createElement('script');
            let timer = null;

            window[callbackName] = function (data) {
                cleanup();
                if (data && data.table) {
                    resolve(data.table);
                } else {
                    reject(new Error('Dữ liệu GVIZ không hợp lệ'));
                }
            };

            function cleanup() {
                if (timer) clearTimeout(timer);
                delete window[callbackName];
                if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }

            timer = setTimeout(() => {
                cleanup();
                reject(new Error('Yêu cầu Google Sheets qua JSONP quá thời gian (timeout)'));
            }, timeoutMs);

            script.onerror = function () {
                cleanup();
                reject(new Error('Không thể tải script GVIZ từ Google Sheets'));
            };

            script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}&tqx=responseHandler:${callbackName}&_t=${Date.now()}`;
            document.head.appendChild(script);
        });
    }

    // 6. Hàm tải toàn bộ danh sách concept từ Google Sheets
    async function fetchConcepts() {
        const config = window.STUDIO_CONFIG ? window.STUDIO_CONFIG.googleSheets : null;
        const defaultConcepts = window.STUDIO_CONFIG?.defaultConcepts || [];

        if (!config || !config.enabled || !config.sheetId) {
            console.log("ℹ️ [GOLDEN STUDIO] Sử dụng dữ liệu concept mặc định từ config.js");
            return defaultConcepts;
        }

        const sheetId = config.sheetId;
        const gid = config.sheetGid || '0';

        console.log("⏳ [GOLDEN STUDIO] Đang kiểm tra nguồn dữ liệu...");

        // Phương án 0 (BẢO MẬT & CACHE TỐI ĐA): Tải qua Backend Express.js API nếu được cấu hình
        const backendConfig = window.STUDIO_CONFIG?.backendApi;
        if (backendConfig && backendConfig.enabled && backendConfig.baseUrl) {
            try {
                const apiEndpoint = `${backendConfig.baseUrl.replace(/\/$/, '')}/api/concepts`;
                console.log(`🛡️ [GOLDEN STUDIO] Đang tải bảo mật từ Backend Express.js: ${apiEndpoint}...`);
                const res = await fetch(apiEndpoint, { headers: { 'Accept': 'application/json' } });
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
                        console.log(`✅ [GOLDEN STUDIO] Đã tải an toàn ${json.data.length} concepts qua Backend Express API (Cache: ${json.fromCache ? 'Đã lưu' : 'Mới'})!`);
                        return json.data;
                    }
                }
            } catch (apiErr) {
                console.warn("⚠️ Backend Express API tạm thời không phản hồi, tự động chuyển sang cơ chế Fallback Google Sheets:", apiErr.message);
            }
        }

        console.log("⏳ [GOLDEN STUDIO] Đang đồng bộ dữ liệu trực tiếp từ Google Sheets...");

        // Phương án 1 (Ưu tiên số 1 khi chạy client): Tải qua JSONP (Bỏ qua hoàn toàn CORS, chạy mượt trên file://, localhost, online)
        try {
            const table = await fetchViaJSONP(sheetId, gid, 8000);
            const concepts = parseGvizTable(table);
            if (concepts && concepts.length > 0) {
                console.log(`✅ [GOLDEN STUDIO] Đồng bộ thành công ${concepts.length} concepts từ Google Sheets qua JSONP!`);
                return concepts;
            }
        } catch (jsonpErr) {
            console.warn("⚠️ JSONP không thành công, thử phương thức Fetch trực tiếp...", jsonpErr);
        }

        // Phương án 2: Tải qua Fetch (Dành cho môi trường Web Server thông thường)
        const endpoints = [
            `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
            `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`)}`
        ];

        let csvText = null;
        for (const url of endpoints) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const text = await response.text();
                    if (text && text.trim().length > 20 && !text.includes("<!DOCTYPE html>")) {
                        csvText = text;
                        break;
                    }
                }
            } catch (err) {
                // Tiếp tục thử endpoint tiếp theo
            }
        }

        if (csvText) {
            try {
                const rows = parseCSV(csvText);
                if (rows && rows.length >= 2) {
                    const headers = rows[0].map(h => String(h || "").trim().replace(/^"|"$/g, '').normalize("NFC"));
                    const parsedConcepts = rows.slice(1).map((row, rowIdx) => {
                        const rowObj = {};
                        headers.forEach((colName, colIdx) => {
                            const rawVal = row[colIdx] ? String(row[colIdx]).replace(/^"|"$/g, '').normalize("NFC").trim() : "";
                            rowObj[colName] = rawVal;
                        });
                        const concept = parseSheetsRow(rowObj, rowIdx);
                        if (!concept || concept.isHidden) return null;
                        if (!concept.title && (!concept.images || concept.images.length === 0)) return null;
                        return concept;
                    }).filter(Boolean);

                    if (parsedConcepts.length > 0) {
                        console.log(`✅ [GOLDEN STUDIO] Đồng bộ thành công ${parsedConcepts.length} concepts từ Google Sheets qua CSV Fetch!`);
                        return parsedConcepts;
                    }
                }
            } catch (parseErr) {
                console.error("Lỗi phân tích CSV từ Google Sheets:", parseErr);
            }
        }

        console.warn("👉 [GOLDEN STUDIO] Không thể kết nối Google Sheets, sử dụng dữ liệu mặc định từ config.js");
        return defaultConcepts;
    }

    return {
        fetchConcepts: fetchConcepts,
        driveToDirectUrl: driveToDirectUrl,
    };
})();

window.SheetsSync = SheetsSync;
