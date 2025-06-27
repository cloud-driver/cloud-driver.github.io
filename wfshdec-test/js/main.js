// main.js

function formatBold(text) {
  if (!text) return '';

  // 統一處理 br 為換行符
  text = text.replace(/<br\s*\/?>/gi, '\n');

  text = text.replace(/!\[([^\]]*?)\]\((.*?)\)/g, (_, alt, src) => {
    return `<img src="data/${src}" alt="${alt}" class="img-fluid d-block mx-auto my-2 preview-img" style="cursor: zoom-in;" data-src="data/${src}">`;
  });

  // 移除非 markdown 格式的 !開頭圖連結（獨立 !files/... 類型）
  text = text.replace(/(^|\s)!\S+\.(webp|png|jpg|jpeg|gif)/gi, '');

  const lines = text.split('\n');
  const parsedLines = [];
  let inList = false;

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith('* ')) {
      if (!inList) {
        parsedLines.push('<ul class="mb-2">');
        inList = true;
      }
      parsedLines.push(`<li>${trimmed.slice(2).trim()}</li>`);
    } else {
      if (inList) {
        parsedLines.push('</ul>');
        inList = false;
      }

      if (!trimmed) {
        parsedLines.push('<div style="height: 1rem;"></div>');
      } else {
        parsedLines.push(`<p>${trimmed}</p>`);
      }
    }
  });

  if (inList) parsedLines.push('</ul>');

  const html = parsedLines.join('');

  return html
    .replace(/##(.*?)##/g, '<h5 class="fw-bold mt-3">$1</h5>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="text-decoration:none;" rel="noopener noreferrer">$1</a>')
    .replace(/\{([^\}]+)\}\(([^)]+)\)/g,
      '<div class="text-center mt-3"><a class="btn btn-primary" href="$2" target="_blank" rel="noopener noreferrer">$1</a></div>');
}

// 只顯示標題 + 日期
function createDateCard(item) {
  return `
    <div class="card mb-3 clickable-card" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        ${item.date ? `<p class="card-text">${item.date}</p>` : ''}
      </div>
    </div>
  `;
}

// 簡易卡片：只顯示標題 + tags
function createCompactCard(item) {
  return `
    <div class="card mb-3 clickable-card" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        ${item.tags?.length ? `<p class="text-muted small mb-0">${item.tags.join(" ")}</p>` : ''}
      </div>
    </div>
  `;
}

// 完整卡片：標題 + 副標題 + 內容（只給 intro 用）
function createClickableCard(item) {
  return `
    <div class="card mb-3 clickable-card" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        ${item.subtitle ? `<h6 class="card-subtitle mb-2 text-muted">${item.subtitle}</h6>` : ''}
        <div class="card-text">${formatBold(item.content || '')}</div>
      </div>
    </div>
  `;
}

fetch('data/data.json')
  .then(response => response.json())
  .then(data => {
    const pathname = window.location.pathname;

    if (pathname.includes("index.html") || pathname.endsWith("/")) {
      renderIntro(data.home.introduction);
      renderAchievements(data.home.achievements);
      renderNews(data.home.news);
      renderEvents(data.home.events);
    }

    if (pathname.includes("courses.html")) {
      renderCourseBlock('core-courses', data.courses.core);
      renderCourseBlock('project-courses', data.courses.projects);
      renderCourseBlock('training-courses', data.courses.trainings);
    }

    if (pathname.includes("achievements.html")) {
      renderAchievementBlock('achievement-competitions', data.home.achievements.competitions);
      renderAchievementBlock('achievement-admissions', data.home.achievements.admissions);
    }

    if (pathname.includes("admissions.html")) {
      renderAdmissionBlock('admission-targets', data.admissions.targets);
      renderAdmissionBlock('admission-process', data.admissions.process);
      renderAdmissionBlock('admission-dates', data.admissions.dates);
    }

    if (pathname.includes("campus.html")) {
      renderCampusBlock('campus-clubs', data.campus.clubs);
      renderCampusBlock('campus-sharing', data.campus.sharing);
      renderCampusBlock('campus-environment', data.campus.environment);
    }

    if (pathname.includes("resources.html")) {
      renderResourceBlock('faq', data.resources.faq);
      renderResourceBlock('downloads', data.resources.downloads);
      renderResourceBlock('transport', data.resources.transport);
    }
  });

