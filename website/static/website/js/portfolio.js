/* ========================================
   PORTFOLIO PAGE INTERACTIVITY
   Filtering, Modal, Stats & Masonry Grid
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

    // --- 0. SKELETON LOADING SIMULATION ---
    const skeletonLoader = document.getElementById('skeleton-loader');
    const projectGrid = document.getElementById('projectGrid');

    // Simulate loading delay (remove in production if using real htmx/ajax)
    if (skeletonLoader && projectGrid) {
        skeletonLoader.classList.remove('d-none');
        projectGrid.style.opacity = '0';

        setTimeout(() => {
            skeletonLoader.classList.add('d-none');
            projectGrid.style.opacity = '1';
            // Trigger Masonry Layout Recalc
            resizeAllGridItems();
        }, 800);
    }

    // --- 1. HERO LIVE STATS ANIMATION ---
    const stats = document.querySelectorAll('.stat-item strong');

    const animateStats = () => {
        stats.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const duration = 2000;
            const increment = target / (duration / 16);

            let current = 0;
            const updateCount = () => {
                current += increment;
                if (current < target) {
                    stat.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.innerText = target;
                    // Add suffix logic if needed
                }
            };
            updateCount();
        });
    };

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateStats();
                observer.disconnect();
            }
        });
        observer.observe(heroStats);
    }


    // --- 2. SMART FILTERING LOGIC ---
    const filterPills = document.querySelectorAll('.filter-pill');
    const projectCards = document.querySelectorAll('.project-card');
    const showingCount = document.getElementById('showing-count');

    filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-filter');
            filterProjects(category);
        });
    });

    function filterProjects(category) {
        let visibleCount = 0;

        projectCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');

            if (category === 'all' || cardCategory === category) {
                card.style.display = 'flex'; // Restore display
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
            }
        });

        if (showingCount) showingCount.innerText = visibleCount;

        // Recalculate Masonry Layout after filtering
        setTimeout(resizeAllGridItems, 100);
    }


    // --- 3. MASONRY LAYOUT (Grid + JS) ---
    // Calculates row spans based on content height
    function resizeGridItem(item) {
        const grid = document.querySelector('.masonry-grid');
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));

        // Reset span to measure natural height
        item.style.gridRowEnd = 'auto';

        const contentHeight = item.querySelector('.pc-content').getBoundingClientRect().height +
            item.querySelector('.pc-image-wrapper').getBoundingClientRect().height;

        // Add borders/padding if needed, usually included in bounding rect if box-sizing border-box

        // Calculate span
        // We use a simplified approach: measure the card's FULL height
        const cardHeight = item.getBoundingClientRect().height;

        const rowSpan = Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap));

        // Apply span, unless it's a featured card with explicit styling (check class)
        // However, user wants featured to be row-span-2.
        // If we duplicate logic we might break CSS rules. 
        // Let's only apply to standard cards or let CSS handle "featured" and JS handle variable height standard cards.

        // For this "Fix", we'll trust the CSS Grid to handle explicit rows for Featured
        // and let the grid-auto-flow handle the rest, OR we impl true masonry.
        // Given the request "grid-auto-rows: 10px", we MUST use JS or manually set spans.

        if (!item.classList.contains('featured')) {
            item.style.gridRowEnd = `span ${rowSpan}`;
        }
    }

    function resizeAllGridItems() {
        // Only valid if grid-auto-rows is set to a small value (px)
        const grid = document.querySelector('.masonry-grid');
        if (!grid) return;

        const allItems = document.querySelectorAll('.project-card');
        allItems.forEach(item => {
            if (item.style.display !== 'none') {
                // Wait for images to load?
                imagesLoaded(item, () => resizeGridItem(item));
            }
        });
    }

    // Simple image load checker
    function imagesLoaded(item, callback) {
        const img = item.querySelector('img');
        if (img.complete) {
            callback();
        } else {
            img.addEventListener('load', callback);
            img.addEventListener('error', callback);
        }
    }

    // Resize on window resize
    window.addEventListener('resize', resizeAllGridItems);

    // Initial call
    resizeAllGridItems();


    // --- 4. PROJECT DETAIL MODAL ---
    const modalBackdrop = document.getElementById('project-modal');
    const closeModalBtn = document.querySelector('.modal-close');
    const quickViewBtns = document.querySelectorAll('.btn-quick-view');

    // Elements
    const mTitle = document.getElementById('m-title');
    const mCategory = document.getElementById('m-category');
    const mImg = document.getElementById('m-img');
    const mLoc = document.getElementById('m-loc');

    // Open Modal
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const card = this.closest('.project-card');

            // Populate
            mTitle.innerText = card.querySelector('.pc-title').innerText;
            mCategory.innerText = card.getAttribute('data-category');
            mImg.src = card.querySelector('.pc-image').src;

            // Extract location from meta
            const locText = card.querySelector('.pc-meta-item').innerText;
            if (mLoc) mLoc.innerText = locText;

            modalBackdrop.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modalBackdrop.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
    });

});
