const btn = document.getElementById('showBtn');
const controls = btn ? btn.parentElement : null;
const heroCard = btn ? btn.closest('.hero-card') : null;
const box = document.getElementById('reportBox');
const frame = document.getElementById('reportFrame');
const loader = document.getElementById('loader');
const closeBtn = document.getElementById('closeBtn');
const themeBtn = document.getElementById('themeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const reportMenu = document.getElementById('reportMenu');
const reportOptions = reportMenu ? Array.from(reportMenu.querySelectorAll('.report-option')) : [];
const MENU_TOGGLE_DEBOUNCE_MS = 120;
const CACHE_BUSTER_PARAM = '_cb';
let lastMenuToggleTime = 0;

function addCacheBuster(src){
  const timestamp = Date.now().toString();

  try {
    const url = new URL(src, window.location.href);
    url.searchParams.set(CACHE_BUSTER_PARAM, timestamp);
    return url.toString();
  } catch (error) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}${CACHE_BUSTER_PARAM}=${timestamp}`;
  }
}

function loadReportSrc(src, { forceReload = false } = {}){
  if (!frame || !loader) return;

  const targetSrc = forceReload ? addCacheBuster(src) : src;

  loader.classList.add('visible');
  frame.addEventListener('load', () => {
    loader.classList.remove('visible');
  }, { once: true });

  frame.setAttribute('src', targetSrc);
}

function isFullscreenActive(){
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

function requestFullscreen(element){
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function exitFullscreen(){
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function syncFullscreenButton(){
  const active = Boolean(isFullscreenActive());
  fullscreenBtn.textContent = active ? 'Salir de pantalla completa' : 'Pantalla completa';
  fullscreenBtn.setAttribute('aria-label', active ? 'Salir de pantalla completa del informe' : 'Expandir el informe a pantalla completa');
  fullscreenBtn.setAttribute('aria-pressed', String(active));
}

function positionReportMenu(){
  if (!reportMenu || !btn || !controls) return;

  const controlsRect = controls.getBoundingClientRect();
  const buttonRect = btn.getBoundingClientRect();

  const left = buttonRect.left - controlsRect.left;
  const top = buttonRect.bottom - controlsRect.top + 12;
  const width = buttonRect.width;

  reportMenu.style.left = `${Math.round(left)}px`;
  reportMenu.style.top = `${Math.round(top)}px`;
  reportMenu.style.width = `${Math.round(width)}px`;
  reportMenu.style.minWidth = `${Math.round(width)}px`;
}

function showReportMenu(){
  if (!reportMenu || !btn) return;
  positionReportMenu();
  reportMenu.classList.add('visible');
  reportMenu.setAttribute('aria-hidden', 'false');
  btn.setAttribute('aria-expanded', 'true');
  btn.classList.add('menu-open');
  if (heroCard) heroCard.classList.add('menu-open');
  lastMenuToggleTime = performance.now();

  if (reportOptions.length){
    const activeOption = reportOptions.find((option) => option.classList.contains('is-active')) || reportOptions[0];
    requestAnimationFrame(() => {
      positionReportMenu();
      activeOption.focus();
    });
  }
}

function hideReportMenu(){
  if (!reportMenu || !btn) return;
  reportMenu.classList.remove('visible');
  reportMenu.setAttribute('aria-hidden', 'true');
  btn.setAttribute('aria-expanded', 'false');
  btn.classList.remove('menu-open');
  if (heroCard) heroCard.classList.remove('menu-open');
  lastMenuToggleTime = performance.now();
}

function toggleReportMenu(){
  if (!reportMenu) return;
  if (reportMenu.classList.contains('visible')) {
    hideReportMenu();
  } else {
    showReportMenu();
  }
}

function createReportFromOption(option){
  if (!option) return null;
  return {
    src: option.dataset.src,
    title: option.dataset.title || option.textContent.trim()
  };
}

function setActiveReport(src){
  if (!reportOptions.length) return;
  reportOptions.forEach((option) => {
    const isActive = option.dataset.src === src;
    option.classList.toggle('is-active', isActive);
    option.setAttribute('aria-checked', String(isActive));
  });
}

function startReport(report){
  if (!report || !report.src) return;

  const previousSrc = frame.dataset.src;
  const alreadyVisible = box.classList.contains('visible');
  const sameReport = previousSrc === report.src && alreadyVisible;

  frame.dataset.src = report.src;
  if (report.title) {
    frame.setAttribute('title', report.title);
  }
  setActiveReport(report.src);

  box.classList.add('visible');

  loadReportSrc(report.src, { forceReload: sameReport });
}

function updateReportAccess(newSrc) {
  // Revoca el acceso aquí (lógica de backend o gestión de permisos)
  // Luego, recarga el iframe con el nuevo src que refleja el cambio de permisos

  frame.dataset.src = newSrc;
  loadReportSrc(newSrc, { forceReload: true });
}

if (btn){
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleReportMenu();
  });

  btn.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === 'ArrowDown') && !event.altKey && !event.metaKey){
      event.preventDefault();
      showReportMenu();
    }
  });
}

if (reportOptions.length){
  reportOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const report = createReportFromOption(option);
      hideReportMenu();
      startReport(report);
    });
  });
}

if (reportMenu){
  reportMenu.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  reportMenu.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
}

if (reportMenu){
  document.addEventListener('click', (event) => {
    if (!reportMenu.classList.contains('visible')) return;
    if (performance.now() - lastMenuToggleTime < MENU_TOGGLE_DEBOUNCE_MS) return;
    if (event.target === btn || (btn && btn.contains(event.target)) || reportMenu.contains(event.target)) return;
    hideReportMenu();
  });
}

function closeReport(){
  hideReportMenu();
  if (isFullscreenActive()) {
    exitFullscreen();
  }
  box.classList.remove('visible');
  loader.classList.remove('visible');

  const onEnd = () => {
    try { frame.removeAttribute('src'); } catch (error) {}
    box.removeEventListener('transitionend', onEnd);
  };
  box.addEventListener('transitionend', onEnd);
}

closeBtn.addEventListener('click', closeReport);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape'){
    if (reportMenu && reportMenu.classList.contains('visible')){
      hideReportMenu();
      if (btn) btn.focus();
      return;
    }
    if (box.classList.contains('visible')) closeReport();
  }
});

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const light = document.body.classList.contains('light');
  themeBtn.textContent = light ? 'Modo oscuro' : 'Modo claro';
  themeBtn.setAttribute('aria-label', light ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  positionReportMenu();
});

fullscreenBtn.addEventListener('click', () => {
  if (isFullscreenActive()) {
    exitFullscreen();
    return;
  }

  if (!box.classList.contains('visible')) {
    const defaultOption = reportOptions[0];
    if (defaultOption) {
      const report = createReportFromOption(defaultOption);
      startReport(report);
    } else if (!frame.getAttribute('src')) {
      frame.setAttribute('src', frame.dataset.src);
    }
  }
  requestFullscreen(box);
});

if (reportOptions.length){
  const defaultReport = createReportFromOption(reportOptions[0]);
  if (defaultReport){
    frame.dataset.src = defaultReport.src;
    if (defaultReport.title) {
      frame.setAttribute('title', defaultReport.title);
    }
    setActiveReport(defaultReport.src);
  }
}

const repositionMenu = () => {
  if (reportMenu && reportMenu.classList.contains('visible')) positionReportMenu();
};

window.addEventListener('resize', repositionMenu);
window.addEventListener('scroll', repositionMenu, true);

['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach((eventName) => {
  document.addEventListener(eventName, syncFullscreenButton);
});

syncFullscreenButton();
