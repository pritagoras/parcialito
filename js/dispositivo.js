// ==========================================================
// dispositivo.js: datos básicos del dispositivo, los que cualquier
// sitio recibe al entrar (navegador, sistema, tamaño de pantalla,
// idioma y zona horaria). Se guardan en una tabla privada de
// Supabase para tu historial; la página nunca los muestra.
// No se recoge IP ni nada que identifique al aparato en forma única.
// ==========================================================

function detectarNavegador(ua) {
  const reglas = [
    [/Edg(?:e|A|iOS)?\/(\d+)/, 'Edge'],
    [/OPR\/(\d+)/, 'Opera'],
    [/SamsungBrowser\/(\d+)/, 'Samsung Internet'],
    [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox'],
    [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome'],
    [/Version\/(\d+).*Safari/, 'Safari'],
  ];
  for (const [re, nombre] of reglas) {
    const m = ua.match(re);
    if (m) return `${nombre} ${m[1]}`;
  }
  return 'Otro';
}

function detectarSistema(ua) {
  let m;
  if ((m = ua.match(/Android (\d+)/))) return `Android ${m[1]}`;
  if ((m = ua.match(/(?:iPhone|CPU) OS (\d+)/))) return `iOS ${m[1]}`;
  if (/Windows NT/.test(ua)) return 'Windows';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Macintosh|Mac OS X/.test(ua)) return navigator.maxTouchPoints > 1 ? 'iPadOS' : 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Otro';
}

function detectarTipo(ua) {
  const tactilMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;   // iPad moderno
  if (/iPad|Tablet/.test(ua) || tactilMac || (/Android/.test(ua) && !/Mobile/.test(ua))) return 'tablet';
  if (/Mobi|iPhone|Android/.test(ua)) return 'móvil';
  return 'escritorio';
}

export function infoDispositivo() {
  try {
    const ua = navigator.userAgent || '';
    return {
      navegador: detectarNavegador(ua),
      sistema: detectarSistema(ua),
      tipo_dispositivo: detectarTipo(ua),
      pantalla: `${screen.width}x${screen.height}`,
      idioma: String(navigator.language || '').slice(0, 20),
      zona_horaria: String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 60),
      user_agent: ua.slice(0, 300),
    };
  } catch {
    return {};
  }
}
