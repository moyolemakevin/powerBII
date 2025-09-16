const powerbiService = window.powerbi;
const powerbiModels = window['powerbi-client']?.models;

const showBtn = document.getElementById('showBtn');
const reportBox = document.getElementById('reportBox');
const reportContainer = document.getElementById('reportContainer');
const loader = document.getElementById('loader');
const closeBtn = document.getElementById('closeBtn');
const themeBtn = document.getElementById('themeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const AUTH_URL = 'https://app.powerbi.com/';

let reportInstance = null;

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

function clearReport(){
  if (reportInstance) {
    powerbiService.reset(reportContainer);
    reportInstance = null;
  }
  reportContainer.setAttribute('aria-hidden', 'true');
}

function closeReport(){
  if (isFullscreenActive()) {
    exitFullscreen();
  }
  reportBox.classList.remove('visible');
  loader.classList.remove('visible');
  clearReport();
  showBtn.disabled = false;
}

function handleEmbedFailure(message){
  closeReport();
  alert(message); // eslint-disable-line no-alert
}

async function requestEmbedConfig(){
  const response = await fetch('/api/embed-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    window.location.href = AUTH_URL;
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'No se pudo obtener un Embed Token.');
  }

  return response.json();
}

function embedReport(config){
  if (!powerbiService || !powerbiModels) {
    throw new Error('La librería powerbi-client no está disponible.');
  }

  const embedConfig = {
    type: 'report',
    id: config.reportId,
    embedUrl: config.embedUrl,
    accessToken: config.embedToken,
    tokenType: powerbiModels.TokenType.Embed,
    settings: {
      panes: {
        filters: { visible: false },
        pageNavigation: { visible: false },
      },
      background: powerbiModels.BackgroundType.Transparent,
    },
  };

  powerbiService.reset(reportContainer);
  reportInstance = powerbiService.embed(reportContainer, embedConfig);
  reportContainer.setAttribute('aria-hidden', 'false');

  reportInstance.on('loaded', () => {
    loader.classList.remove('visible');
  });

  reportInstance.on('error', (event) => {
    console.error('Error al cargar el informe de Power BI', event?.detail); // eslint-disable-line no-console
    handleEmbedFailure('Ocurrió un problema al cargar el informe de Power BI. Intenta nuevamente.');
  });

  reportInstance.on('tokenExpired', async () => {
    try {
      const refreshedConfig = await requestEmbedConfig();
      if (refreshedConfig?.embedToken) {
        await reportInstance.setAccessToken(refreshedConfig.embedToken);
      }
    } catch (error) {
      console.error('No se pudo renovar el token de Power BI', error); // eslint-disable-line no-console
      window.location.href = AUTH_URL;
    }
  });
}

showBtn.addEventListener('click', async () => {
  showBtn.disabled = true;
  reportBox.classList.add('visible');
  loader.classList.add('visible');

  try {
    if (!reportInstance) {
      const config = await requestEmbedConfig();
      if (!config) {
        closeReport();
        return;
      }
      embedReport(config);
    } else {
      loader.classList.remove('visible');
    }
  } catch (error) {
    console.error('No fue posible incrustar el informe de Power BI', error); // eslint-disable-line no-console
    handleEmbedFailure('No se pudo cargar el informe de Power BI. Intenta nuevamente en unos minutos.');
  }
});

closeBtn.addEventListener('click', closeReport);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && reportBox.classList.contains('visible')) closeReport();
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

  if (!reportBox.classList.contains('visible')) {
    showBtn.click();
  }
  requestFullscreen(reportBox);
});

['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach((eventName) => {
  document.addEventListener(eventName, syncFullscreenButton);
});

syncFullscreenButton();
