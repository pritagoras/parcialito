// ==========================================================
// confeti.js: lluvia de confeti en un <canvas>.
// Respeta "reducir movimiento" del sistema.
// ==========================================================

const COLORES = ['#9B7BFF', '#FFB938', '#4FE0A0', '#FF7AA8', '#5CC8FF', '#FFF3DC'];

let particulas = [];
let corriendo = false;

export function lanzarConfeti(cantidad = 90) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('confeti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  for (let i = 0; i < cantidad; i++) {
    particulas.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 13 - 4,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 5,
      giro: Math.random() * Math.PI,
      vgiro: (Math.random() - 0.5) * 0.4,
      color: COLORES[(Math.random() * COLORES.length) | 0],
      vida: 0,
    });
  }

  if (!corriendo) {
    corriendo = true;
    requestAnimationFrame(function cuadro() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particulas = particulas.filter((p) => p.vida < 140 && p.y < window.innerHeight + 20);
      for (const p of particulas) {
        p.vida++;
        p.vy += 0.35;      // gravedad
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.giro += p.vgiro;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        ctx.globalAlpha = Math.max(0, 1 - p.vida / 140);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (particulas.length) {
        requestAnimationFrame(cuadro);
      } else {
        corriendo = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    });
  }
}
