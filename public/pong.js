/* 3D Ping-Pong — Three.js (r148 global build).
   Top-down-ish angled view of a table. You control the near paddle with the
   mouse / touch; a simple AI controls the far paddle. First to 7 wins.
   Renders into #pong-canvas; HUD + controls live in the page. */
(function () {
  const canvas = document.getElementById("pong-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const wrap = canvas.parentElement;
  const scoreEl = document.getElementById("pong-score");
  const msgEl = document.getElementById("pong-msg");
  const startBtn = document.getElementById("pong-start");

  // ---- table dimensions (world units) -------------------------------------
  const TABLE_W = 20;   // x: left-right
  const TABLE_D = 32;   // z: near-far (player near +z, AI far -z)
  const WALL = 0.6;
  const PADDLE_W = 5, PADDLE_T = 0.8;
  const BALL_R = 0.7;
  const WIN = 7;

  const ACCENT = 0xd39a4a, ACCENT2 = 0xe7b86c;
  const INK = 0x0b1320, INK2 = 0x16263d, TEXT = 0xe9eef5;

  // ---- renderer / scene / camera ------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 26, 26);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(8, 24, 12);
  scene.add(key);
  const rim = new THREE.PointLight(ACCENT2, 0.6, 120);
  rim.position.set(-10, 12, -10);
  scene.add(rim);

  // ---- table --------------------------------------------------------------
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(TABLE_W, 1, TABLE_D),
    new THREE.MeshStandardMaterial({ color: INK2, roughness: 0.85, metalness: 0.1 })
  );
  table.position.y = -0.5;
  scene.add(table);

  // center + edge lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x33465f });
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W, 0.05, 0.25), lineMat);
  centerLine.position.y = 0.03;
  scene.add(centerLine);

  // side walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x24384f, roughness: 0.6 });
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(WALL, 1.4, TABLE_D), wallMat);
    w.position.set(sx * (TABLE_W / 2 + WALL / 2), 0.2, 0);
    scene.add(w);
  }

  function paddle(color) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(PADDLE_W, 1.2, PADDLE_T),
      new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.3, emissive: color, emissiveIntensity: 0.15 })
    );
    m.position.y = 0.3;
    scene.add(m);
    return m;
  }
  const player = paddle(ACCENT);   // near, +z
  const ai = paddle(0x6f8099);     // far, -z
  const NEAR_Z = TABLE_D / 2 - 1.5;
  const FAR_Z = -(TABLE_D / 2 - 1.5);
  player.position.z = NEAR_Z;
  ai.position.z = FAR_Z;

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_R, 24, 24),
    new THREE.MeshStandardMaterial({ color: ACCENT2, emissive: ACCENT, emissiveIntensity: 0.4, roughness: 0.2 })
  );
  ball.position.y = BALL_R;
  scene.add(ball);

  // ---- state --------------------------------------------------------------
  let vx = 0, vz = 0, playing = false, scoreP = 0, scoreA = 0, targetX = 0;
  const MAXX = TABLE_W / 2 - PADDLE_W / 2;

  function resetBall(towardPlayer) {
    ball.position.set(0, BALL_R, 0);
    const speed = 0.22;
    const angle = (Math.random() * 0.6 - 0.3); // small horizontal spread
    vx = Math.sin(angle) * speed;
    vz = (towardPlayer ? 1 : -1) * Math.cos(angle) * speed;
  }

  function setScore() { if (scoreEl) scoreEl.textContent = scoreP + " : " + scoreA; }
  function msg(t) { if (msgEl) msgEl.textContent = t || ""; }

  function startGame() {
    scoreP = 0; scoreA = 0; setScore();
    player.position.x = 0; ai.position.x = 0; targetX = 0;
    resetBall(Math.random() < 0.5);
    playing = true;
    msg("");
    if (startBtn) startBtn.textContent = "Restart";
  }

  function endGame(playerWon) {
    playing = false;
    msg(playerWon ? "You win! 🏆  Press Restart." : "AI wins. Press Restart to try again.");
    if (startBtn) startBtn.textContent = "Play again";
  }

  // ---- input: mouse / touch controls the near paddle X --------------------
  function pointerX(clientX) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1; // -1..1
    return Math.max(-MAXX, Math.min(MAXX, nx * (TABLE_W / 2)));
  }
  canvas.addEventListener("mousemove", (e) => { targetX = pointerX(e.clientX); });
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches[0]) { targetX = pointerX(e.touches[0].clientX); e.preventDefault(); }
  }, { passive: false });
  if (startBtn) startBtn.addEventListener("click", startGame);

  // ---- resize -------------------------------------------------------------
  function resize() {
    const w = wrap.clientWidth;
    const h = Math.max(320, Math.round(w * 0.62));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ---- loop ---------------------------------------------------------------
  const AI_SPEED = 0.14;
  function tick() {
    requestAnimationFrame(tick);

    // player paddle eases toward pointer target
    player.position.x += (targetX - player.position.x) * 0.35;

    if (playing) {
      // AI tracks the ball with a capped speed (beatable)
      const aiTarget = Math.max(-MAXX, Math.min(MAXX, ball.position.x));
      const d = aiTarget - ai.position.x;
      ai.position.x += Math.max(-AI_SPEED * 12, Math.min(AI_SPEED * 12, d)) * AI_SPEED;

      ball.position.x += vx;
      ball.position.z += vz;

      // side walls
      if (ball.position.x <= -MAXX - PADDLE_W / 2 + 0.5 || ball.position.x >= MAXX + PADDLE_W / 2 - 0.5) {
        const lim = TABLE_W / 2 - BALL_R;
        if (ball.position.x < -lim) { ball.position.x = -lim; vx = Math.abs(vx); }
        if (ball.position.x > lim) { ball.position.x = lim; vx = -Math.abs(vx); }
      }

      // paddle collisions
      const hitP = ball.position.z + BALL_R >= NEAR_Z - PADDLE_T && vz > 0;
      const hitA = ball.position.z - BALL_R <= FAR_Z + PADDLE_T && vz < 0;
      if (hitP && Math.abs(ball.position.x - player.position.x) <= PADDLE_W / 2 + BALL_R) {
        vz = -Math.abs(vz) * 1.03;
        vx += (ball.position.x - player.position.x) * 0.03;
      }
      if (hitA && Math.abs(ball.position.x - ai.position.x) <= PADDLE_W / 2 + BALL_R) {
        vz = Math.abs(vz) * 1.03;
        vx += (ball.position.x - ai.position.x) * 0.03;
      }

      // scoring: ball passes a paddle line
      if (ball.position.z > NEAR_Z + 2) { scoreA++; setScore(); scoreA >= WIN ? endGame(false) : resetBall(false); }
      else if (ball.position.z < FAR_Z - 2) { scoreP++; setScore(); scoreP >= WIN ? endGame(true) : resetBall(true); }
    }

    ball.rotation.x += 0.05; ball.rotation.y += 0.04;
    renderer.render(scene, camera);
  }
  setScore();
  msg("Move with your mouse. Press Play to start.");
  tick();
})();
