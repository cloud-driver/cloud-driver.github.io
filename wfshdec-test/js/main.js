// main.js

const navbar = document.getElementById('navbar');

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
      renderAchievementBlock('achievement-competitions', data.achievements.competitions);
      renderAchievementBlock('achievement-admissions', data.achievements.admissions);
      renderAchievementBlock('achievement-projects', data.achievements.projects);
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
    container.innerHTML += `
      <div class="mb-3">
        <p>${item.content.replace(/\n/g, '<br>')}</p>
      </div>`;
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
  if (!container) return;
  items.forEach(item => {
    container.innerHTML += `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${item.subtitle || ''}</h6>
          <p class="card-text">${item.content.replace(/\n/g, '<br>')}</p>
          ${renderImages(item.images)}
        </div>
      </div>`;
  });
}

function renderNews(news) {
  const container = document.getElementById('news-list');
  if (!container) return;
  news.forEach(item => {
    container.innerHTML += `
      <div class="border-bottom pb-3 mb-3">
        <h5>${item.title}</h5>
        <p>${item.content || ''}</p>
      </div>`;
  });
}

function renderEvents(events) {
  const container = document.getElementById('events-list');
  if (!container) return;
  events.forEach(item => {
    container.innerHTML += `
      <div class="border-bottom pb-3 mb-3">
        <h5>${item.title}</h5>
        <p>${item.content}</p>
      </div>`;
  });
}

function renderImages(images) {
  if (!images || images.length === 0) return '';
  return images.map(src => `<img src="data/${src}" class="img-fluid mb-2" style="max-height: 200px;">`).join('');
}

function renderCourseBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += `
      <div class="section-box">
        <h4>${item.title}</h4>
        <p>${item.content.replace(/\n/g, '<br>')}</p>
      </div>`;
  });
}

function renderAchievementBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += `
      <div class="mb-3">
        <h6 class="fw-bold">${item.title}</h6>
        <p>${item.content.replace(/\n/g, '<br>')}</p>
        ${renderImages(item.images)}
      </div>`;
  });
}

function renderAdmissionBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += `
      <div class="mb-3">
        <h6 class="fw-bold">${item.title}</h6>
        <p>${item.content.replace(/\n/g, '<br>')}</p>
        ${renderImages(item.images)}
      </div>`;
  });
}

function renderCampusBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += `
      <div class="mb-3">
        <h6 class="fw-bold">${item.title}</h6>
        <p>${item.content.replace(/\n/g, '<br>')}</p>
        ${renderImages(item.images)}
      </div>`;
  });
}

function renderResourceBlock(id, items) {
  const container = document.getElementById(id);
  if (!container || !items || items.length === 0) return;
  items.forEach(item => {
    container.innerHTML += `
      <div class="mb-3">
        <h6 class="fw-bold">${item.title}</h6>
        <p>${item.content.replace(/\n/g, '<br>')}</p>
        ${renderImages(item.images)}
      </div>`;
  });
}
