/* Interactive world globe (d3-geo on canvas).
   - Filled, horizon-clipped continents from /world-land.geojson.
   - On load, the camera flies along a great circle from the previously-viewed
     location (sessionStorage) to this page's location, then the marker drops.
   Requires d3 v7 (vendored at /d3.v7.min.js). */
(function () {
  const canvas = document.getElementById("globe");
  if (!canvas || !window.d3) return;
  const d3 = window.d3;
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tLat = parseFloat(canvas.dataset.lat);
  const tLon = parseFloat(canvas.dataset.lon);

  let fromLat = 18, fromLon = -28;
  try {
    const a = sessionStorage.getItem("globe:lat"), b = sessionStorage.getItem("globe:lon");
    if (a !== null && b !== null) { fromLat = parseFloat(a); fromLon = parseFloat(b); }
  } catch (e) {}
  try { sessionStorage.setItem("globe:lat", tLat); sessionStorage.setItem("globe:lon", tLon); } catch (e) {}

  function sizeCanvas() {
    const w = canvas.clientWidth || 360, h = canvas.clientHeight || w;
    canvas.width = w * DPR; canvas.height = h * DPR;
  }
  sizeCanvas();
  window.addEventListener("resize", () => sizeCanvas());

  const projection = d3.geoOrthographic().clipAngle(90).precision(0.4);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();
  const sphere = { type: "Sphere" };
  const interp = d3.geoInterpolate([fromLon, fromLat], [tLon, tLat]);

  let land = null;
  let rotate = reduce ? [ -tLon, -tLat ] : [ -fromLon, -fromLat ];
  let flying = !reduce;
  let markerT = reduce ? 1 : 0;

  function visible(lon, lat) {
    const c = projection.rotate();
    return d3.geoDistance([ lon, lat ], [ -c[0], -c[1] ]) < Math.PI / 2;
  }

  function render() {
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42;
    projection.scale(R).translate([ cx, cy ]).rotate(rotate);
    ctx.clearRect(0, 0, W, H);

    // atmosphere halo
    const atm = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.4);
    atm.addColorStop(0, "rgba(211,154,74,0.16)"); atm.addColorStop(1, "rgba(211,154,74,0)");
    ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, R * 1.4, 0, 2 * Math.PI); ctx.fill();

    // ocean sphere
    ctx.beginPath(); path(sphere);
    const oc = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R);
    oc.addColorStop(0, "#15263f"); oc.addColorStop(1, "#080f1c");
    ctx.fillStyle = oc; ctx.fill();

    // graticule
    ctx.beginPath(); path(graticule);
    ctx.lineWidth = Math.max(0.5, DPR * 0.5); ctx.strokeStyle = "rgba(159,176,197,0.15)"; ctx.stroke();

    // land
    if (land) {
      ctx.beginPath(); path(land);
      ctx.fillStyle = "rgba(116,148,186,0.92)"; ctx.fill();
      ctx.lineWidth = DPR * 0.5; ctx.strokeStyle = "rgba(206,226,247,0.25)"; ctx.stroke();
    }

    // rim
    ctx.beginPath(); path(sphere);
    ctx.lineWidth = DPR * 1.2; ctx.strokeStyle = "rgba(211,154,74,0.55)"; ctx.stroke();

    // marker (after the flight lands)
    if (!flying && visible(tLon, tLat)) {
      const xy = projection([ tLon, tLat ]);
      const pulse = reduce ? 1 : (1 + Math.sin(Date.now() / 480) * 0.35);
      const drop = (1 - markerT) * R * 0.5;
      ctx.globalAlpha = markerT;
      ctx.fillStyle = "rgba(231,184,108,0.22)";
      ctx.beginPath(); ctx.arc(xy[0], xy[1], 12 * DPR * pulse, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = "#e7b86c";
      ctx.beginPath(); ctx.arc(xy[0], xy[1] - drop, 4.6 * DPR, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = DPR;
      ctx.beginPath(); ctx.arc(xy[0], xy[1] - drop, 4.6 * DPR, 0, 2 * Math.PI); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function loop() {
    render();
    if (!flying && markerT < 1) markerT = Math.min(markerT + 0.05, 1);
    requestAnimationFrame(loop);
  }

  function fly() {
    const t0 = performance.now(), DUR = 1600;
    (function step(now) {
      const t = Math.min((now - t0) / DUR, 1);
      const p = interp(d3.easeCubicInOut(t));
      rotate = [ -p[0], -p[1] ];
      if (t < 1) requestAnimationFrame(step);
      else { rotate = [ -tLon, -tLat ]; flying = false; }
    })(t0);
  }

  fetch("/world-land.geojson")
    .then(r => r.json())
    .then(geo => { land = geo; requestAnimationFrame(loop); if (!reduce) fly(); })
    .catch(() => { flying = false; markerT = 1; requestAnimationFrame(loop); });
})();
