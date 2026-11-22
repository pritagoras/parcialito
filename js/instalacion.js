// ==========================================================
// instalacion.js: Instalación como app (PWA) y aviso de versión nueva.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { S, avisar } from './nucleo.js';

export function esCelular() {
  const ua = navigator.userAgent || '';
  // Chromium reciente ofrece una detección explícita; el patrón clásico cubre
  // Safari y otros navegadores que no implementan userAgentData.
  return navigator.userAgentData?.mobile === true ||
    /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|webOS|Opera Mini/i.test(ua);
}

function esIOS() {
  return /iPhone|iPod/.test(navigator.userAgent || '');
}

export function estaInstalada() {
  return instalacionCompletada ||
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true;
}

let eventoInstalacionPendiente = null;

let instalacionCompletada = false;

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault();
  eventoInstalacionPendiente = evento;

  // Si el aviso nativo aparece después de renderizar el menú, conservar visible
  // el botón para que pueda abrirlo directamente.
  if (esCelular() && !estaInstalada()) {
    const contenedor = document.querySelector('.instalar-app-wrap');
    if (contenedor) contenedor.hidden = false;
  }
});

window.addEventListener('appinstalled', () => {
  instalacionCompletada = true;
  eventoInstalacionPendiente = null;
  document.querySelector('.instalar-app-wrap')?.remove();
  avisar('¡Parcialito se instaló correctamente!');
});

function mostrarAyudaInstalacionIOS() {
  window.alert('Para instalar Parcialito en tu iPhone:\n\n1. Abrí esta página en Safari.\n2. Tocá Compartir (el cuadrado con la flecha hacia arriba).\n3. Elegí «Añadir a pantalla de inicio».');
}

function mostrarAyudaInstalacionAndroid() {
  window.alert('Para instalar Parcialito en tu celular:\n\n1. Abrí el menú del navegador (⋮ o Compartir).\n2. Buscá «Instalar aplicación» o «Añadir a pantalla de inicio».\n3. Confirmá la instalación.\n\nCuando el navegador habilite el aviso nativo, este botón lo abrirá directamente.');
}

export async function instalarParcialito() {
  if (!eventoInstalacionPendiente) {
    // Si la API de instalación no está disponible, explicar el método manual.
    if (esIOS()) mostrarAyudaInstalacionIOS();
    else mostrarAyudaInstalacionAndroid();
    return;
  }

  const evento = eventoInstalacionPendiente;
  eventoInstalacionPendiente = null;
  const contenedor = document.querySelector('.instalar-app-wrap');
  try {
    await evento.prompt();
    const eleccion = await evento.userChoice;
    if (eleccion?.outcome === 'accepted') {
      avisar('Parcialito se está instalando…');
    } else {
      // No ocultar el botón: el evento puede volver a estar disponible más tarde,
      // y si no, el botón ofrece las instrucciones manuales como alternativa.
      avisar('No hay problema. Podés instalarla más adelante.');
    }
  } catch (_) {
    avisar('No se pudo abrir la instalación. Volvé a intentarlo o usá el menú del navegador.');
  }
}

export function iniciarDetectorActualizaciones(versionActual) {
  if (!versionActual || document.getElementById('aviso-actualizacion')) return;

  // El aviso vive fuera de #app para que no desaparezca al cambiar de pantalla.
  const estilo = document.createElement('style');
  estilo.id = 'estilos-aviso-actualizacion';
  estilo.textContent = [
    '#aviso-actualizacion { position:fixed; z-index:10000; left:50%; bottom:calc(16px + env(safe-area-inset-bottom)); transform:translateX(-50%); width:min(36rem, calc(100vw - 24px)); box-sizing:border-box; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; color:#FFF3DC; background:#231845; border:1px solid #9B7BFF; border-radius:16px; box-shadow:0 12px 40px rgba(0,0,0,.4); font:500 14px/1.4 Inter, system-ui, sans-serif; }',
    '#aviso-actualizacion[hidden] { display:none !important; }',
    '#aviso-actualizacion .texto { display:flex; flex-direction:column; gap:2px; min-width:0; }',
    '#aviso-actualizacion .texto strong { font-size:14px; }',
    '#aviso-actualizacion .texto span { color:#D4C9EB; font-size:12px; }',
    '#aviso-actualizacion button { flex-shrink:0; border:0; border-radius:10px; padding:10px 13px; font:800 12px/1 Inter, system-ui, sans-serif; letter-spacing:.03em; background:#9B7BFF; color:#170F2E; cursor:pointer; }',
    '#aviso-actualizacion button:focus-visible { outline:3px solid #FFB938; outline-offset:3px; }',
    '@media (max-width:430px) { #aviso-actualizacion { align-items:stretch; flex-direction:column; gap:10px; } #aviso-actualizacion button { width:100%; padding:12px; } }'
  ].join('\n');
  document.head.appendChild(estilo);

  const banner = document.createElement('aside');
  banner.id = 'aviso-actualizacion';
  banner.hidden = true;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = '<div class="texto"><strong>¡Hay una actualización disponible!</strong><span>Hay nuevos juegos o mejoras en Parcialito.</span></div><button type="button" id="btn-actualizar-app">↻ ACTUALIZAR</button>';
  document.body.appendChild(banner);

  document.getElementById('btn-actualizar-app').addEventListener('click', function () {
    if ((S.juego || S.sesionT) && !window.confirm('Hay una partida en curso. Si actualizás ahora, se reiniciará y perderás el progreso de esta partida. ¿Querés continuar?')) return;
    const url = new URL(window.location.href);
    url.searchParams.set('actualizar', String(Date.now()));
    window.location.replace(url.toString());
  });

  let comprobando = false;
  async function comprobar() {
    if (comprobando) return;
    comprobando = true;
    try {
      // El parámetro y no-store evitan comparar contra una copia cacheada del índice.
      const url = new URL('data/index.json', document.baseURI);
      url.searchParams.set('_actualizacion', String(Date.now()));
      const respuesta = await fetch(url.toString(), { cache: 'no-store' });
      if (!respuesta.ok) return;
      const datos = await respuesta.json();
      if (datos.generado && datos.generado !== versionActual) banner.hidden = false;
    } catch (_) {
      // Si no hay conexión o el sitio se está publicando, se volverá a comprobar.
    } finally {
      comprobando = false;
    }
  }

  window.setInterval(comprobar, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) comprobar();
  });
}
