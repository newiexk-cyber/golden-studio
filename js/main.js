/**
 * ==============================================================================
 * 🚀 MAIN.JS - ĐIỀU PHỐI CHÍNH GOLDEN STUDIO (MINIMALISM PHOTOGRAPHY SHOWCASE)
 * ==============================================================================
 */

// 🎯 Luôn luôn bắt đầu trang web ở đỉnh màn hình (Hình bìa Hero Slider) khi vào hoặc tải lại trang
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// 🚀 Proactive Preloader: Tải trước 2 ảnh banner ngay khi script nạp vào
(function preheatCriticalAssets() {
    ['images/banner-1.jpg', 'images/banner-2.jpg'].forEach(url => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
    });
})();

document.addEventListener('DOMContentLoaded', async function () {
    // 1. Áp dụng cấu hình thương hiệu và đề mục động từ config.js
    applyConfigToDOM();

    // 2. Khởi tạo Hero Cover Slider tự động thay đổi hình nền
    setupHeroSlider();

    // 3. Khởi tạo Header biến đổi trong suốt -> nền trắng khi cuộn
    setupHeaderScroll();

    // 4. Khởi tạo hiệu ứng xuất hiện chuyển động mượt mà (Scroll Reveal)
    setupScrollReveal();

    // 5. Render phân khúc bảng giá (Pricing Segments)
    renderPricingSegments();

    // 6. Thiết lập tương tác Menu và Điều hướng cuộn trang
    setupNavigation();

    // 7. Thiết lập Modal Đặt lịch hẹn
    setupBookingModal();

    // 8. Tải và đồng bộ dữ liệu Concepts từ Google Sheets (hoặc Fallback Data)
    try {
        const concepts = await window.SheetsSync.fetchConcepts();
        window.PortfolioGallery.init(concepts);
    } catch (err) {
        console.error("Lỗi khởi tạo danh mục tác phẩm:", err);
        if (window.STUDIO_CONFIG?.defaultConcepts) {
            window.PortfolioGallery.init(window.STUDIO_CONFIG.defaultConcepts);
        }
    }

    // 9. Tự động xử lý URL Deep Links từ Google Sheets / Short.io (?concept=, ?chinhanh=, ?chude=)
    handleUrlDeepLinking();
});

/**
 * Tự động xử lý liên kết sâu từ Google Sheets / URL:
 * 1. URL có Hash (#pricing, #contact, #gallery, #about...) -> Cuộn chính xác tới vị trí
 * 2. ?concept=STT -> Tự động cuộn xuống Thư viện ảnh và mở ngay Fullscreen Lightbox
 * 3. ?chude=... -> Tự động lọc theo danh mục / Best Seller
 */
function handleUrlDeepLinking() {
    // 1. Nếu không có query params (?concept= hay ?chude=), luôn đảm bảo trang ở đỉnh (Hero Slider)
    if (!window.location.search) {
        if (window.location.hash) {
            // Xóa hash dư thừa (như #gallery) để khi reload không bị nhảy xuống
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, null, window.location.pathname);
            }
        }
        window.scrollTo(0, 0);
        return;
    }

    // 2. Xử lý các tham số tìm kiếm (Search Params)
    if (!window.location.search) return;

    const urlParams = new URLSearchParams(window.location.search);
    const conceptStt = urlParams.get('concept');
    const theme = urlParams.get('chude') || urlParams.get('category');

    // Trường hợp 1: Link xem chi tiết Concept (?concept=STT)
    if (conceptStt) {
        setTimeout(() => {
            scrollToSection('#portfolioFilterSection', false);
            if (window.PortfolioGallery && window.PortfolioGallery.openConceptByStt) {
                const opened = window.PortfolioGallery.openConceptByStt(conceptStt);
                if (opened) {
                    console.log(`🎯 [GOLDEN STUDIO] Đã mở Concept #${conceptStt} từ URL`);
                }
            }
        }, 200);
        return;
    }

    // Trường hợp 2: Lọc theo Chủ đề (?chude=...)
    if (theme) {
        setTimeout(() => {
            scrollToSection('#portfolioFilterSection', true);
            if (window.PortfolioGallery && window.PortfolioGallery.filterByTheme) {
                window.PortfolioGallery.filterByTheme(theme);
                console.log(`🎯 [GOLDEN STUDIO] Đã lọc theo chủ đề: "${theme}"`);
            }
        }, 150);
    }
}

