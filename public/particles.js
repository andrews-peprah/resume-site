/* Particle portrait — assembles /face.jpg out of fine particles.
   - Move the cursor: particles scatter and reform.
   - Click: the portrait explodes outward, then reassembles little by little.
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
    const t = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const sh = [20, 35, 58], hi = [240, 220, 176];
    const e = Math.pow(t, 0.9);
    return `rgb(${Math.round(sh[0] + (hi[0] - sh[0]) * e)},${Math.round(sh[1] + (hi[1] - sh[1]) * e)},${Math.round(sh[2] + (hi[2] - sh[2]) * e)})`;
  }

  function build() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = Math.max(1, rect.width * DPR);
    H = canvas.height = Math.max(1, rect.height * DPR);

    const cols = 220;
    const aspect = img.height / img.width || 1;
    const rows = Math.round(cols * aspect);
    const off = document.createElement("canvas");
    off.width = cols; off.height = rows;
    const octx = off.getContext("2d");
    octx.drawImage(img, 0, 0, cols, rows);
    const data = octx.getImageData(0, 0, cols, rows).data;

    const scale = Math.min(W / cols, H / rows) * 0.96;
    const ox = (W - cols * scale) / 2, oy = (H - rows * scale) / 2;
    const dot = Math.max(0.8 * DPR, scale * 0.62);

    particles = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        if (data[i + 3] < 128) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if ((r + g + b) / 3 > 240) continue;
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          tx: ox + x * scale, ty: oy + y * scale,
          vx: 0, vy: 0, r: dot, delay: 0, c: duotone(r, g, b)
        });
      }
    }
    if (reduce) particles.forEach(p => { p.x = p.tx; p.y = p.ty; });
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const k = 0.02, fr = 0.85, rad = 58 * DPR, rad2 = rad * rad;
    for (let n = 0; n < particles.length; n++) {
      const p = particles[n];
      if (!reduce) {
        if (p.delay > 0) {
          // explosion / fly-around phase: drift with light drag, no spring yet
          p.delay -= 1;
          p.vx *= 0.965; p.vy *= 0.965;
        } else {
          // spring home
          p.vx += (p.tx - p.x) * k;
          p.vy += (p.ty - p.y) * k;
          p.vx *= fr; p.vy *= fr;
        }
        // cursor repulsion (always on)
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < rad2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / rad) * 12, inv = 1 / d;
            p.vx += dx * inv * f; p.vy += dy * inv * f;
          }
        }
        p.x += p.vx; p.y += p.vy;
      }
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    raf = requestAnimationFrame(frame);
  }

  function explode(clientX, clientY) {
    if (reduce || !particles.length) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (clientX - rect.left) * DPR, cy = (clientY - rect.top) * DPR;
    for (let n = 0; n < particles.length; n++) {
      const p = particles[n];
      let dx = p.x - cx, dy = p.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const force = 20 + Math.random() * 28;          // outward blast
      const spin = (Math.random() - 0.5) * 14;         // a little chaos so they fly around
      p.vx += (dx / d) * force - (dy / d) * spin;
      p.vy += (dy / d) * force + (dx / d) * spin;
      p.delay = 14 + Math.random() * 78;               // staggered → reassemble little by little
    }
  }

  function toCanvas(cx, cy) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (cx - rect.left) * DPR; mouse.y = (cy - rect.top) * DPR;
  }
  canvas.addEventListener("pointermove", e => { mouse.active = true; toCanvas(e.clientX, e.clientY); });
  canvas.addEventListener("pointerleave", () => { mouse.active = false; mouse.x = mouse.y = -1e4; });
  canvas.addEventListener("click", e => explode(e.clientX, e.clientY));

  let rt = null;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (img.complete && img.naturalWidth) build(); }, 200); });
})();
