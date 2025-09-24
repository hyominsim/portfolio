(() => {
  const modal = document.getElementById('modal');
  const overlay = modal.querySelector('[data-close]');
  const dialog = modal.querySelector('.dialog');
  const imgEl = document.getElementById('viewer-image');
  const capEl = document.getElementById('viewer-caption');
  const titleEl = document.getElementById('modal-title');
  const prevBtn = modal.querySelector('[data-prev]');
  const nextBtn = modal.querySelector('[data-next]');
  const prevProjectBtn = modal.querySelector('[data-prev-project]');
  const nextProjectBtn = modal.querySelector('[data-next-project]');
  const closeEls = modal.querySelectorAll('[data-close]');
  const previewLink = document.getElementById('preview-link');

  let activeProject = null;
  let activeIndex = 0;
  let lastFocused = null;
  let allProjects = [];
  let currentProjectIndex = 0;

  function openModal(project) {
    activeProject = project;
    activeIndex = 0;
    lastFocused = document.activeElement;
    
    // Find current project index in all projects
    currentProjectIndex = allProjects.findIndex(p => p.id === project.id);
    if (currentProjectIndex === -1) currentProjectIndex = 0;
    
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
    const projectNumber = currentProjectIndex + 1;
    const totalProjects = allProjects.length;
    titleEl.textContent = `${title} (${activeIndex + 1}/${images.length}) - 프로젝트 ${projectNumber}/${totalProjects}`;
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

  function showNextProject() {
    if (allProjects.length === 0) return;
    currentProjectIndex = (currentProjectIndex + 1) % allProjects.length;
    const nextProject = allProjects[currentProjectIndex];
    activeProject = nextProject;
    activeIndex = 0;
    updateViewer();
  }

  function showPrevProject() {
    if (allProjects.length === 0) return;
    currentProjectIndex = (currentProjectIndex - 1 + allProjects.length) % allProjects.length;
    const prevProject = allProjects[currentProjectIndex];
    activeProject = prevProject;
    activeIndex = 0;
    updateViewer();
  }

  // Collect all projects
  function collectAllProjects() {
    allProjects = [];
    document.querySelectorAll('.thumb').forEach((btn) => {
      try {
        const project = JSON.parse(btn.getAttribute('data-project'));
        allProjects.push(project);
      } catch (e) {
        console.error('Invalid project data', e);
      }
    });
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

  // Initialize projects collection
  collectAllProjects();

  // Close actions
  closeEls.forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') {
      if (e.shiftKey) {
        showPrevProject(); // Shift + Left: 이전 프로젝트
      } else {
        showPrev(); // Left: 이전 이미지
      }
    }
    if (e.key === 'ArrowRight') {
      if (e.shiftKey) {
        showNextProject(); // Shift + Right: 다음 프로젝트
      } else {
        showNext(); // Right: 다음 이미지
      }
    }
  });

  prevBtn.addEventListener('click', (e) => {
    if (e.shiftKey) {
      showPrevProject(); // Shift + 클릭: 이전 프로젝트
    } else {
      showPrev(); // 클릭: 이전 이미지
    }
  });
  
  nextBtn.addEventListener('click', (e) => {
    if (e.shiftKey) {
      showNextProject(); // Shift + 클릭: 다음 프로젝트
    } else {
      showNext(); // 클릭: 다음 이미지
    }
  });

  // Project navigation buttons
  prevProjectBtn.addEventListener('click', showPrevProject);
  nextProjectBtn.addEventListener('click', showNextProject);

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
      if (dx > 0) {
        if (Math.abs(dx) > 100) {
          showPrevProject(); // 긴 스와이프: 이전 프로젝트
        } else {
          showPrev(); // 짧은 스와이프: 이전 이미지
        }
      } else {
        if (Math.abs(dx) > 100) {
          showNextProject(); // 긴 스와이프: 다음 프로젝트
        } else {
          showNext(); // 짧은 스와이프: 다음 이미지
        }
      }
    }
  });
})();

