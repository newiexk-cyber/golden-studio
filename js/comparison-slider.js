/**
 * ==============================================================================
 * ✂️ COMPARISON_SLIDER.JS - THANH TRƯỢT SO SÁNH RETOUCH (BEFORE / AFTER)
 * ==============================================================================
 * Cung cấp khả năng kéo thanh trượt mượt mà 60fps trên cả máy tính (chuột)
 * và điện thoại/máy tính bảng (cảm ứng chạm) để so sánh ảnh gốc và tác phẩm hậu kỳ.
 */

const ComparisonSlider = (function () {
    function init() {
        const wrapper = document.getElementById('retouchComparisonWrapper');
        const handle = document.getElementById('retouchHandle');
        const afterBox = document.getElementById('retouchAfterBox');

        if (!wrapper || !handle || !afterBox) return;

        let isDragging = false;

        function setPosition(xPos) {
            const rect = wrapper.getBoundingClientRect();
            let offsetX = xPos - rect.left;
            
            // Giới hạn trong khoảng 0% đến 100% của khung ảnh
            if (offsetX < 0) offsetX = 0;
            if (offsetX > rect.width) offsetX = rect.width;

            const percentage = (offsetX / rect.width) * 100;
            
            handle.style.left = `${percentage}%`;
            afterBox.style.width = `${percentage}%`;
        }

        // Bắt sự kiện Chuột (Mouse)
        wrapper.addEventListener('mousedown', function (e) {
            isDragging = true;
            setPosition(e.clientX);
        });

        window.addEventListener('mouseup', function () {
            isDragging = false;
        });

        window.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            setPosition(e.clientX);
        });

        // Bắt sự kiện Cảm ứng chạm (Touch - Mobile/Tablet)
        wrapper.addEventListener('touchstart', function (e) {
            isDragging = true;
            if (e.touches.length > 0) {
                setPosition(e.touches[0].clientX);
            }
        }, { passive: true });

        window.addEventListener('touchend', function () {
            isDragging = false;
        });

        window.addEventListener('touchmove', function (e) {
            if (!isDragging || e.touches.length === 0) return;
            setPosition(e.touches[0].clientX);
        }, { passive: true });

        // Tự động điều chỉnh kích thước ảnh After khi resize trình duyệt
        window.addEventListener('resize', function () {
            const afterImg = afterBox.querySelector('img');
            if (afterImg) {
                afterImg.style.width = `${wrapper.offsetWidth}px`;
            }
        });

        // Set ban đầu ở vị trí 50%
        const initialImg = afterBox.querySelector('img');
        if (initialImg) {
            initialImg.style.width = `${wrapper.offsetWidth}px`;
        }
    }

    return {
        init: init,
    };
})();

window.ComparisonSlider = ComparisonSlider;