/**
 * Quản lý Hero Cover Slider tự động thay đổi
 */
function setupHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    const sliderSection = document.getElementById('heroSliderSection');

    if (!slides || slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    const autoPlaySpeed = window.STUDIO_CONFIG?.heroSlider?.autoplaySpeed || 5000;
    let slideInterval = null;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

        currentSlide = (index + totalSlides) % totalSlides;

        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, autoPlaySpeed);
    }

    function stopAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
    }

    // Gắn sự kiện nút mũi tên
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoPlay();
        });
    }

    // Gắn sự kiện click dots
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            goToSlide(idx);
            startAutoPlay();
        });
    });

    // Dừng auto play khi rê chuột vào slider
    if (sliderSection) {
        sliderSection.addEventListener('mouseenter', stopAutoPlay);
        sliderSection.addEventListener('mouseleave', startAutoPlay);

        // Hỗ trợ Touch Swipe trên di động cho Hero Slider
        let touchStartX = 0;
        let touchEndX = 0;
        sliderSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                startAutoPlay();
            }
        }, { passive: true });
    }

    // Bắt đầu chạy tự động
    startAutoPlay();
}

/**
 * Xử lý trạng thái Header (Trong suốt khi ở Hero -> Nền trắng khi cuộn xuống)
 */
function setupHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    function checkHeader() {
        if (window.scrollY > 60) {
            header.classList.remove('transparent');
            header.classList.add('scrolled');
        } else {
            header.classList.add('transparent');
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', checkHeader, { passive: true });
    checkHeader();
}

/**
 * Hiệu ứng xuất hiện mượt mà khi cuộn trang (Scroll Reveal)
 */
function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Fallback cho trình duyệt cũ
        revealElements.forEach(el => el.classList.add('revealed'));
    }
}

/**
 * Nạp thông tin cấu hình từ config.js vào DOM
 */
