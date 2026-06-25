/* Particle portrait — assembles /face.jpg out of fine particles across the hero.
   - Cursor: particles scatter and reform.
   - Click (anywhere in the hero that isn't a link): explode outward, then reassemble.
   Removes only the OUTER background (flood-fill from the edges) so the subject
   stays solid — no holes in the face or shirt. Duotone (navy → gold). */
(function () {
  const canvas = document.getElementById("face");
  if (!canvas) return;
  const host = canvas.closest(".hero") || canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, particles = [], raf = null, hintGone = false;
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

    // Background colour ≈ average of the corners.
    const at = (ix, iy) => { const i = (iy * cols + ix) * 4; return [data[i], data[i + 1], data[i + 2]]; };
    const cs = [at(0, 0), at(cols - 1, 0), at(0, rows - 1), at(cols - 1, rows - 1)];
    const bg = [0, 1, 2].map(j => (cs[0][j] + cs[1][j] + cs[2][j] + cs[3][j]) / 4);
    const tol2 = 58 * 58;

    // Flood-fill from the edges: only background CONNECTED to the border is removed,
    // so light pixels inside the subject (shirt whites, highlights) are kept.
    const N = cols * rows;
    const seen = new Uint8Array(N), isBg = new Uint8Array(N), stack = [];
    const nearBg = idx => {
      const i = idx * 4;
      if (data[i + 3] < 128) return true;
      const dr = data[i] - bg[0], dg = data[i + 1] - bg[1], db = data[i + 2] - bg[2];
      return dr * dr + dg * dg + db * db < tol2;
    };
    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= cols || y >= rows) return;
      const idx = y * cols + x; if (seen[idx]) return; seen[idx] = 1; stack.push(idx);
    };
    for (let x = 0; x < cols; x++) { push(x, 0); push(x, rows - 1); }
    for (let y = 0; y < rows; y++) { push(0, y); push(cols - 1, y); }
    while (stack.length) {
      const idx = stack.pop();
      if (!nearBg(idx)) continue;
      isBg[idx] = 1;
      const x = idx % cols, y = (idx / cols) | 0;
      push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
    }

    // Portrait region: upper-right on wide screens (clear of the cards below).
    const wide = W > H * 1.05;
    const boxW = (wide ? 0.42 : 0.8) * W;
    const boxH = (wide ? 0.62 : 0.5) * H;
    const cxr = wide ? 0.77 : 0.5;
    const cyr = wide ? 0.40 : 0.34;
    const scale = Math.min(boxW / cols, boxH / rows);
    const ox = W * cxr - (cols * scale) / 2;
    const oy = H * cyr - (rows * scale) / 2;
    const dot = Math.max(0.8 * DPR, scale * 0.62);

    particles = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        if (isBg[idx]) continue;
        const i = idx * 4;
        if (data[i + 3] < 128) continue;
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          tx: ox + x * scale, ty: oy + y * scale,
          vx: 0, vy: 0, r: dot, delay: 0, c: duotone(data[i], data[i + 1], data[i + 2])
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
        if (p.delay > 0) { p.delay -= 1; p.vx *= 0.97; p.vy *= 0.97; }
        else { p.vx += (p.tx - p.x) * k; p.vy += (p.ty - p.y) * k; p.vx *= fr; p.vy *= fr; }
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
      const force = 26 + Math.random() * 40;
      const spin = (Math.random() - 0.5) * 20;
      p.vx += (dx / d) * force - (dy / d) * spin;
      p.vy += (dy / d) * force + (dx / d) * spin;
      p.delay = 16 + Math.random() * 90;
    }
    if (!hintGone) { hintGone = true; const h = document.querySelector(".face-hint"); if (h) h.classList.add("gone"); }
  }

  function rel(cx, cy) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (cx - rect.left) * DPR; mouse.y = (cy - rect.top) * DPR;
  }
  host.addEventListener("pointermove", e => { mouse.active = true; rel(e.clientX, e.clientY); });
  host.addEventListener("pointerleave", () => { mouse.active = false; mouse.x = mouse.y = -1e4; });
  host.addEventListener("click", e => { if (e.target.closest("a")) return; explode(e.clientX, e.clientY); });

  let rt = null;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (img.complete && img.naturalWidth) build(); }, 200); });
})();
