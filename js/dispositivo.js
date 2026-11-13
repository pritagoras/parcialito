// ==========================================================
// dispositivo.js: capacidades técnicas aproximadas del navegador.
// No usa GPS, IMEI, número de serie ni fingerprinting.
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
  const tactilMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPad|Tablet/.test(ua) || tactilMac || (/Android/.test(ua) && !/Mobile/.test(ua))) return 'tablet';
  if (/Mobi|iPhone|Android/.test(ua)) return 'móvil';
  return 'escritorio';
}

function modeloDesdeUA(ua) {
  const reglas = [
    /(SM-[A-Z0-9]+)/i,
    /(motorola moto [^;)]+?)(?:\s+Build\/|[;)])/i,
    /(moto [a-z0-9 +()-]{2,30}?)(?:\s+Build\/|[;)])/i,
    /(Redmi [^;)]+?)(?:\s+Build\/|[;)])/i,
    /(POCO [^;)]+?)(?:\s+Build\/|[;)])/i,
    /(Pixel [^;)]+?)(?:\s+Build\/|[;)])/i,
    /(CPH\d{4})/i,
    /(V\d{4}[A-Z]?)/i,
  ];
  for (const regla of reglas) {
    const m = String(ua || '').match(regla);
    if (m) return m[1].trim().slice(0, 100);
  }
  return null;
}

function inferirFabricante(modelo, ua) {
  const s = `${modelo || ''} ${ua || ''}`.toLowerCase();
  if (/iphone|ipad/.test(s)) return 'Apple';
  if (/samsung|sm-[a-z0-9]/.test(s)) return 'Samsung';
  if (/motorola|moto [a-z]/.test(s)) return 'Motorola';
  if (/redmi|poco|xiaomi/.test(s)) return 'Xiaomi';
  if (/pixel/.test(s)) return 'Google';
  if (/oneplus/.test(s)) return 'OnePlus';
  if (/oppo|cph[0-9]/.test(s)) return 'OPPO';
  if (/vivo|v[0-9]{4}[a-z]/.test(s)) return 'vivo';
  if (/huawei|honor/.test(s)) return /honor/.test(s) ? 'HONOR' : 'Huawei';
  return null;
}

export function idDispositivo() {
  try {
    // Reutiliza el ID anónimo de visitas para poder enlazar también el historial anterior.
    const visitante = localStorage.getItem('parcialito_visitante');
    let id = visitante || localStorage.getItem('parcialito_dispositivo_id');
    if (!id) {
      if (crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        const bytes = new Uint8Array(16);
        if (crypto.getRandomValues) crypto.getRandomValues(bytes);
        else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
        id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
      localStorage.setItem('parcialito_dispositivo_id', id);
    }
    return id;
  } catch {
    return null;
  }
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

function infoCapacidades() {
  const base = infoDispositivo();
  const ua = navigator.userAgent || '';
  const conexion = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    ...base,
    viewport: `${Math.round(innerWidth)}x${Math.round(innerHeight)}`,
    dpr: Number.isFinite(devicePixelRatio) ? Math.round(devicePixelRatio * 100) / 100 : null,
    ram_gb: Number.isFinite(navigator.deviceMemory) ? navigator.deviceMemory : null,
    nucleos: Number.isFinite(navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : null,
    conexion: String(conexion?.effectiveType || '').slice(0, 20) || null,
    save_data: typeof conexion?.saveData === 'boolean' ? conexion.saveData : null,
    fabricante: inferirFabricante('', ua),
    modelo: null,
    instalada: window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true,
  };
}

// User-Agent Client Hints puede revelar el modelo en algunos Android/Chromium.
// Safari/iOS y otros navegadores pueden no exponerlo: en ese caso queda null.
export async function perfilDispositivo() {
  const base = infoCapacidades();
  try {
    const hints = navigator.userAgentData;
    if (hints?.getHighEntropyValues) {
      const extra = await hints.getHighEntropyValues([
        'model', 'platformVersion', 'architecture', 'bitness', 'fullVersionList',
      ]);
      const modelo = String(extra.model || '').trim().slice(0, 100) || modeloDesdeUA(base.user_agent);
      base.modelo = modelo;
      base.fabricante = inferirFabricante(modelo, base.user_agent) || base.fabricante;
      if (extra.platformVersion) base.version_plataforma = String(extra.platformVersion).slice(0, 30);
      if (extra.architecture) base.arquitectura = String(extra.architecture).slice(0, 30);
      if (extra.bitness) base.bits = String(extra.bitness).slice(0, 8);
      if (Array.isArray(extra.fullVersionList)) {
        const navegador = extra.fullVersionList.find(x => /Chrome|Chromium|Edge/i.test(x.brand));
        if (navegador?.version) base.version_navegador = String(navegador.version).slice(0, 30);
      }
    }
    if (!base.modelo) base.modelo = modeloDesdeUA(base.user_agent);
    if (!base.modelo && /iPhone|iPad/.test(base.user_agent)) {
      base.fabricante = 'Apple';
      base.modelo = /iPad/.test(base.user_agent) ? 'iPad (modelo no expuesto por Safari)' : 'iPhone (modelo no expuesto por Safari)';
    }
  } catch {
    // La API puede estar bloqueada o no estar implementada.
  }
  return base;
}