function applyConfigToDOM() {
    const config = window.STUDIO_CONFIG;
    if (!config) return;

    // Branding
    if (config.branding) {
        const brandTitle = document.getElementById('brandTitle');
        const brandTagline = document.getElementById('brandTagline');
        if (brandTitle) brandTitle.textContent = config.branding.studioName || "GOLDEN STUDIO";
        if (brandTagline) brandTagline.textContent = config.branding.studioTagline || "PHOTOGRAPHY";
    }

    // Headings
    if (config.headings) {
        const h = config.headings;
        
        // Navigation links
        if (h.nav) {
            if (document.getElementById('navPortfolio')) document.getElementById('navPortfolio').textContent = h.nav.portfolio;
            if (document.getElementById('navPricing')) document.getElementById('navPricing').textContent = h.nav.pricing;
            if (document.getElementById('navAbout')) document.getElementById('navAbout').textContent = h.nav.about;
            if (document.getElementById('navContact')) document.getElementById('navContact').textContent = h.nav.contact;
        }

        // Pricing section
        if (h.pricing) {
            if (document.getElementById('pricingTag')) document.getElementById('pricingTag').textContent = h.pricing.tag;
            if (document.getElementById('pricingTitle')) document.getElementById('pricingTitle').textContent = h.pricing.title;
            if (document.getElementById('pricingSubtitle')) document.getElementById('pricingSubtitle').textContent = h.pricing.subtitle;
        }

        // About section
        if (h.about) {
            if (document.getElementById('aboutQuote')) document.getElementById('aboutQuote').textContent = h.about.quote;
            if (document.getElementById('aboutAuthor')) document.getElementById('aboutAuthor').textContent = h.about.author;
        }

        // Contact section
        if (h.contact) {
            if (document.getElementById('contactTag')) document.getElementById('contactTag').textContent = h.contact.tag;
            if (document.getElementById('contactTitle')) document.getElementById('contactTitle').textContent = h.contact.title;
            if (document.getElementById('contactSubtitle')) document.getElementById('contactSubtitle').textContent = h.contact.subtitle;
        }

        // Footer
        if (h.footer && document.getElementById('footerCopyright')) {
            document.getElementById('footerCopyright').textContent = h.footer.copyright;
        }
    }

    // Contact info
    if (config.contact) {
        const c = config.contact;
        const hotlineEl = document.getElementById('contactHotline');
        const zaloEl = document.getElementById('contactZalo');
        const messengerEl = document.getElementById('contactMessenger');
        const emailEl = document.getElementById('contactEmail');

        if (hotlineEl && c.hotline) {
            hotlineEl.textContent = c.hotline;
            hotlineEl.href = `tel:${c.hotline.replace(/\s+/g, '')}`;
        }
        if (zaloEl && c.zaloUrl) zaloEl.href = c.zaloUrl;
        const mapEl = document.getElementById('contactMap');
        if (mapEl && c.mapUrl) mapEl.href = c.mapUrl;
        if (messengerEl && c.messengerUrl) messengerEl.href = c.messengerUrl;
        if (emailEl && c.email) {
            emailEl.textContent = c.email;
            emailEl.href = `mailto:${c.email}`;
        }
        if (c.socials) {
            if (c.socials.facebook) {
                document.querySelectorAll('a.icon-fb, a.footer-social-link[href*="facebook.com"]').forEach(el => el.href = c.socials.facebook);
            }
            if (c.socials.instagram) {
                document.querySelectorAll('a.icon-insta, a.footer-social-link[href*="instagram.com"]').forEach(el => el.href = c.socials.instagram);
            }
            if (c.socials.tiktok) {
                document.querySelectorAll('a.icon-tiktok, a.footer-social-link[href*="tiktok.com"]').forEach(el => el.href = c.socials.tiktok);
            }
        }
    }
}

/**
 * Render Bảng So Sánh Phân Khúc Gói Chụp (Luxury Comparison Matrix Table)
 * - Thiết kế nằm ngang thẳng hàng tuyệt đối (100% thẳng thớm, không lồi lõm)
 * - Nằm gọn gàng trọn vẹn trong 1 trang màn hình
 * - Dễ dàng đối chiếu quyền lợi giữa 3 gói
 */
