/**
 * ==============================================================================
 * 📅 BOOKING_MODAL.JS - MODAL ĐẶT LỊCH HẸN & TƯ VẤN TRỰC TUYẾN
 * ==============================================================================
 * Tự động đổ danh sách Concept từ Sheet vào ô chọn của Form, tạo link Zalo
 * đi kèm thông tin chọn sẵn, và xử lý thông báo Toast khi gửi thành công.
 */

const BookingModal = (function () {
    let activeConcepts = [];

    function init(concepts) {
        activeConcepts = concepts || [];
        populateConceptSelect();
        setupEventListeners();
    }

    function updateConcepts(concepts) {
        activeConcepts = concepts || [];
        populateConceptSelect();
    }

    // Đổ danh sách Concept vào Select Dropdown
    function populateConceptSelect() {
        const select = document.getElementById('bookingConceptSelect');
        if (!select) return;

        let html = '<option value="Tự chọn / Tư vấn thêm">Tự chọn concept riêng / Cần Studio tư vấn thêm</option>';
        activeConcepts.forEach(c => {
            html += `<option value="${c.title}">${c.title} (${c.price || 'Liên hệ'})</option>`;
        });

        select.innerHTML = html;
    }

    function setupEventListeners() {
        const overlay = document.getElementById('bookingModalOverlay');
        const closeBtn = document.getElementById('bookingModalCloseBtn');
        const form = document.getElementById('quickBookingForm');
        const triggerBtns = document.querySelectorAll('.trigger-booking-modal');

        // Mở modal từ các nút CTA
        triggerBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                openModal();
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Đóng khi click ra ngoài card
        if (overlay) {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeModal();
            });
        }

        // Đóng bằng phím Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
                closeModal();
            }
        });

        // Xử lý gửi Form
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                handleFormSubmit();
            });
        }
    }

    function openModal() {
        const overlay = document.getElementById('bookingModalOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function openWithConcept(conceptTitle) {
        openModal();
        const select = document.getElementById('bookingConceptSelect');
        if (select && conceptTitle) {
            select.value = conceptTitle;
        }
    }

    function closeModal() {
        const overlay = document.getElementById('bookingModalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function handleFormSubmit() {
        const nameInput = document.getElementById('bookingNameInput');
        const phoneInput = document.getElementById('bookingPhoneInput');
        const conceptSelect = document.getElementById('bookingConceptSelect');
        const dateInput = document.getElementById('bookingDateInput');

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const concept = conceptSelect ? conceptSelect.value : '';
        const date = dateInput ? dateInput.value : '';

        if (!name || !phone) {
            showToast('⚠️ Vui lòng nhập đầy đủ Họ tên và Số điện thoại!');
            return;
        }

        console.log(`[Booking] Khách hàng: ${name}, SĐT: ${phone}, Concept: ${concept}, Ngày: ${date}`);

        // Gửi ngầm tới Backend Express.js nếu có cấu hình
        const backendConfig = window.STUDIO_CONFIG?.backendApi;
        if (backendConfig && backendConfig.enabled && backendConfig.baseUrl) {
            const apiEndpoint = `${backendConfig.baseUrl.replace(/\/$/, '')}/api/booking`;
            fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, concept, date })
            }).then(r => r.json()).then(data => {
                console.log("🛡️ [Booking Backend Response]:", data);
            }).catch(err => {
                console.warn("⚠️ Không thể gửi tới backend API:", err.message);
            });
        }

        // Đóng modal và reset form
        closeModal();
        const form = document.getElementById('quickBookingForm');
        if (form) form.reset();

        // Hiển thị Toast thông báo thành công
        const studioName = window.STUDIO_CONFIG?.branding?.studioName || 'Golden Studio';
        showToast(`✨ Yêu cầu đặt lịch thành công! Ekip ${studioName} sẽ liên hệ tư vấn trong 15 phút.`);

        // Tùy chọn: Chuyển tiếp nhanh vào Zalo OA với thông tin đã chọn
        const zaloUrl = window.STUDIO_CONFIG?.contact?.zaloUrl;
        if (zaloUrl) {
            setTimeout(() => {
                const proceedZalo = confirm(`Yêu cầu của bạn đã được ghi nhận! Bạn có muốn mở Zalo để trao đổi trực tiếp với tư vấn viên ngay bây giờ không?`);
                if (proceedZalo) {
                    window.open(zaloUrl, '_blank');
                }
            }, 800);
        }
    }

    // Hiển thị Toast thông báo kiểu Dark Luxury
    function showToast(message) {
        let toast = document.getElementById('luxuryToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'luxuryToast';
            toast.className = 'luxury-toast';
            toast.innerHTML = `
                <span class="toast-icon">✧</span>
                <span class="toast-message" id="luxuryToastMsg"></span>
            `;
            document.body.appendChild(toast);
        }

        const msgEl = document.getElementById('luxuryToastMsg');
        if (msgEl) msgEl.textContent = message;

        toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
        }, 4500);
    }

    return {
        init: init,
        updateConcepts: updateConcepts,
        openModal: openModal,
        openWithConcept: openWithConcept,
        closeModal: closeModal,
        showToast: showToast,
    };
})();

window.BookingModal = BookingModal;