// Detail page script (lightweight, only when on detail.html)
(() => {
  function initDetailPage() {
    console.log('Detail page script running...');
    console.log('Current pathname:', location.pathname);
    
    if (!location.pathname.endsWith('detail.html')) {
      console.log('Not on detail page, exiting...');
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const id = params.get('project');
    console.log('Project ID from URL:', id);
  
  // Project data mapping with folder paths and image lists
  const projectData = {
    p1: {
      title: '기업 브랜드 홈페이지',
      folder: 'indisair',
      images: [
        'in_img01.jpg',
        'in_img02.jpg', 
        'in_img03.png',
        'in_img04.jpg',
        'in_img05.jpg',
        'in_img06.png',
        'in_img07.jpg'
      ],
      description: '풀페이지 컨셉 홈페이지 퍼블리싱',
      designIntent: '기업의 브랜드 아이덴티티를 효과적으로 전달하는 풀페이지 홈페이지를 설계했습니다. 스크롤 기반의 인터랙티브한 요소와 시각적 스토리텔링을 통해 방문자에게 강한 인상을 남기고, 브랜드 가치를 명확하게 전달할 수 있도록 했습니다.',
      deliverables: [
        '풀페이지 레이아웃 설계',
        '인터랙티브 스크롤 애니메이션',
        '브랜드 아이덴티티 반영'
      ]
    },
    p2: {
      title: '공공기관 키오스크 화면 디자인',
      folder: 'chuncheon',
      images: [
        'kiosk_img01.jpg',
        'kiosk_img02.png',
        'kiosk_img03.png',
        'kiosk_img04.png',
        'kiosk_img05.png',
        'kiosk_img06.png',
        'kiosk_img07.png'
      ],
      description: '업무 효율을 위한 플로우 최적화',
      designIntent: '공공기관 키오스크의 복잡한 업무 프로세스를 사용자 친화적으로 단순화했습니다. 터치 인터페이스에 최적화된 큰 버튼과 직관적인 아이콘을 사용하여 모든 연령대의 시민이 쉽게 이용할 수 있도록 설계했습니다.',
      deliverables: [
        '터치 인터페이스 최적화',
        '직관적 네비게이션 설계',
        '접근성 고려 UI/UX',
        '사용자 테스트 및 개선'
      ]
    },
    p3: {
      title: '학교 사이트 UI/UX 디자인',
      folder: 'graduate',
      images: [
        'graduate_img01.jpg',
        'graduate_img02.jpg',
        'graduate_img03.jpg',
        'graduate_img04.jpg',
        'graduate_img05.jpg'
      ],
      description: '디자인 및 반응형 퍼블리싱 작업',
      designIntent: '학교의 교육적 가치와 따뜻한 분위기를 반영한 웹사이트를 설계했습니다. 학생, 학부모, 교직원 모두가 쉽게 정보를 찾을 수 있도록 명확한 정보구조를 구축하고, 모바일 환경에서도 최적의 경험을 제공하도록 반응형으로 구현했습니다.',
      deliverables: [
        '학교 브랜딩 반영 디자인',
        '반응형 웹 퍼블리싱',
        '사용자별 맞춤 정보구조',
        '모바일 최적화 구현'
      ]
    },
    p4: {
      title: '사내 대시보드 화면 디자인',
      folder: 'IMU',
      images: [
        'dashboard_img01.jpg',
        'dashboard_img02.jpg',
        'dashboard_img03.jpg',
        'dashboard_img04.jpg'
      ],
      description: '대시보드 화면 UI/UX 설계',
      designIntent: '복잡한 사내 데이터를 직관적으로 파악할 수 있는 대시보드를 설계했습니다. 실시간 데이터 모니터링과 효율적인 의사결정을 지원하기 위해 차트와 그래프를 활용한 시각화 인터페이스를 구현했습니다.',
      deliverables: [
        '데이터 시각화 설계',
        '실시간 모니터링 인터페이스',
        '직관적 차트 컴포넌트',
        '사용자 맞춤 대시보드'
      ]
    },
    p5: {
      title: '데이터 적재 화면 UI/UX 디자인',
      folder: 'miso',
      images: [
        'miso_img01.jpg',
        'miso_img02.jpg',
        'PHR_img01.jpg',
        'PHR_img02.jpg',
        'PHR_img03.jpg'
      ],
      description: '전체 디자인 및 반응형 퍼블리싱 작업',
      designIntent: '데이터 적재 과정의 복잡함을 단순화하고 사용자 친화적인 인터페이스를 설계했습니다. 단계별 진행 상황을 명확히 표시하고, 오류 발생 시 직관적인 피드백을 제공하여 데이터 처리 효율성을 극대화했습니다.',
      deliverables: [
        '데이터 적재 플로우 설계',
        '진행 상황 시각화',
        '오류 처리 인터페이스',
        '반응형 퍼블리싱 구현'
      ]
    },
    p6: {
      title: '강의 사이트 디자인 및 반응형 작업',
      folder: 'IMU',
      images: [
        'dashboard_img01.jpg',
        'dashboard_img02.jpg',
        'dashboard_img03.jpg',
        'dashboard_img04.jpg'
      ],
      description: '리뉴얼 사이트 디자인 및 반응형',
      designIntent: '기존 강의 사이트의 사용성을 개선하고 현대적인 디자인으로 리뉴얼했습니다. 학습자들이 강의 콘텐츠에 집중할 수 있도록 깔끔한 레이아웃을 구성하고, 다양한 디바이스에서 일관된 경험을 제공하도록 반응형으로 구현했습니다.',
      deliverables: [
        '사이트 리뉴얼 디자인',
        '학습자 중심 UX 설계',
        '반응형 웹 구현',
        '콘텐츠 관리 시스템 연동'
      ]
    },
    p7: {
      title: '시각화 대시보드 화면 UI 구축',
      folder: 'kisti',
      images: [
        'kisti_img01.jpg',
        'kisti_img02.jpg',
        'kisti_img03.png'
      ],
      description: '시각화 대시보드 디자인',
      designIntent: '복잡한 데이터를 효과적으로 시각화하여 사용자가 한눈에 파악할 수 있는 대시보드를 구축했습니다. 인터랙티브한 차트와 그래프를 통해 데이터 탐색이 가능하도록 하고, 사용자 맞춤형 필터링 기능을 제공했습니다.',
      deliverables: [
        '인터랙티브 데이터 시각화',
        '사용자 맞춤 필터링',
        '실시간 데이터 업데이트',
        '반응형 대시보드 구현'
      ]
    },
    p8: {
      title: '단순 대시보드 화면 UI/UX 구축',
      folder: 'dashboard',
      images: [
        'board01.jpg',
        'board02_1.jpg',
        'board02.jpg'
      ],
      description: '리스트와 input, table 포함한 디자인 및 퍼블리싱',
      designIntent: '업무 효율성을 높이기 위해 단순하고 직관적인 대시보드를 설계했습니다. 리스트, 입력 폼, 테이블 등의 기본 컴포넌트를 체계적으로 구성하여 사용자가 필요한 정보를 빠르게 찾고 작업할 수 있도록 했습니다.',
      deliverables: [
        '기본 컴포넌트 설계',
        '데이터 테이블 최적화',
        '입력 폼 UX 개선',
        '전체 퍼블리싱 구현'
      ]
    },
    p9: {
      title: '사내 CRM 홈페이지 구축',
      folder: 'crm',
      images: [
        'crm_img01.jpg',
        'crm_img02.jpg'
      ],
      description: '전체 디자인 및 퍼블리싱 담당하여 진행',
      designIntent: '사내 CRM 시스템의 효율성을 높이기 위해 직원들이 자주 사용하는 기능에 집중한 홈페이지를 구축했습니다. 업무 프로세스에 맞는 정보구조를 설계하고, 직관적인 네비게이션을 통해 업무 효율성을 극대화했습니다.',
      deliverables: [
        'CRM 시스템 홈페이지 설계',
        '업무 프로세스 최적화',
        '직원 맞춤 인터페이스',
        '전체 퍼블리싱 구현'
      ]
    }
  };

  const project = projectData[id] || {
    title: '프로젝트 상세',
    folder: '',
    images: [],
    description: '프로젝트 상세 설명'
  };

  // Update page title and description
  const titleEl = document.getElementById('detail-title');
  const descEl = document.getElementById('detail-desc');
  const projectDescEl = document.getElementById('project-description');
  const deliverablesEl = document.getElementById('project-deliverables');
  
  if (titleEl) titleEl.textContent = project.title;
  if (descEl) descEl.textContent = `${project.title}의 상세 기획 의도와 추가 시각자료를 소개합니다.`;
  if (projectDescEl) projectDescEl.textContent = project.designIntent || project.description;
  
  // Update deliverables
  if (deliverablesEl && project.deliverables) {
    deliverablesEl.innerHTML = '';
    project.deliverables.forEach(deliverable => {
      const li = document.createElement('li');
      li.textContent = deliverable;
      deliverablesEl.appendChild(li);
    });
  }

  // Load and display images dynamically
  const galleryEl = document.getElementById('project-gallery');
  console.log('Gallery element:', galleryEl);
  console.log('Project data:', project);
  
  if (galleryEl && project.images.length > 0) {
    galleryEl.innerHTML = '';
    project.images.forEach((imageName, index) => {
      const img = document.createElement('img');
      img.src = `./img/${project.folder}/${imageName}`;
      img.alt = `${project.title} 상세 이미지 ${index + 1}`;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.marginBottom = '20px';
      img.style.borderRadius = '8px';
      img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      galleryEl.appendChild(img);
    });
    console.log('Images loaded successfully');
  } else {
    console.log('Gallery element not found or no images available');
  }
  }
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailPage);
  } else {
    initDetailPage();
  }
  
  // Test functions for debugging
  window.testLoadImages = function() {
    console.log('Testing image load...');
    const galleryEl = document.getElementById('project-gallery');
    console.log('Gallery element:', galleryEl);
    
    if (galleryEl) {
      galleryEl.innerHTML = '';
      const testImg = document.createElement('img');
      testImg.src = './img/indisair/in_img01.jpg';
      testImg.alt = 'Test image';
      testImg.style.width = '100%';
      testImg.style.height = 'auto';
      testImg.style.marginBottom = '20px';
      galleryEl.appendChild(testImg);
      console.log('Test image added');
    }
  };
  
  window.testLoadProject = function(projectId) {
    console.log('Testing project load:', projectId);
    window.location.href = `detail.html?project=${projectId}`;
  };
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