function renderPricingSegments() {
    const pricingContainer = document.getElementById('pricingGrid');
    const packages = window.STUDIO_CONFIG?.packages || [];
    if (!pricingContainer || packages.length === 0) return;

    // Danh sách 7 tiêu chí so sánh chuẩn hóa
    const criteriaList = [
        { key: "CONCEPT", title: "CONCEPT CHỤP" },
        { key: "BACKGROUND", title: "BỐI CẢNH / BACKGROUND" },
        { key: "TRANG PHỤC", title: "TRANG PHỤC & PHỤ KIỆN" },
        { key: "MAKEUP", title: "MAKEUP & LÀM TÓC" },
        { key: "ẢNH", title: "SỐ LƯỢNG ẢNH BÀN GIAO" },
        { key: "HỖ TRỢ", title: "HỖ TRỢ BUỔI CHỤP" },
        { key: "THỜI GIAN", title: "THỜI LƯỢNG CHỤP" }
    ];

    // Helper bóc tách nội dung tương ứng theo từng tiêu chí
    function getFeatureDesc(pkg, critKey) {
        if (!Array.isArray(pkg.features)) return "—";
        for (const feat of pkg.features) {
            let label = "";
            let desc = "";
            if (typeof feat === "object" && feat !== null) {
                label = feat.label || "";
                desc = feat.desc || "";
            } else if (typeof feat === "string") {
                const match = feat.match(/<strong>([^<:]+)(?::)?<\/strong>(?::)?\s*(.*)/i) || feat.match(/^([^:]+):\s*(.*)/);
                if (match) {
                    label = match[1].replace(/:$/, "").trim();
                    desc = match[2].replace(/^<\/strong>\s*/i, "").trim();
                } else {
                    desc = feat.replace(/^—\s*/, "").trim();
                }
            }

            const cleanLabel = label.toUpperCase().normalize("NFC");
            const targetKey = critKey.toUpperCase().normalize("NFC");

            if (cleanLabel.includes(targetKey)) {
                return desc;
            }
        }
        return "—";
    }

    // 1. DESKTOP / TABLET MATRIX TABLE (Bảng ma trận ngang trên màn hình lớn)
    let desktopTableHtml = `
        <div class="pricing-matrix-wrapper">
            <div class="pricing-matrix-scroll">
                <table class="pricing-matrix-table">
                    <thead>
                        <tr>
                            <th class="matrix-th-label">
                                <div class="matrix-badge-container"></div>
                                <span class="th-eyebrow">DANH MỤC TIÊU CHÍ</span>
                                <h3 class="th-main-title">SO SÁNH QUYỀN LỢI</h3>
                            </th>
                            ${packages.map(pkg => {
                                const isFeatured = pkg.featured ? 'featured' : '';
                                let badgeHtml = '';
                                if (pkg.badge) {
                                    const isPop = pkg.id === 'standard' || pkg.badge.toUpperCase().includes('POPULAR');
                                    badgeHtml = `
                                        <div class="matrix-badge-pill ${isPop ? 'badge-gold' : 'badge-dark'}">
                                            ${isPop ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-gem"></i>'} ${pkg.badge}
                                        </div>
                                    `;
                                }
                                return `
                                    <th class="matrix-th-pkg ${isFeatured}">
                                        <div class="matrix-badge-container">${badgeHtml}</div>
                                        <span class="matrix-pkg-segment">${pkg.segment}</span>
                                        <h3 class="matrix-pkg-title">${pkg.name}</h3>
                                        <div class="matrix-pkg-price">
                                            <span class="matrix-price-num">${pkg.price}</span>
                                            <span class="matrix-price-sub">${pkg.priceSub || '/ concept'}</span>
                                        </div>
                                    </th>
                                `;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${criteriaList.map((crit, idx) => `
                            <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
                                <td class="matrix-td-label">
                                    <span class="crit-bullet"></span>
                                    <span class="crit-text">${crit.title}</span>
                                </td>
                                ${packages.map(pkg => `
                                    <td class="matrix-td-val ${pkg.featured ? 'featured-col' : ''}">
                                        ${getFeatureDesc(pkg, crit.key)}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="matrix-footer-row">
                            <td class="matrix-td-label footer-corner"></td>
                            ${packages.map(pkg => `
                                <td class="matrix-td-val footer-val ${pkg.featured ? 'featured-col' : ''}">
                                    <button class="matrix-book-btn ${pkg.featured ? 'btn-featured' : ''}" data-package-select="${pkg.id}">
                                        <span>ĐẶT LỊCH GÓI NÀY</span>
                                        <i class="fas fa-arrow-right"></i>
                                    </button>
                                </td>
                            `).join('')}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;

    // 2. MOBILE DEDICATED VIEW (Thẻ chi tiết thoáng đãng + Tabs cho điện thoại)
    let mobileViewHtml = `
        <div class="pricing-mobile-wrapper">
            <!-- Segmented Switcher Tabs -->
            <div class="pricing-mobile-nav">
                ${packages.map(pkg => {
                    const isPop = pkg.id === 'standard' || (pkg.badge && pkg.badge.toUpperCase().includes('POPULAR'));
                    const isVip = pkg.id === 'premium' || (pkg.badge && pkg.badge.toUpperCase().includes('VIP'));
                    let iconHtml = '';
                    if (isPop) iconHtml = '<i class="fas fa-crown"></i> ';
                    else if (isVip) iconHtml = '<i class="fas fa-gem"></i> ';
                    return `
                        <button class="pricing-mobile-nav-btn ${pkg.featured ? 'active is-featured' : ''}" data-pkg-target="${pkg.id}">
                            ${iconHtml}<span>${pkg.name.replace(/^GÓI\s+/i, '')}</span>
                        </button>
                    `;
                }).join('')}
            </div>

            <!-- Cards Container -->
            <div class="pricing-mobile-cards" id="mobilePricingCards">
                ${packages.map(pkg => {
                    const isFeatured = pkg.featured ? 'is-featured' : '';
                    const isPop = pkg.id === 'standard' || (pkg.badge && pkg.badge.toUpperCase().includes('POPULAR'));
                    return `
                        <div class="pricing-mobile-card ${pkg.featured ? 'active' : ''} ${isFeatured}" id="mobile-pkg-${pkg.id}" data-pkg-id="${pkg.id}">
                            <div class="mobile-card-header">
                                ${pkg.badge ? `
                                    <div class="matrix-badge-pill ${isPop ? 'badge-gold' : 'badge-dark'}">
                                        ${isPop ? '<i class="fas fa-crown"></i>' : '<i class="fas fa-gem"></i>'} ${pkg.badge}
                                    </div>
                                ` : ''}
                                <span class="mobile-card-segment">${pkg.segment}</span>
                                <h3 class="mobile-card-title">${pkg.name}</h3>
                                <div class="mobile-card-price">
                                    <span class="price-val">${pkg.price}</span>
                                    <span class="price-sub">${pkg.priceSub || '/ concept'}</span>
                                </div>
                            </div>

                            <div class="mobile-card-features">
                                ${criteriaList.map(crit => `
                                    <div class="mobile-feature-row">
                                        <div class="mobile-feature-label">
                                            <span class="crit-bullet"></span>
                                            <span>${crit.title}</span>
                                        </div>
                                        <div class="mobile-feature-desc">
                                            ${getFeatureDesc(pkg, crit.key)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="mobile-card-footer">
                                <button class="mobile-book-btn ${pkg.featured ? 'btn-featured' : ''}" data-package-select="${pkg.id}">
                                    <span>ĐẶT LỊCH GÓI NÀY</span>
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    pricingContainer.innerHTML = desktopTableHtml + mobileViewHtml;

    // Gắn sự kiện chuyển tab gói trên mobile
    const mobileNavBtns = pricingContainer.querySelectorAll('.pricing-mobile-nav-btn');
    const mobileCards = pricingContainer.querySelectorAll('.pricing-mobile-card');

    function switchMobilePackage(pkgId) {
        mobileNavBtns.forEach(btn => {
            if (btn.getAttribute('data-pkg-target') === pkgId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        mobileCards.forEach(card => {
            if (card.getAttribute('data-pkg-id') === pkgId) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const target = this.getAttribute('data-pkg-target');
            switchMobilePackage(target);
        });
    });

    // Hỗ trợ Touch Swipe (vuốt màn hình trái / phải để chuyển gói mượt mà)
    const cardsContainer = document.getElementById('mobilePricingCards');
    if (cardsContainer) {
        let touchStartX = 0;
        let touchEndX = 0;
        const pkgIds = packages.map(p => p.id);

        cardsContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        cardsContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 50) {
                const currentActive = pricingContainer.querySelector('.pricing-mobile-card.active');
                const curId = currentActive ? currentActive.getAttribute('data-pkg-id') : pkgIds[0];
                const curIdx = pkgIds.indexOf(curId);
                if (diff < 0 && curIdx < pkgIds.length - 1) {
                    switchMobilePackage(pkgIds[curIdx + 1]);
                } else if (diff > 0 && curIdx > 0) {
                    switchMobilePackage(pkgIds[curIdx - 1]);
                }
            }
        }, { passive: true });
    }

    // Gắn sự kiện click mở modal chọn gói
    pricingContainer.querySelectorAll('[data-package-select]').forEach(btn => {
        btn.addEventListener('click', function () {
            const pkgId = this.getAttribute('data-package-select');
            openBookingModal(pkgId);
        });
    });
}

      /**
 * Cuộn trang chính xác tuyệt đối tới bất kỳ Section hoặc Element nào
 * - Tự động tính toán chiều cao động của Header cố định (Dynamic Header Height)
 * - Tự động kích hoạt hiệu ứng Reveal để loại trừ 30px lệch do CSS animation transform
 * - Tự động căn lề hoàn hảo: 0px đệm cho Sticky Filter Bar, 12px đệm cho các Section
 * - Cập nhật URL Hash không làm giật trang
 */
function scrollToSection(targetSelectorOrId, smooth = true) {
    if (!targetSelectorOrId) return;

    let targetId = String(targetSelectorOrId).trim();
    if (!targetId.startsWith('#') && !targetId.startsWith('.')) {
        targetId = '#' + targetId;
    }

    // Trường hợp đặc biệt 1: Về đầu trang
    if (targetId === '#home' || targetId === '#heroSliderSection') {
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, ' ');
        }
        return;
    }

    // Trường hợp đặc biệt 2: Khi cuộn tới Thư viện ảnh -> Cuộn tới thanh Filter Tabs để nhìn trọn vẹn
    let actualTarget = document.querySelector(targetId);
    if (targetId === '#gallery' || targetId === '#portfolio') {
        const filterSection = document.getElementById('portfolioFilterSection');
        if (filterSection) actualTarget = filterSection;
    }

    if (!actualTarget) return;

    // Kích hoạt class revealed ngay lập tức để layout ổn định tuyệt đối
    actualTarget.classList.add('revealed');

    const siteHeader = document.getElementById('siteHeader');
    const headerHeight = siteHeader ? siteHeader.offsetHeight : 70;

    // Tính tọa độ Y tuyệt đối chính xác
    const rect = actualTarget.getBoundingClientRect();
    const absoluteTop = rect.top + window.pageYOffset;

    // Khoảng đệm mỹ học: Filter Bar áp sát ngay dưới Header (0px), Section khác cách 12px
    const isFilter = (actualTarget.id === 'portfolioFilterSection');
    const offsetPadding = isFilter ? 0 : 12;

    const targetScrollY = Math.max(0, Math.round(absoluteTop - headerHeight - offsetPadding));

    window.scrollTo({
        top: targetScrollY,
        behavior: smooth ? 'smooth' : 'auto'
    });
}
window.scrollToSection = scrollToSection;

/**
 * Điều hướng trang và Mobile Menu
 */
function setupNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navDesktop = document.getElementById('navDesktop');
    const siteHeader = document.getElementById('siteHeader');
    const navLinks = document.querySelectorAll('.nav-desktop .nav-link');

    if (mobileToggle && navDesktop) {
        mobileToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navDesktop.classList.toggle('mobile-open');
            if (siteHeader) siteHeader.classList.toggle('menu-open');
        });
    }

    // Xử lý sự kiện click cho toàn bộ liên kết neo (Anchor Links a[href^="#"])
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#' || targetId === '#!') return;

            // Bỏ qua nếu là nút mở modal
            if (this.getAttribute('data-modal') || this.classList.contains('trigger-booking-modal')) return;

            e.preventDefault();

            // Đóng menu di động nếu đang mở
            if (mobileToggle) mobileToggle.classList.remove('active');
            if (navDesktop) navDesktop.classList.remove('mobile-open');
            if (siteHeader) siteHeader.classList.remove('menu-open');

            scrollToSection(targetId, true);
        });
    });

    // 🎯 SCROLL SPY CHÍNH XÁC 100% (Theo dõi vị trí cuộn mượt mà không nhấp nháy)
    function updateActiveNavLink() {
        if (!navLinks.length) return;

        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const siteHeader = document.getElementById('siteHeader');
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 70;

        // 1. Chạm đáy trang -> Luôn kích hoạt tab LIÊN HỆ
        if (scrollY + windowHeight >= docHeight - 30) {
            setActiveLink('#contact');
            return;
        }

        // 2. Ở phần đầu trang -> Kích hoạt TRANG CHỦ
        if (scrollY < 120) {
            setActiveLink('#heroSliderSection');
            return;
        }

        // 3. Danh sách kiểm tra từ dưới lên trên theo cấu trúc trang
        const sections = [
            { el: document.getElementById('contact'), href: '#contact' },
            { el: document.getElementById('about'), href: '#about' },
            { el: document.getElementById('pricing'), href: '#pricing' },
            { el: document.getElementById('portfolioFilterSection') || document.getElementById('gallery'), href: '#gallery' },
            { el: document.getElementById('heroSliderSection'), href: '#heroSliderSection' }
        ];

        const triggerY = scrollY + headerHeight + 60;
        for (const sec of sections) {
            if (!sec.el) continue;
            const top = sec.el.getBoundingClientRect().top + scrollY;
            if (triggerY >= top) {
                setActiveLink(sec.href);
                return;
            }
        }

        setActiveLink('#heroSliderSection');

        function setActiveLink(activeHref) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                const isMatch = (href === activeHref) || 
                                (activeHref === '#gallery' && (href === '#gallery' || href === '#portfolioFilterSection')) ||
                                (activeHref === '#heroSliderSection' && (href === '#home' || href === '#heroSliderSection'));
                
                if (isMatch) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    // Throttle scroll spy bằng requestAnimationFrame (60 FPS mượt mà)
    let isTicking = false;
    window.addEventListener('scroll', function () {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateActiveNavLink();
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });

    // Cập nhật trạng thái ngay khi vừa khởi tạo trang
    updateActiveNavLink();
}

