(() => {
  const modal = document.getElementById('modal');
  const overlay = modal.querySelector('[data-close]');
  const dialog = modal.querySelector('.dialog');
  const imgEl = document.getElementById('viewer-image');
  const capEl = document.getElementById('viewer-caption');
  const titleEl = document.getElementById('modal-title');
  const prevBtn = modal.querySelector('[data-prev]');
  const nextBtn = modal.querySelector('[data-next]');
  const closeEls = modal.querySelectorAll('[data-close]');
  const previewLink = document.getElementById('preview-link');

  let activeProject = null;
  let activeIndex = 0;
  let lastFocused = null;

  function openModal(project) {
    activeProject = project;
    activeIndex = 0;
    lastFocused = document.activeElement;
    updateViewer();
    modal.setAttribute('aria-hidden', 'false');
    // Focus trap start
    const focusable = dialog.querySelectorAll('a[href], button, textarea, input, select');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handleTrap(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    dialog.addEventListener('keydown', handleTrap);
    dialog.dataset.trap = 'true';
    dialog.dataset.trapHandler = 'active';
    setTimeout(() => {
      // Focus the close button for immediate accessibility
      const closeBtn = dialog.querySelector('[data-close]');
      closeBtn && closeBtn.focus();
    }, 0);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocused) {
      lastFocused.focus();
    }
  }

  function updateViewer() {
    if (!activeProject) return;
    const { title, images, id } = activeProject;
    const current = images[activeIndex];
    titleEl.textContent = `${title} (${activeIndex + 1}/${images.length})`;
    imgEl.src = current.src;
    imgEl.alt = current.alt || title;
    capEl.textContent = current.alt || '';
    previewLink.href = `detail.html?project=${encodeURIComponent(id)}`;
  }

  function showPrev() {
    if (!activeProject) return;
    activeIndex = (activeIndex - 1 + activeProject.images.length) % activeProject.images.length;
    updateViewer();
  }

  function showNext() {
    if (!activeProject) return;
    activeIndex = (activeIndex + 1) % activeProject.images.length;
    updateViewer();
  }

  // Event wiring for thumbnails
  document.querySelectorAll('.thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        const project = JSON.parse(btn.getAttribute('data-project'));
        openModal(project);
      } catch (e) {
        console.error('Invalid project data', e);
      }
    });
  });

  // Close actions
  closeEls.forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Touch swipe for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  imgEl.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });
  imgEl.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (dx > 0) showPrev(); else showNext();
    }
  });
})();

// Detail page script (lightweight, only when on detail.html)
(() => {
  if (!location.pathname.endsWith('detail.html')) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('project');
  const titleMap = {
    p1: '공공기관 포털 개편',
    p2: '기업 인트라넷 UX 개선',
    p3: '모바일 민원 앱 UI',
    p4: '공공데이터 시각화 플랫폼',
    p5: '민간 보험 앱 온보딩',
    p6: '지자체 민원 포털 접근성 개선',
    p7: '사내 디자인 시스템',
    p8: '전자결재 모바일 리디자인',
    p9: '공공 캠페인 랜딩',
  };
  const title = titleMap[id] || '프로젝트 상세';
  const titleEl = document.getElementById('detail-title');
  const descEl = document.getElementById('detail-desc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = `${title}의 상세 기획 의도와 추가 시각자료를 소개합니다.`;
})();

// Reveal-on-scroll animations
(() => {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
})();


