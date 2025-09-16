const btn = document.getElementById('showBtn');
const box = document.getElementById('reportBox');
const frame = document.getElementById('reportFrame');
const loader = document.getElementById('loader');
const closeBtn = document.getElementById('closeBtn');
const themeBtn = document.getElementById('themeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

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

btn.addEventListener('click', () => {
  if (!frame.src){
    frame.src = frame.dataset.src;
  }
  btn.disabled = true;
  loader.classList.add('visible');
  box.classList.add('visible');

  frame.addEventListener('load', () => {
    loader.classList.remove('visible');
  }, { once: true });
});

function closeReport(){
  if (isFullscreenActive()) {
    exitFullscreen();
  }
  box.classList.remove('visible');
  loader.classList.remove('visible');

  const onEnd = () => {
    btn.disabled = false;
    try { frame.removeAttribute('src'); } catch (error) {}
    box.removeEventListener('transitionend', onEnd);
  };
  box.addEventListener('transitionend', onEnd);
}

closeBtn.addEventListener('click', closeReport);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && box.classList.contains('visible')) closeReport();
});

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const light = document.body.classList.contains('light');
  themeBtn.textContent = light ? 'Modo oscuro' : 'Modo claro';
  themeBtn.setAttribute('aria-label', light ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
});

fullscreenBtn.addEventListener('click', () => {
  if (isFullscreenActive()) {
    exitFullscreen();
    return;
  }

  if (!box.classList.contains('visible')) {
    btn.click();
  }
  requestFullscreen(box);
});

['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach((eventName) => {
  document.addEventListener(eventName, syncFullscreenButton);
});

syncFullscreenButton();