/**
 * Modal Đặt lịch hẹn
 */
function setupBookingModal() {
    const modal = document.getElementById('bookingModal');
    const modalClose = document.getElementById('bookingModalClose');
    const bookingForm = document.getElementById('bookingForm');

    if (modalClose && modal) {
        modalClose.addEventListener('click', () => closeBookingModal());
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeBookingModal();
        });
    }

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeBookingModal();
        }
    });

    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('clientName').value;
            const phone = document.getElementById('clientPhone').value;
            const pkg = document.getElementById('clientPackage').value;
            const note = document.getElementById('clientNote').value;

            const config = window.STUDIO_CONFIG?.contact;
            const zaloUrl = config?.zaloUrl || 'https://zalo.me';

            const studioName = window.STUDIO_CONFIG?.branding?.studioName || 'Golden Studio';

            // Soạn sẵn tin nhắn đặt lịch chuyên nghiệp
            const bookingMessage = `✦ YÊU CẦU ĐẶT LỊCH CHỤP - ${studioName.toUpperCase()} ✦\n` +
                `• Họ và tên: ${name}\n` +
                `• Số điện thoại: ${phone}\n` +
                `• Gói quan tâm: ${pkg || 'Tư vấn theo phong cách'}\n` +
                `• Ghi chú: ${note || 'Không'}\n` +
                `• Thời gian gửi: ${new Date().toLocaleString('vi-VN')}`;

            // Tự động sao chép vào bộ nhớ tạm của khách
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(bookingMessage).catch(() => {});
            }

            closeBookingModal();
            bookingForm.reset();

            alert(`✨ Đã tự động sao chép thông tin đặt lịch của bạn!\n\nĐang mở Zalo của ${studioName}, bạn chỉ cần bấm Dán (Ctrl + V) vào khung chat để gửi nhé!`);
            window.open(zaloUrl, '_blank');
        });
    }
}

function openBookingModal(packageId = null) {
    const modal = document.getElementById('bookingModal');
    const selectEl = document.getElementById('clientPackage');

    if (packageId && selectEl) {
        selectEl.value = packageId;
    }

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Gắn hàm mở modal ra window để gọi từ các nút hero
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
