/* Particle portrait — assembles /face.jpg out of particles, with cursor physics.
   Self-contained, no libraries. Duotone (navy → gold) to match the site. */
(function () {
  const canvas = document.getElementById("face");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, particles = [], raf = null;
  const mouse = { x: -1e4, y: -1e4, active: false };

  const img = new Image();
  img.onload = () => build();
  img.onerror = () => {};
  img.src = "/face.jpg";

  function duotone(r, g, b) {
    const t = (0.299 * r + 0.587 * g + 0.114 * b) / 255;       // luminance 0..1
    const sh = [22, 38, 62], hi = [236, 214, 168];             // navy shadow -> warm highlight
    const e = Math.pow(t, 0.85);
    return `rgb(${Math.round(sh[0] + (hi[0] - sh[0]) * e)},${Math.round(sh[1] + (hi[1] - sh[1]) * e)},${Math.round(sh[2] + (hi[2] - sh[2]) * e)})`;
  }

  function build() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = Math.max(1, rect.width * DPR);
    H = canvas.height = Math.max(1, rect.height * DPR);

    // sample the image into a low-res grid
    const cols = 150;
    const aspect = img.height / img.width || 1;
    const rows = Math.round(cols * aspect);
    const off = document.createElement("canvas");
    off.width = cols; off.height = rows;
    const octx = off.getContext("2d");
    octx.drawImage(img, 0, 0, cols, rows);
    const data = octx.getImageData(0, 0, cols, rows).data;

    const scale = Math.min(W / cols, H / rows) * 0.94;
    const ox = (W - cols * scale) / 2, oy = (H - rows * scale) / 2;
    const step = 2;

    particles = [];
    for (let y = 0; y < rows; y += step) {
      for (let x = 0; x < cols; x += step) {
        const i = (y * cols + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 128) continue;
        const lum = (r + g + b) / 3;
        if (lum > 236) continue;                  // drop the light background
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          tx: ox + x * scale, ty: oy + y * scale,
          vx: 0, vy: 0,
          r: (step * scale) * 0.46,
          c: duotone(r, g, b)
        });
      }
    }
    if (reduce) particles.forEach(p => { p.x = p.tx; p.y = p.ty; });
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const k = 0.018, fr = 0.86, rad = 64 * DPR, rad2 = rad * rad;
    for (let n = 0; n < particles.length; n++) {
      const p = particles[n];
      if (!reduce) {
        // spring toward home
        p.vx += (p.tx - p.x) * k;
        p.vy += (p.ty - p.y) * k;
        // cursor repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < rad2 && d2 > 0.01) {
            const f = (1 - Math.sqrt(d2) / rad) * 14;
            const inv = 1 / Math.sqrt(d2);
            p.vx += dx * inv * f; p.vy += dy * inv * f;
          }
        }
        p.vx *= fr; p.vy *= fr;
        p.x += p.vx; p.y += p.vy;
      }
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    raf = requestAnimationFrame(frame);
  }

  function toCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (clientX - rect.left) * DPR;
    mouse.y = (clientY - rect.top) * DPR;
  }
  canvas.addEventListener("pointermove", e => { mouse.active = true; toCanvas(e.clientX, e.clientY); });
  canvas.addEventListener("pointerleave", () => { mouse.active = false; mouse.x = mouse.y = -1e4; });

  let rt = null;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (img.complete && img.naturalWidth) build(); }, 200); });
})();
