/**
 * ==============================================================================
 * 🖼️ PORTFOLIO-GALLERY.JS - MASONRY GALLERY & FULLSCREEN MINIMAL LIGHTBOX
 * Siêu tối ưu hiệu năng: Tải trước toàn bộ ảnh (Smart Preloading & Instant Paint)
 * ==============================================================================
 */

const PortfolioGallery = (function () {
    let allConcepts = [];
    let bestSellerConcepts = [];
    let isViewingBestSellerOnly = true;
    let currentFiltered = [];
    let activeCategory = 'all';

    // Bộ nhớ đệm tải trước ảnh (Preloaded Image Cache)
    const preloadedCache = new Set();

    // Lightbox State
    let currentImageIndex = 0;
    let currentConceptImages = [];
    let currentConceptData = null;

    // DOM Elements
    const galleryContainer = document.getElementById('masonryGallery');
    const tabsContainer = document.getElementById('filterTabsWrapper');
    const moreContainer = document.getElementById('galleryMoreContainer');
    const moreBtn = document.getElementById('galleryMoreBtn');
    const moreBtnText = document.getElementById('galleryMoreBtnText');
    const moreIcon = document.getElementById('galleryMoreIcon');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxMeta = document.getElementById('lightboxMeta');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxClose = document.getElementById('lightboxClose');

    // 1. Tải trước một ảnh vào bộ nhớ đệm trình duyệt (Hỗ trợ img.decode)
    function preloadSingleImage(url) {
        if (!url || preloadedCache.has(url)) return Promise.resolve(url);

        return new Promise((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.src = url;
            
            if (img.decode) {
                img.decode().then(() => {
                    preloadedCache.add(url);
                    resolve(url);
                }).catch(() => {
                    img.onload = () => {
                        preloadedCache.add(url);
                        resolve(url);
                    };
                    img.onerror = () => resolve(url);
                });
            } else {
                img.onload = () => {
                    preloadedCache.add(url);
                    resolve(url);
                };
                img.onerror = () => resolve(url);
            }
        });
    }

    // 2. Tải trước toàn bộ danh sách ảnh trong nền (Proactive Background Preloader)
    function preloadAllImages(conceptList) {
        if (!conceptList || !conceptList.length) return;

        // Ưu tiên tải trước 8 ảnh đầu tiên lập tức
        const priorityImages = [];
        conceptList.slice(0, 8).forEach(item => {
            if (item.thumbnail) priorityImages.push(item.thumbnail);
            if (item.images && item.images[0]) priorityImages.push(item.images[0]);
        });

        priorityImages.forEach(url => preloadSingleImage(url));

        // Sau đó tải ngầm toàn bộ các ảnh còn lại
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                conceptList.slice(8).forEach(item => {
                    if (item.thumbnail) preloadSingleImage(item.thumbnail);
                    if (item.images) {
                        item.images.forEach(imgUrl => preloadSingleImage(imgUrl));
                    }
                });
            });
        } else {
            setTimeout(() => {
                conceptList.slice(8).forEach(item => {
                    if (item.thumbnail) preloadSingleImage(item.thumbnail);
                });
            }, 1000);
        }
    }

    // 3. Khởi tạo Portfolio với danh sách Concepts & Lọc Best Seller ban đầu
    function init(conceptList) {
        allConcepts = conceptList || [];
        // Lọc các concept được tick Best Seller trên Sheet
        bestSellerConcepts = allConcepts.filter(item => item.isBestSeller === true || item.bestSeller === true);

        // Nếu có ít nhất 1 concept được tick Best Seller, ưu tiên hiển thị chỉ nhóm Best Seller
        if (bestSellerConcepts.length > 0 && bestSellerConcepts.length < allConcepts.length) {
            isViewingBestSellerOnly = true;
            currentFiltered = [...bestSellerConcepts];
        } else {
            // Nếu chưa tick hoặc đã tick tất cả thì hiển thị toàn bộ
            isViewingBestSellerOnly = false;
            bestSellerConcepts = [...allConcepts];
            currentFiltered = [...allConcepts];
        }

        // Kích hoạt nạp trước dữ liệu hình ảnh
        preloadAllImages(allConcepts);

        renderFilterTabs();
        renderGallery(currentFiltered);
        setupMoreButton();
        setupLightboxEvents();
    }

    // 4. Tạo các Filter Tabs động từ các danh mục concept thực tế
    function renderFilterTabs() {
        if (!tabsContainer) return;

        // Trích xuất toàn bộ categories duy nhất
        const allCategories = new Set();
        allConcepts.forEach(item => {
            if (Array.isArray(item.categories)) {
                item.categories.forEach(cat => allCategories.add(cat));
            } else if (item.category) {
                allCategories.add(item.category);
            }
        });

        const categoryList = Array.from(allCategories).filter(Boolean);

        // Tạo HTML cho các tab
        let tabsHtml = `<button class="filter-tab ${activeCategory === 'all' ? 'active' : ''}" data-category="all">ALL WORKS</button>`;
        
        categoryList.forEach(cat => {
            tabsHtml += `<button class="filter-tab ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">${cat.toUpperCase()}</button>`;
        });

        // Thêm Tab Bảng giá dẫn nhanh xuống section #pricing
        tabsHtml += `<button class="filter-tab" data-nav="pricing">BẢNG GIÁ</button>`;

        tabsContainer.innerHTML = tabsHtml;

        // Gắn sự kiện click cho từng tab
        tabsContainer.querySelectorAll('.filter-tab').forEach(tabBtn => {
            tabBtn.addEventListener('click', function () {
                const targetNav = this.getAttribute('data-nav');
                if (targetNav === 'pricing') {
                    if (typeof window.scrollToSection === 'function') {
                        window.scrollToSection('#pricing', true);
                    } else {
                        const pricingEl = document.getElementById('pricing');
                        if (pricingEl) {
                            const header = document.getElementById('siteHeader');
                            const headerHeight = header ? header.offsetHeight : 70;
                            const targetScrollY = Math.max(0, pricingEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12);
                            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
                        }
                    }
                    return;
                }

                const cat = this.getAttribute('data-category');
                filterByCategory(cat);
            });
        });
    }

    // 5. Quản lý Banner trạng thái lọc (Filter Indicator)
    function renderFilterIndicator(filterText) {
        let indicatorEl = document.getElementById('galleryFilterIndicator');
        if (!filterText) {
            if (indicatorEl) indicatorEl.remove();
            return;
        }

        if (!indicatorEl) {
            indicatorEl = document.createElement('div');
            indicatorEl.id = 'galleryFilterIndicator';
            indicatorEl.className = 'gallery-filter-indicator';
            if (galleryContainer && galleryContainer.parentNode) {
                galleryContainer.parentNode.insertBefore(indicatorEl, galleryContainer);
            }
        }

        indicatorEl.innerHTML = `
            <div class="filter-indicator-content">
                <span class="filter-indicator-tag"><i class="fas fa-filter"></i> BỘ LỌC ĐANG CHỌN:</span>
                <span class="filter-indicator-text">${filterText}</span>
            </div>
            <button class="filter-indicator-clear-btn" id="clearFilterBtn">
                <i class="fas fa-times"></i> Xem tất cả
            </button>
        `;

        const clearBtn = indicatorEl.querySelector('#clearFilterBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.history && window.history.replaceState) {
                    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
                }
                filterByCategory('all');
            });
        }
    }

    // 6. Lọc danh sách tác phẩm theo danh mục tức thì
    function filterByCategory(category) {
        activeCategory = category;
        renderFilterIndicator(null); // Tắt banner tùy chỉnh khi bấm tab thường

        // Cập nhật class active cho tabs
        if (tabsContainer) {
            tabsContainer.querySelectorAll('.filter-tab').forEach(tab => {
                if (tab.getAttribute('data-category') === category) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }

        if (category === 'all') {
            currentFiltered = isViewingBestSellerOnly ? [...bestSellerConcepts] : [...allConcepts];
        } else {
            currentFiltered = allConcepts.filter(item => {
                if (Array.isArray(item.categories)) {
                    return item.categories.some(c => c.toLowerCase() === category.toLowerCase());
                }
                return item.category && item.category.toLowerCase() === category.toLowerCase();
            });
        }

        renderGallery(currentFiltered);
        updateMoreButtonState();
    }

    // 7. Lọc theo Chủ đề hoặc Best Seller (Tinh gọn, không phụ thuộc chi nhánh)
    function filterByTheme(category) {
        const normCat = (category || '').trim().toLowerCase();
        const isBestSellerOnly = normCat === 'best seller';

        // Cập nhật trạng thái active cho các tab
        if (tabsContainer) {
            tabsContainer.querySelectorAll('.filter-tab').forEach(tab => {
                const tabCat = (tab.getAttribute('data-category') || '').toLowerCase();
                if (tabCat === normCat) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }

        currentFiltered = allConcepts.filter(item => {
            if (isBestSellerOnly) {
                return item.isBestSeller === true || item.bestSeller === true;
            } else if (normCat && normCat !== 'all') {
                const hasInCats = Array.isArray(item.categories) && item.categories.some(c => c.toLowerCase() === normCat);
                const hasInCat = item.category && item.category.toLowerCase() === normCat;
                return hasInCats || hasInCat;
            }
            return true;
        });

        // Hiển thị banner trạng thái lọc
        if (category && category.trim() && !['all', 'null', 'undefined'].includes(category.trim().toLowerCase())) {
            renderFilterIndicator(`Chủ đề: <strong>${category.trim()}</strong> <span style="opacity:0.75;">(${currentFiltered.length} tác phẩm)</span>`);
        } else {
            renderFilterIndicator(null);
        }

        renderGallery(currentFiltered);
        if (moreContainer) moreContainer.style.display = 'none';
    }

    // 8. Mở thẳng Concept qua số STT (Từ link ?concept=STT trên Sheet)
    function openConceptByStt(stt) {
        if (!stt) return false;
        const targetStt = parseInt(stt, 10);
        
        let foundIdx = -1;
        // Tìm trong danh sách toàn bộ concepts
        for (let i = 0; i < allConcepts.length; i++) {
            if (allConcepts[i].stt === targetStt || String(allConcepts[i].stt) === String(stt)) {
                foundIdx = i;
                break;
            }
        }

        if (foundIdx !== -1) {
            // Nếu tìm thấy, mở rộng toàn bộ và kích hoạt Lightbox
            currentFiltered = [...allConcepts];
            isViewingBestSellerOnly = false;
            renderGallery(currentFiltered);
            updateMoreButtonState();
            openLightbox(foundIdx);
            return true;
        }
        return false;
    }

    // 9. Cập nhật trạng thái nút "XEM THÊM TẤT CẢ CONCEPT"
    function updateMoreButtonState() {
        if (!moreContainer || !moreBtnText) return;

        // Chỉ hiển thị nút khi đang ở tab ALL và có concepts chưa xem
        if (activeCategory !== 'all') {
            moreContainer.style.display = 'none';
            return;
        }

        const remainingCount = allConcepts.length - bestSellerConcepts.length;
        if (remainingCount <= 0) {
            moreContainer.style.display = 'none';
            return;
        }

        moreContainer.style.display = 'flex';
        if (isViewingBestSellerOnly) {
            moreBtnText.textContent = `XEM THÊM TẤT CẢ CONCEPT (${remainingCount})`;
            if (moreIcon) moreIcon.className = 'fas fa-chevron-down gallery-more-icon';
        } else {
            moreBtnText.textContent = `THU GỌN BỘ SƯU TẬP`;
            if (moreIcon) moreIcon.className = 'fas fa-chevron-up gallery-more-icon';
        }
    }

    // 10. Thiết lập sự kiện nút Xem thêm
    function setupMoreButton() {
        if (!moreBtn) return;
        moreBtn.onclick = function () {
            if (isViewingBestSellerOnly) {
                // Mở rộng hiển thị tất cả
                isViewingBestSellerOnly = false;
                currentFiltered = [...allConcepts];
                renderGallery(currentFiltered);
                updateMoreButtonState();
            } else {
                // Thu gọn lại chỉ hiển thị Best Seller
                isViewingBestSellerOnly = true;
                currentFiltered = [...bestSellerConcepts];
                renderGallery(currentFiltered);
                updateMoreButtonState();
                const gal = document.getElementById('gallery');
                if (gal) {
                    gal.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        updateMoreButtonState();
    }

    // 11. Render Lưới ảnh Concept (Không lệch khung, không chữ che ảnh)
    function renderGallery(items) {
        if (!galleryContainer) return;

        if (items.length === 0) {
            galleryContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: #888888; font-size: 14px; letter-spacing: 1px;">
                    Chưa có tác phẩm nào trong danh mục này.
                </div>
            `;
            return;
        }

        let html = '';
        items.forEach((concept, index) => {
            const thumbUrl = concept.thumbnail || concept.images[0];
            const mainCat = Array.isArray(concept.categories) ? concept.categories.join(' • ') : concept.category;
            const isCached = preloadedCache.has(thumbUrl);

            html += `
                <div class="gallery-item ${isCached ? 'loaded' : ''}" data-index="${index}">
                    <div class="gallery-image-wrapper">
                        <img src="${thumbUrl}" 
                             alt="${concept.title}" 
                             class="gallery-image" 
                             loading="lazy"
                             decoding="async"
                             onload="this.closest('.gallery-item').classList.add('loaded')"
                             onerror="this.closest('.gallery-item').classList.add('loaded')">
                        <div class="gallery-overlay">
                            <span class="gallery-item-category">${mainCat}</span>
                            <h3 class="gallery-item-title">${concept.title}</h3>
                            ${concept.price ? `<span class="gallery-item-price">${concept.price}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        galleryContainer.innerHTML = html;

        galleryContainer.querySelectorAll('.gallery-item').forEach(el => {
            el.addEventListener('click', function () {
                const idx = parseInt(this.getAttribute('data-index'), 10);
                openLightbox(idx);
            });

            el.addEventListener('mouseenter', function () {
                const idx = parseInt(this.getAttribute('data-index'), 10);
                const concept = currentFiltered[idx];
                if (concept && concept.highResImages) {
                    concept.highResImages.forEach(imgUrl => preloadSingleImage(imgUrl));
                }
            }, { passive: true });
        });
    }

    // 12. Mở Fullscreen Minimal Lightbox (Dùng ảnh độ nét cao w1600)
    function openLightbox(conceptIndex) {
        if (!currentFiltered[conceptIndex]) return;

        currentConceptData = currentFiltered[conceptIndex];
        currentConceptImages = currentConceptData.highResImages && currentConceptData.highResImages.length > 0
            ? currentConceptData.highResImages
            : (currentConceptData.images && currentConceptData.images.length > 0 
                ? currentConceptData.images 
                : [currentConceptData.thumbnail]);
        
        currentImageIndex = 0;
        updateLightboxView();

        if (lightboxModal) {
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Hàm tải ngầm ảnh trước vào bộ nhớ cache trình duyệt
    function preloadSingleImage(url) {
        if (!url || typeof url !== 'string') return;
        const img = new Image();
        img.src = url;
    }

    // 8. Cập nhật ảnh và thông tin trong Lightbox + Tải trước ảnh kế tiếp
    function updateLightboxView() {
        if (!lightboxImg || !currentConceptData) return;

        const currentImgUrl = currentConceptImages[currentImageIndex];
        lightboxImg.src = currentImgUrl;
        
        if (lightboxTitle) {
            lightboxTitle.textContent = currentConceptData.title;
        }

        if (lightboxMeta) {
            const catText = Array.isArray(currentConceptData.categories) ? currentConceptData.categories.join(' • ') : currentConceptData.category;
            const counterText = currentConceptImages.length > 1 ? ` (${currentImageIndex + 1}/${currentConceptImages.length})` : '';
            lightboxMeta.textContent = `${catText}${counterText}`;
        }

        // Tải trước ảnh tiếp theo và ảnh trước đó để lướt 0ms không bị chờ
        if (currentConceptImages.length > 1) {
            const nextIdx = (currentImageIndex + 1) % currentConceptImages.length;
            const prevIdx = (currentImageIndex - 1 + currentConceptImages.length) % currentConceptImages.length;
            preloadSingleImage(currentConceptImages[nextIdx]);
            preloadSingleImage(currentConceptImages[prevIdx]);
        }

        // Ẩn/Hiện nút prev/next nếu chỉ có 1 ảnh
        if (currentConceptImages.length <= 1) {
            if (lightboxPrev) lightboxPrev.style.display = 'none';
            if (lightboxNext) lightboxNext.style.display = 'none';
        } else {
            if (lightboxPrev) lightboxPrev.style.display = 'block';
            if (lightboxNext) lightboxNext.style.display = 'block';
        }
    }

    function showPrevImage() {
        if (currentConceptImages.length <= 1) return;
        currentImageIndex = (currentImageIndex - 1 + currentConceptImages.length) % currentConceptImages.length;
        updateLightboxView();
    }

    function showNextImage() {
        if (currentConceptImages.length <= 1) return;
        currentImageIndex = (currentImageIndex + 1) % currentConceptImages.length;
        updateLightboxView();
    }

    function closeLightbox() {
        if (lightboxModal) {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 9. Thiết lập sự kiện tương tác Lightbox (Nút bấm, Phím tắt, Touch Swipe)
    function setupLightboxEvents() {
        if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });
        if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });
        if (lightboxClose) lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

        if (lightboxModal) {
            lightboxModal.addEventListener('click', function (e) {
                if (e.target === lightboxModal || e.target.classList.contains('lightbox-content-wrapper')) {
                    closeLightbox();
                }
            });
        }

        // Phím tắt bàn phím
        window.addEventListener('keydown', function (e) {
            if (!lightboxModal || !lightboxModal.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        });

        // Cử chỉ vuốt Touch Swipe trên điện thoại
        let touchStartX = 0;
        let touchEndX = 0;

        if (lightboxModal) {
            lightboxModal.addEventListener('touchstart', function (e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            lightboxModal.addEventListener('touchend', function (e) {
                touchEndX = e.changedTouches[0].screenX;
                const swipeDiff = touchEndX - touchStartX;
                if (Math.abs(swipeDiff) > 35) {
                    if (swipeDiff > 0) {
                        showPrevImage();
                    } else {
                        showNextImage();
                    }
                }
            }, { passive: true });
        }
    }

    return {
        init: init,
        filterByCategory: filterByCategory,
        filterByTheme: filterByTheme,
        openConceptByStt: openConceptByStt,
        openLightbox: openLightbox,
        preloadSingleImage: preloadSingleImage,
        getConcepts: () => allConcepts,
        getBestSellers: () => bestSellerConcepts,
    };
})();

window.PortfolioGallery = PortfolioGallery;