function renderIntro(intros) {
  const container = document.getElementById('intro-content');
  if (!container) return;
  intros.forEach(item => {
    container.innerHTML += createClickableCard(item);
  });
}

function renderAchievements(data) {
  if (!data) return;
  renderBlock('competitions', data.competitions);
  renderBlock('admissions', data.admissions);
  renderBlock('alumni', data.alumni);
}

function renderBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += createCompactCard(item);
  });
}

function renderNews(news) {
  const container = document.getElementById('news-list');
  if (!container) return;
  news.forEach(item => {
    container.innerHTML += createCompactCard(item);
  });
}

function renderEvents(events) {
  const container = document.getElementById('events-list');
  if (!container) return;
  events.forEach(item => {
    container.innerHTML += createCompactCard(item);
  });
}

function renderCourseBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += createCompactCard(item);
  });
}

function renderAchievementBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += createCompactCard(item);
  });
}

function renderAdmissionBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    // 只有「重要日程」顯示 title + date，其餘同樣以 compact 形式
    if (id === 'admission-dates') {
      container.innerHTML += createDateCard(item);
    } else {
      container.innerHTML += createCompactCard(item);
    }
  });
}

function renderCampusBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += createCompactCard(item);
  });
}

function renderResourceBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += createCompactCard(item);
  });
}

// 點擊卡片觸發 Modal
document.addEventListener("click", function (e) {
  if (e.target.closest(".clickable-card")) {
    const item = JSON.parse(e.target.closest(".clickable-card").dataset.item.replace(/&#39;/g, "'"));
    const modalTitle = document.getElementById("detailModalLabel");
    const modalBody = document.getElementById("detailModalBody");

    modalTitle.innerText = item.title || "詳細資料";
    modalBody.innerHTML = `
      ${item.subtitle ? `<h6 class="text-muted">${item.subtitle}</h6>` : ''}
      ${item.date ? `<p><strong>日期：</strong>${item.date}</p>` : ''}
      ${item.tags?.length ? `<p><strong>標籤：</strong>${item.tags.join(', ')}</p>` : ''}
      ${formatBold(item.content || '')}
      ${item.images?.filter(src => !src.trim().startsWith('!'))
        .map(src => `<img src="data/${src}" class="img-fluid mb-2 preview-img" style="max-height: 20rem; cursor: zoom-in;" data-src="data/${src}">`)
        .join("") || ''}
      ${item.files?.map(f => `<p><a href="data/${f}" target="_blank">📄 檔案連結</a></p>`).join("") || ''}
      ${item.videos?.map(v => v.includes('youtu') ? 
        `<iframe class="mb-2" width="100%" height="315" src="${v.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>` :
        `<video controls class="w-100 mb-2"><source src="data/${v}" type="video/mp4"></video>`
      ).join("") || ''}
    `;

    new bootstrap.Modal(document.getElementById('detailModal')).show();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const blurLayer = document.getElementById('modal-blur-layer');
  const modalBlurLayer = document.getElementById('modal-blur-modal');

  const detailModalEl = document.getElementById('detailModal');
  if (detailModalEl) {
    detailModalEl.addEventListener('show.bs.modal', () => {
      blurLayer.style.display = 'block';
    });
    detailModalEl.addEventListener('hidden.bs.modal', () => {
      blurLayer.style.display = 'none';
    });
  }

  const imgPreviewEl = document.getElementById('imgPreviewModal');
  if (imgPreviewEl) {
    imgPreviewEl.addEventListener('show.bs.modal', () => {
      modalBlurLayer.style.display = 'block';
    });
    imgPreviewEl.addEventListener('hidden.bs.modal', () => {
      modalBlurLayer.style.display = 'none';
    });
  }
});

document.addEventListener('click', function(e) {
  const img = e.target.closest('.preview-img');
  if (img) {
    const modalImg = document.getElementById('imgPreviewModalImg');
    const modal = document.getElementById('imgPreviewModal');
    const modalBlurLayer = document.getElementById('modal-blur-modal');

    modalImg.src = img.getAttribute('data-src');

    // 顯示模糊背景（如果還沒觸發 show.bs.modal）
    const bsModal = new bootstrap.Modal(modal);

    // 等 modal 顯示完成後再顯示虛化
    modal.addEventListener('shown.bs.modal', function onceShown() {
      if (modalBlurLayer) modalBlurLayer.style.display = 'block';
      modal.removeEventListener('shown.bs.modal', onceShown);
    });

    bsModal.show();
  }
});

