// Rescate en Famara: save 40 friends on Famara beach, keep your 3 wigs, outrun the giant wave to the pool party.
(() => {
  const cv = document.getElementById("game");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const $ = id => document.getElementById(id);
  const W = 720, H = 540, TOP = 172, GOAL = 40, SP = 7, LIVES = 3, RUSH = 12;
  const API = { url: "https://emjykorcvgukiaxpyunn.supabase.co", key: "sb_publishable_NSJwJP-j-lXmj-bHx2yR4A_kPyQQnGV" };
  const C = { coral: "#e5603d", sea: "#2795a8", sun: "#eea43c", rose: "#df6f8d", ink: "#17503f", water: "#5cbfd3" };
  const FONT = "'Bricolage Grotesque', Arial, sans-serif";
  const SKIN = ["#f3cfae", "#e0a982", "#b97c55", "#8a5a3c", "#f7dcc4"];
  const HAIR = ["#2b1d16", "#6b3e22", "#d9a441", "#141414", "#a8452c", "#9b9b9b", "#e7c27a"];
  const SHIRT = [C.coral, C.sea, C.sun, C.rose, "#79bf9f", "#8d6cc6", "#ffffff", "#3d6fb5"];
  const SHORTS = ["#17503f", "#2e3a59", "#c9b48a", "#e5603d", "#6a4c93"];
  const ME = { skin: "#f1c9a5", shirt: "#ffffff", shorts: C.sea, hair: "#f4d774" };

  const R = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const look = () => ({ skin: pick(SKIN), hair: pick(HAIR), shirt: pick(SHIRT), shorts: pick(SHORTS), long: Math.random() < 0.45 });
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const num = n => n.toLocaleString("es-ES");

  let dpr = 1, bg = null;
  function fit() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bg = null;
  }

  // ---------- Background: sky, La Graciosa, sea, Risco de Famara, sand ----------
  function makeBg() {
    const c = document.createElement("canvas"); c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext("2d"); g.scale(dpr, dpr);
    let gr = g.createLinearGradient(0, 0, 0, 100);
    gr.addColorStop(0, "#f7d6c2"); gr.addColorStop(1, "#fbeee0");
    g.fillStyle = gr; g.fillRect(0, 0, W, 100);
    [[90, 30, "#ef9fb0"], [210, 18, "#f4b678"], [640, 40, "#9fd3d8"]].forEach(([x, y, col]) => {
      g.globalAlpha = 0.35; g.fillStyle = col;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + i * 18, y + (i % 2) * 5, 34, 11, 0, 0, 7); g.fill(); }
    });
    g.globalAlpha = 1;
    g.fillStyle = "#c7a39f";
    g.beginPath(); g.moveTo(20, 92); g.quadraticCurveTo(60, 70, 95, 84); g.quadraticCurveTo(130, 66, 175, 92); g.closePath(); g.fill();
    gr = g.createLinearGradient(0, 90, 0, TOP);
    gr.addColorStop(0, "#3fa7b9"); gr.addColorStop(1, "#8fd6d4");
    g.fillStyle = gr; g.fillRect(0, 90, W, TOP - 82);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) { const x = R(0, 260), y = R(100, TOP - 30); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 20, y); g.stroke(); }
    gr = g.createLinearGradient(0, 15, 0, TOP);
    gr.addColorStop(0, "#9a6a63"); gr.addColorStop(0.6, "#b07b5f"); gr.addColorStop(1, "#7b5a62");
    g.fillStyle = gr;
    const ridge = [[230, TOP - 6], [290, TOP - 34], [330, 92], [362, 62], [400, 46], [445, 38], [500, 30], [545, 22], [600, 27], [650, 17], [690, 22], [720, 20], [720, TOP - 6]];
    g.beginPath(); ridge.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
    g.save(); g.clip();
    g.strokeStyle = "rgba(255,230,200,.18)"; g.lineWidth = 2;
    for (let y = 30; y < TOP; y += 9) { g.beginPath(); g.moveTo(230, y + 6); for (let x = 230; x <= 720; x += 40) g.lineTo(x, y + Math.sin(x * 0.02 + y) * 3); g.stroke(); }
    g.strokeStyle = "rgba(60,40,50,.25)"; g.lineWidth = 2;
    for (let x = 340; x < 720; x += 22) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x - 18, TOP); g.stroke(); }
    g.restore();
    gr = g.createLinearGradient(0, TOP - 10, 0, H);
    gr.addColorStop(0, "#e9cf9d"); gr.addColorStop(0.15, "#f3dcae"); gr.addColorStop(1, "#efd29e");
    g.fillStyle = gr; g.fillRect(0, TOP - 12, W, H - TOP + 12);
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(150,110,60,${R(.08, .2)})`; g.fillRect(R(0, W), R(TOP, H), 1.4, 1.4); }
    g.fillStyle = "#4b3f45";
    [[18, 520, 26, 14], [52, 532, 20, 10], [700, 515, 24, 14], [672, 530, 16, 8]].forEach(([x, y, rx, ry]) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); });
    g.strokeStyle = "#6f9a4a"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(40, 512); g.quadraticCurveTo(40 + i * 4, 495, 40 + i * 9, 478 + Math.abs(i) * 4); g.stroke(); }
    return c;
  }

  function shoreline(t) {
    const base = TOP - 8;
    ctx.fillStyle = "rgba(143,214,212,.85)";
    ctx.beginPath(); ctx.moveTo(0, base - 14);
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, base + Math.sin(x * 0.03 + t * 1.6) * 3 + Math.sin(t * 0.7) * 4);
    ctx.lineTo(W, base - 14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 12) { const y = base + Math.sin(x * 0.03 + t * 1.6) * 3 + Math.sin(t * 0.7) * 4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }

  // ---------- Sprites ----------
  function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function line(a, b, c, d) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

  const CURLS = [[-8, -24], [8, -24], [-9, -30], [9, -30], [-7, -36], [7, -36], [-3, -39], [3, -39], [0, -41]];
  function curls(dx = 0, dy = 0, s = 1) {
    ctx.fillStyle = "#f4d774"; ctx.strokeStyle = "#c9a23c"; ctx.lineWidth = 1;
    CURLS.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(dx + x * s, dy + y * s, 4.4 * s, 0, 7); ctx.fill(); ctx.stroke(); });
  }
  function shades() {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.moveTo(-8, -33); ctx.lineTo(-1, -33); ctx.lineTo(-1.5, -29); ctx.lineTo(-6.5, -29); ctx.lineTo(-9, -35); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, -33); ctx.lineTo(1, -33); ctx.lineTo(1.5, -29); ctx.lineTo(6.5, -29); ctx.lineTo(9, -35); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1d2a30"; ctx.fillRect(-6.4, -32.2, 4.4, 2.6); ctx.fillRect(2, -32.2, 4.4, 2.6);
  }
  function hairCap(L) {
    ctx.fillStyle = L.hair;
    ctx.beginPath(); ctx.arc(0, -32, 7.6, Math.PI, 0); ctx.fill();
    if (L.long) { ctx.fillRect(-7.6, -33, 3, 10); ctx.fillRect(4.6, -33, 3, 10); }
  }
  // Feet at (x, y). o: flip, walk, t, armsUp, rot, wig, bald, bottle, noLegs, noShadow
  function person(x, y, L, o = {}) {
    const t = o.t || 0;
    if (!o.noShadow) { ctx.fillStyle = "rgba(90,60,30,.18)"; ctx.beginPath(); ctx.ellipse(x, y, 9, 3, 0, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    ctx.scale(o.flip ? -1 : 1, 1);
    if (!o.noLegs) {
      const k = o.walk ? Math.sin(t * 14) * 2.5 : 0;
      ctx.fillStyle = L.skin; ctx.fillRect(-5, -11 - Math.max(0, k), 4, 11); ctx.fillRect(1, -11 - Math.max(0, -k), 4, 11);
      ctx.fillStyle = L.shorts; ctx.fillRect(-6, -15, 12, 6);
    }
    ctx.fillStyle = L.shirt; rrect(-7, -25, 14, 12, 4); ctx.fill();
    ctx.strokeStyle = L.skin; ctx.lineWidth = 3; ctx.lineCap = "round";
    if (o.armsUp) { const w = Math.sin(t * 10) * 2; line(-6, -22, -11 + w, -34); line(6, -22, 11 - w, -34); }
    else { line(-6, -22, -9, -14); line(6, -22, 9, -14); }
    if (o.bottle) { ctx.fillStyle = "#3f8f4e"; ctx.fillRect(8, -21, 4, 8); ctx.fillRect(9, -24, 2, 3); }
    ctx.fillStyle = L.skin; circle(0, -31, 7);
    if (o.wig) {
      if (!o.bald) { curls(); ctx.fillStyle = L.skin; circle(0, -30, 5.6); }
      else { ctx.fillStyle = "rgba(255,255,255,.6)"; circle(-2, -35, 2); }
      shades(); ctx.fillStyle = C.coral; ctx.fillRect(-2, -26, 4, 1.4);
    } else { hairCap(L); ctx.fillStyle = "#22201f"; circle(-2.5, -30.5, 1); circle(2.5, -30.5, 1); }
    ctx.restore();
  }
  function shark(x, y, flip, t) {
    ctx.fillStyle = "rgba(60,60,70,.18)"; ctx.beginPath(); ctx.ellipse(x, y + 2, 24, 5, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -1 : 1, 1);
    const w = Math.sin(t * 12) * 3;
    ctx.fillStyle = "#7d8fa0";
    ctx.beginPath(); ctx.moveTo(-20, -8); ctx.lineTo(-32, -18 + w); ctx.lineTo(-29, -8); ctx.lineTo(-32, 0 + w); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -8, 22, 8.5, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, -15); ctx.lineTo(3, -28); ctx.lineTo(8, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e9eef2"; ctx.beginPath(); ctx.ellipse(3, -4, 16, 3.6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#1d2a30"; circle(14, -11, 1.6);
    ctx.strokeStyle = "#1d2a30"; ctx.lineWidth = 1.4; line(10, -5, 21, -6);
    ctx.fillStyle = "#fff"; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(11 + i * 2.5, -5.6); ctx.lineTo(12 + i * 2.5, -3.6); ctx.lineTo(13 + i * 2.5, -5.8); ctx.fill(); }
    ctx.restore();
  }
  function kite(x, y, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2) * 0.15);
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(12, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(-12, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.sea; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(0, 18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 18);
    for (let i = 1; i < 5; i++) ctx.lineTo(Math.sin(t * 5 + i) * 5, 18 + i * 7); ctx.stroke();
    ctx.restore();
  }
  function gullSprite(x, y, t, carrying) {
    ctx.save(); ctx.translate(x, y);
    const f = Math.sin(t * 14) * 9;
    ctx.strokeStyle = "#8b98a3"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(-12, -8 - f, -22, -2 - f); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, 0); ctx.quadraticCurveTo(12, -8 - f, 22, -2 - f); ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, 7); ctx.fill();
    circle(7, -3, 4);
    ctx.fillStyle = "#f2b33d"; ctx.beginPath(); ctx.moveTo(10, -3); ctx.lineTo(16, -2); ctx.lineTo(10, -1); ctx.fill();
    ctx.fillStyle = "#1d2a30"; circle(8, -4, 1);
    if (carrying) curls(0, 40, 0.75);
    ctx.restore();
  }
  function badge(x, y, t) {
    const b = Math.sin(t * 6) * 2;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.coral; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y + b, 7, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.coral; ctx.font = `800 11px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("!", x, y + b + 0.5);
  }
  function board(x, y, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.fillStyle = "#fff3c4"; ctx.beginPath(); ctx.ellipse(0, 0, 20, 6, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = C.coral; ctx.lineWidth = 2; line(-18, 0, 18, 0);
    ctx.strokeStyle = "rgba(23,80,63,.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 20, 6, 0, 0, 7); ctx.stroke();
    ctx.restore();
  }
  function item(it) {
    if (it.t > 7 && Math.floor(it.t * 8) % 2) return;
    const b = Math.sin(it.t * 4) * 2.5, x = it.x, y = it.y - 10 + b;
    ctx.fillStyle = "rgba(90,60,30,.18)"; ctx.beginPath(); ctx.ellipse(it.x, it.y, 11, 3.5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.5 + Math.sin(it.t * 6) * 0.3})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.stroke();
    if (it.kind === "board") board(x, y, -0.5);
    else if (it.kind === "mojo") {
      ctx.fillStyle = "#8a5a3c"; ctx.beginPath(); ctx.ellipse(x, y + 3, 12, 5, 0, 0, Math.PI); ctx.fill(); ctx.fillRect(x - 12, y, 24, 3);
      ctx.fillStyle = "#e8c66a"; [[-6, -1], [0, -3], [6, -1], [-3, 1], [4, 1]].forEach(([a, c]) => circle(x + a, y + c, 3));
      ctx.fillStyle = "#c2321e"; circle(x - 2, y - 3, 1.6); circle(x + 4, y - 1, 1.6); circle(x - 6, y, 1.3);
    } else if (it.kind === "mojito") {
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.beginPath(); ctx.moveTo(x - 7, y - 10); ctx.lineTo(x + 7, y - 10); ctx.lineTo(x + 5, y + 8); ctx.lineTo(x - 5, y + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#b9e07a"; ctx.beginPath(); ctx.moveTo(x - 6, y - 4); ctx.lineTo(x + 6, y - 4); ctx.lineTo(x + 5, y + 8); ctx.lineTo(x - 5, y + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#3f8f4e"; ctx.beginPath(); ctx.ellipse(x - 3, y - 8, 4, 2, -0.6, 0, 7); ctx.fill();
      ctx.strokeStyle = C.coral; ctx.lineWidth = 1.6; line(x + 2, y - 4, x + 7, y - 15);
      ctx.fillStyle = "#f6e27a"; circle(x + 6, y - 9, 2.4);
    } else if (it.kind === "wig") curls(x, y + 30, 0.8);
  }

  // ---------- State ----------
  let mode = "title", P, trail, followers, victims, fx, confetti, time, spawnT, pending, actors, finT, hudT = 0;
  let lives, score, combo, comboT, items, itemT, gull, gullT, calima, calimaT, banner, rush, whoT, seen;
  const keys = {}; let ptr = null;

  function reset() {
    P = { x: W / 2, y: 400, stun: 0, inv: 0, flip: false, moving: false, t: 0, board: 0, magnet: 0, drunk: 0, bald: false };
    trail = []; followers = []; victims = []; fx = []; confetti = []; time = 0; spawnT = 0.4; finT = 0; actors = null;
    pending = Array.from({ length: GOAL }, look);
    lives = LIVES; score = 0; combo = 0; comboT = 0; items = []; itemT = R(7, 10);
    gull = null; gullT = R(10, 15); calima = 0; calimaT = R(18, 26); banner = null; rush = null; whoT = 0; seen = {};
  }

  const sharkPos = v => ({ x: v.x + Math.cos(v.ang) * 58, y: v.y + Math.sin(v.ang) * 26, flip: Math.sin(v.ang) > 0 });
  const followerPos = i => trail[Math.max(0, trail.length - 1 - (i + 1) * SP)] || P;

  function say(txt, sub, key) {
    // The explanation shows the first time an event happens; afterwards only the headline.
    banner = { txt, sub: key && seen[key] ? "" : sub, t: 0 };
    if (key) seen[key] = true;
  }
  function pop(x, y, txt, col) { fx.push({ x, y, txt, col, t: 0 }); }

  function farFromPlayer(minD, yMin, yMax) {
    let x, y, n = 0;
    do { x = R(60, W - 60); y = R(yMin, yMax); n++; }
    while (n < 40 && (dist(x, y, P.x, P.y) < minD || victims.some(v => dist(x, y, v.x, v.y) < 90) || items.some(v => dist(x, y, v.x, v.y) < 60)));
    return { x, y };
  }

  function spawn() {
    if (!pending.length) return;
    const n = followers.length;
    let types = ["buried", "drunk", "kite", "shark"];
    if (victims.filter(v => v.type === "shark").length >= (n >= 20 ? 3 : 2)) types = types.filter(t => t !== "shark");
    const type = pick(types);
    const p = farFromPlayer(150, type === "shark" ? TOP + 45 : TOP + 45, type === "shark" ? TOP + 130 : H - 30);
    victims.push({ type, x: p.x, y: p.y, L: pending.pop(), t: R(0, 3), prog: 0, alt: 0, ang: R(0, 6.28), vx: 0, vy: 0, turn: 0, wind: R(14, 24) * (Math.random() < .5 ? -1 : 1) });
  }

  function spawnItem() {
    const kinds = ["board", "board", "mojo", "mojo", "mojito", "mojito", "mojito"];
    if (lives < LIVES) kinds.push("wig");
    const p = farFromPlayer(130, TOP + 50, H - 30);
    items.push({ kind: pick(kinds), x: p.x, y: p.y, t: 0 });
  }

  function useItem(it) {
    score += 50;
    if (it.kind === "board") { P.board = 6; say("Party Wave!", "Surf mode: faster, and sharks can't touch you.", "board"); }
    else if (it.kind === "mojo") { P.magnet = 6; say("¡Papas con mojo!", "Friend magnet for 6 seconds.", "mojo"); }
    else if (it.kind === "mojito") { P.drunk = 5; P.magnet = 0; say("¡Mojito!", "Oops. Your controls are back to front.", "mojito"); }
    else if (it.kind === "wig") { lives = Math.min(LIVES, lives + 1); say("Spare wig!", "+1 wig", "wig"); }
    hud();
  }

  function rescue(i) {
    const v = victims[i]; victims.splice(i, 1);
    followers.push(v.L);
    combo = comboT > 0 ? Math.min(5, combo + 1) : 1; comboT = 3;
    const pts = 100 * combo; score += pts;
    pop(v.x, v.y - 50, `+${pts}`, C.coral);
    if (combo > 1) pop(v.x, v.y - 70, `combo x${combo}`, C.ink);
    hud();
    if (followers.length >= GOAL && !rush) startRush();
  }

  function loseLife(msg, extra) {
    lives--; P.inv = 2.2;
    pop(P.x, P.y - 58, msg, C.coral);
    if (extra) pop(P.x + 26, P.y - 78, extra, C.ink);
    hud();
    if (lives <= 0) gameOver();
  }
  function hurt(msg, lostN) {
    const lost = lostN ? followers.splice(Math.max(0, followers.length - lostN)) : [];
    pending.push(...lost);
    P.stun = 0.6;
    loseLife(msg, lost.length ? `-${lost.length} friends` : "");
  }

  function moveVictim(v, dt, live) {
    v.t += dt;
    const n = followers.length;
    if (v.type === "shark") v.ang += dt * (1.9 + n * 0.025);
    else if (v.type === "drunk") {
      v.turn -= dt;
      if (v.turn <= 0) { const a = R(0, 6.28), sp = 80 + n * 1.5; v.vx = Math.cos(a) * sp; v.vy = Math.sin(a) * sp; v.turn = R(0.4, 1.1); }
      v.x += v.vx * dt; v.y += v.vy * dt;
      if (v.x < 40 || v.x > W - 40) v.vx *= -1;
      if (v.y < TOP + 40 || v.y > H - 20) v.vy *= -1;
      v.x = clamp(v.x, 40, W - 40); v.y = clamp(v.y, TOP + 40, H - 20);
      if (Math.random() < dt * 0.5) pop(v.x + 10, v.y - 46, "hic!", C.ink);
    } else if (v.type === "kite") {
      if (live) v.alt += dt * (8 + n * 0.12); else v.alt = 45 + Math.sin(v.t) * 10;
      v.x += v.wind * dt; if (v.x < 50 || v.x > W - 50) { v.wind *= -1; v.x = clamp(v.x, 50, W - 50); }
    }
  }

  function update(dt) {
    P.t += dt; time += dt;
    if (banner && (banner.t += dt) > 2.8) banner = null;
    let dx = 0, dy = 0;
    if (keys.l) dx--; if (keys.r) dx++; if (keys.u) dy--; if (keys.d) dy++;
    if (ptr && !dx && !dy) { const ex = ptr.x - P.x, ey = ptr.y - P.y, d = Math.hypot(ex, ey); if (d > 6) { dx = ex / d; dy = ey / d; } }
    if (P.drunk > 0 && (dx || dy)) { dx = -dx + Math.sin(P.t * 5) * 0.6; dy = -dy + Math.cos(P.t * 4) * 0.6; }
    const m = Math.hypot(dx, dy);
    P.moving = false;
    for (const k of ["inv", "stun", "board", "magnet", "drunk"]) if (P[k] > 0) P[k] -= dt;
    if (P.stun <= 0 && m > 0) {
      const sp = P.board > 0 ? 280 : 180;
      P.x += dx / m * sp * dt; P.y += dy / m * sp * dt; P.moving = true; if (Math.abs(dx) > 0.1) P.flip = dx < 0;
    }
    P.x = clamp(P.x, 16, W - 16); P.y = clamp(P.y, TOP + 20, H - 8);
    const lt = trail[trail.length - 1];
    if (!lt || dist(lt.x, lt.y, P.x, P.y) > 2.2) { trail.push({ x: P.x, y: P.y, f: P.flip }); if (trail.length > GOAL * SP + 20) trail.shift(); }
    if ((comboT -= dt) <= 0) combo = 0;
    if (whoT > 0) whoT -= dt;

    // Snake rule: walking into your own conga line trips you and cuts it there.
    if (P.inv <= 0 && P.board <= 0 && P.moving) {
      for (let i = 6; i < followers.length; i++) {
        const p = followerPos(i);
        if (dist(P.x, P.y, p.x, p.y) < 11) {
          const lost = followers.splice(i); pending.push(...lost);
          P.stun = 0.6;
          say("Tripped over the conga!", "Don't walk into your own line of friends.", "conga");
          loseLife("Ouch!", `-${lost.length} friends`);
          if (mode !== "play") return;
          break;
        }
      }
    }

    for (let i = victims.length - 1; i >= 0; i--) {
      const v = victims[i];
      moveVictim(v, dt, true);
      if (v.type === "shark") {
        const s = sharkPos(v);
        if (P.inv <= 0 && P.board <= 0 && dist(P.x, P.y, s.x, s.y - 6) < 24) {
          say("Shark bite!", "You lose a wig, and your last 3 friends run off.", "shark");
          hurt("Ouch!", 3); if (mode !== "play") return;
        }
      }
      if (v.type === "kite" && v.alt > 125) {
        victims.splice(i, 1); pending.unshift(v.L);
        pop(v.x, v.y - 165, "Bye!", C.coral);
        say("Gone with the wind!", "A friend flew off to Fuerteventura. That costs a wig.", "kite");
        loseLife("-1 wig"); if (mode !== "play") return;
        continue;
      }
      if (P.stun > 0) continue;
      const d = dist(P.x, P.y, v.x, v.y), reach = P.magnet > 0 ? 115 : 26;
      if (v.type === "buried" && P.magnet <= 0) {
        if (d < 34 && !P.bald) v.prog += dt / 1.1; else v.prog = Math.max(0, v.prog - dt * 0.6);
        if (v.prog >= 1) { rescue(i); if (mode !== "play") return; }
        continue;
      }
      if (d < reach) {
        if (P.bald) { if (whoT <= 0) { pop(v.x, v.y - 58, "Who are you?!", C.ink); whoT = 1.2; } continue; }
        rescue(i); if (mode !== "play") return;
      }
    }

    // Things that wash up on the beach
    if (!rush && followers.length >= 2 && (itemT -= dt) <= 0) { spawnItem(); itemT = R(7, 12); }
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; it.t += dt;
      if (it.t > 9) { items.splice(i, 1); continue; }
      if (P.stun <= 0 && dist(P.x, P.y, it.x, it.y) < 22) { items.splice(i, 1); useItem(it); }
    }

    // The seagull that steals wigs
    if (!gull && !rush && !P.bald && followers.length >= 6 && (gullT -= dt) <= 0) {
      const left = Math.random() < 0.5;
      gull = { x: left ? -30 : W + 30, y: R(TOP + 80, H - 60), vx: 0, vy: 0, state: "hunt", t: 0, turn: 0 };
      say("¡Gaviota!", "A seagull wants your wig. Dodge it!", "gull");
    }
    if (gull) {
      const g = gull; g.t += dt;
      const ex = P.x - g.x, ey = P.y - g.y, d = Math.hypot(ex, ey) || 1;
      let tx = g.vx, ty = g.vy;
      if (g.state === "hunt") {
        tx = ex / d * 165; ty = ey / d * 165;
        if (d < 20 && P.inv <= 0 && P.board <= 0) {
          g.state = "carry"; P.bald = true;
          say("Wig stolen!", "Nobody recognises you without it. Catch the seagull!", "bald");
        }
        if (g.t > 9) g.state = "leave";
      } else if (g.state === "carry") {
        g.turn -= dt;
        if (d < 140) { tx = -ex / d * 150; ty = -ey / d * 150; }
        else if (g.turn <= 0) { const a = R(0, 6.28); tx = Math.cos(a) * 100; ty = Math.sin(a) * 100; g.turn = R(0.8, 1.5); }
        if (d < 24) { P.bald = false; g.state = "leave"; score += 150; pop(P.x, P.y - 58, "+150", C.coral); say("Wig back!", "", null); hud(); }
      } else { tx = g.vx * 1.02; ty = -200; }
      const k = Math.min(1, dt * (g.state === "hunt" ? 2.2 : 4));
      g.vx += (tx - g.vx) * k; g.vy += (ty - g.vy) * k;
      g.x += g.vx * dt; g.y += g.vy * dt;
      if (g.state !== "leave") {
        if (g.state === "carry" && (g.x < 30 || g.x > W - 30)) g.vx *= -1;
        if (g.state === "carry" && (g.y < TOP + 40 || g.y > H - 20)) g.vy *= -1;
        if (g.state === "carry") { g.x = clamp(g.x, 30, W - 30); g.y = clamp(g.y, TOP + 40, H - 20); }
      } else if (g.y < -120 || g.x < -80 || g.x > W + 80) { gull = null; gullT = R(16, 26); }
    }

    // Calima: Saharan dust closes in
    if (!rush && followers.length >= 14) {
      if (calima > 0) calima -= dt;
      else if ((calimaT -= dt) <= 0) { calima = 7; calimaT = R(22, 32); say("¡Calima!", "Sahara dust. You can barely see.", "calima"); }
    }

    // The final rush: a giant wave, and the pool far away
    if (rush) {
      rush.t -= dt;
      const pl = rush.pool;
      if (P.x > pl.x - 8 && P.x < pl.x + pl.w + 8 && P.y > pl.y - 8 && P.y < pl.y + pl.h + 14) { startFinale(); return; }
      if (rush.t <= 0) {
        rush = null; calima = 0;
        const lost = followers.splice(followers.length - 8); pending.push(...lost);
        say("Wiped out!", "The wave washed 8 friends away. Go get them.", null);
        loseLife("Glub!", "-8 friends"); if (mode !== "play") return;
      }
    }

    if (!rush) {
      spawnT -= dt;
      const target = Math.min(7, 3 + Math.floor(followers.length / 7));
      if (spawnT <= 0 && victims.length < target && pending.length) { spawn(); spawnT = R(0.5, 1.2); }
    }

    if ((hudT -= dt) <= 0) { $("g-time").textContent = fmt(time); hudT = 0.25; }
  }

  function startRush() {
    victims.forEach(v => pending.push(v.L)); victims = []; items = []; calima = 0;
    if (gull && gull.state === "carry") P.bald = false;
    gull = null;
    const spots = [{ x: 60, y: TOP + 40 }, { x: W - 180, y: TOP + 40 }, { x: 60, y: H - 90 }, { x: W - 180, y: H - 90 }];
    const s = spots.sort((a, b) => dist(b.x + 60, b.y + 30, P.x, P.y) - dist(a.x + 60, a.y + 30, P.x, P.y))[0];
    rush = { t: RUSH, pool: { x: s.x, y: s.y, w: 120, h: 60 } };
    say("¡OLA GIGANTE!", "A giant wave is coming. Get all 40 into the pool!", null);
  }

  // ---------- Endings ----------
  const POOL = { x: 180, y: 250, w: 360, h: 210 };
  let last = { score: 0, friends: 0, secs: 0, saved: false };
  function startFinale() {
    mode = "finale"; finT = 0; ptr = null; rush = null; banner = null; P.drunk = 0;
    $("stage").classList.remove("playing");
    const bonus = 5000 + Math.max(0, 300 - Math.floor(time)) * 20 + lives * 1000;
    score += bonus;
    const slots = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) slots.push({ tx: POOL.x + 36 + c * (POOL.w - 72) / 8 + (r % 2) * 8, ty: POOL.y + 50 + r * (POOL.h - 75) / 4 });
    const me = slots.splice(22, 1)[0];
    actors = [{ L: ME, me: true, sx: P.x, sy: P.y, ...me, d: 0 }];
    followers.forEach((L, i) => {
      const p = followerPos(i);
      actors.push({ L, sx: p.x, sy: p.y, ...slots[i], d: 0.15 + i * 0.03, ring: i % 5 === 0 ? pick([C.coral, C.rose, C.sun]) : null });
    });
    endCard("¡40 amigos rescatados!",
      `Everyone made it to the pool in ${fmt(time)} with ${lives} ${lives === 1 ? "wig" : "wigs"} left. Bonus +${num(bonus)}. The real pool party is Saturday 12 from 14:00. Wigs and sunnies mandatory.`, 2600);
    hud();
  }
  function gameOver() {
    mode = "over"; ptr = null; P.stun = 99; rush = null; calima = 0; P.magnet = 0; P.board = 0; P.drunk = 0;
    $("stage").classList.remove("playing");
    banner = { txt: "Party's over", sub: "No wigs left", t: 0, hold: true };
    endCard("Out of wigs", `You saved ${followers.length} of 40 friends before the party ended. Try again: the giant wave is waiting at 40.`, 900);
  }
  function endCard(title, text, delay) {
    last = { score, friends: mode === "finale" ? GOAL : followers.length, secs: Math.floor(time), saved: false };
    const best = loadBest(), isBest = score > 0 && score > best;
    if (isBest) saveBest(score);
    $("g-end-h").textContent = title;
    $("g-end-txt").textContent = `${text} Score: ${num(score)}${isBest ? " (your best yet)" : best ? `. Your best: ${num(best)}` : ""}.`;
    $("g-save-msg").textContent = "";
    $("g-save").hidden = !fameOK || score <= 0;
    $("g-save-btn").disabled = false;
    try { $("g-name").value = $("g-name").value || localStorage.getItem("j40-player") || ""; } catch {}
    setTimeout(() => { if (mode === "finale" || mode === "over") $("g-end").hidden = false; }, delay);
  }
  function loadBest() { try { return Number(localStorage.getItem("j40-best-score")) || 0; } catch { return 0; } }
  function saveBest(v) { try { localStorage.setItem("j40-best-score", String(v)); } catch {} }

  function drawPool(t) {
    const { x, y, w, h } = POOL;
    ctx.fillStyle = "#f6ecd6"; ctx.fillRect(x - 18, y - 18, w + 36, h + 36);
    ctx.fillStyle = "#bfe3ea"; ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
    ctx.fillStyle = C.water; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const yy = y + 14 + i * 22; ctx.beginPath(); for (let xx = x + 6; xx < x + w - 6; xx += 10) { const k = yy + Math.sin(xx * 0.05 + t * 2 + i) * 2; xx === x + 6 ? ctx.moveTo(xx, k) : ctx.lineTo(xx, k); } ctx.stroke(); }
    ctx.strokeStyle = "#c9cfd2"; ctx.lineWidth = 3; line(x + w - 30, y - 16, x + w - 30, y + 14); line(x + w - 16, y - 16, x + w - 16, y + 14);
    [[x - 60, y + 40], [x + w + 60, y + 120]].forEach(([px, py]) => {
      ctx.strokeStyle = "#8a6440"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, py + 70); ctx.quadraticCurveTo(px + 10, py + 30, px, py - 10); ctx.stroke();
      ctx.strokeStyle = "#4f8f4a"; ctx.lineWidth = 5;
      for (let a = 0; a < 6; a++) { const an = a / 6 * Math.PI * 2 + Math.sin(t) * 0.05; ctx.beginPath(); ctx.moveTo(px, py - 10); ctx.quadraticCurveTo(px + Math.cos(an) * 20, py - 24 + Math.sin(an) * 8, px + Math.cos(an) * 34, py - 6 + Math.sin(an) * 14); ctx.stroke(); }
    });
    ctx.fillStyle = C.coral; ctx.fillRect(x + w / 2 - 110, y - 52, 220, 30);
    ctx.fillStyle = "#fff"; ctx.font = `800 18px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("J40 POOL PARTY", x + w / 2, y - 36);
  }

  function drawFinale(dt) {
    finT += dt;
    drawPool(finT);
    const list = actors.map((a, i) => {
      const k = clamp((finT - a.d) / 2.2, 0, 1), e = 1 - Math.pow(1 - k, 3);
      return { a, i, k, x: a.sx + (a.tx - a.sx) * e, y: a.sy + (a.ty - a.sy) * e };
    }).sort((p, q) => p.y - q.y);
    for (const { a, i, k, x, y } of list) {
      if (k < 1) { person(x, y, a.L, { walk: true, t: finT + i, wig: a.me, flip: a.tx < a.sx }); continue; }
      const bob = Math.sin(finT * 3 + i) * 1.5;
      person(x, y + 13 + bob, a.L, { noLegs: true, noShadow: true, armsUp: (i + Math.floor(finT * 1.5)) % 3 === 0, t: finT + i, wig: a.me });
      ctx.fillStyle = C.water; ctx.fillRect(x - 13, y - 2 + bob, 26, 18);
      if (a.ring) { ctx.strokeStyle = a.ring; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, y - 2 + bob, 13, 5, 0, 0, 7); ctx.stroke(); }
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y - 1 + bob, 15, 4.5, 0, 0, 7); ctx.stroke();
    }
    if (finT > 1.2 && confetti.length < 260) for (let n = 0; n < 4; n++) confetti.push({ x: R(0, W), y: -10, vx: R(-30, 30), vy: R(60, 140), r: R(0, 6), c: pick([C.coral, C.sun, C.rose, C.sea, "#fff"]) });
    for (let i = confetti.length - 1; i >= 0; i--) {
      const p = confetti[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 6;
      if (p.y > H + 10) { confetti.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-3, -1.5, 6, 3); ctx.restore();
    }
  }

  // ---------- Draw ----------
  function drawVictim(v) {
    const t = v.t;
    if (v.type === "buried") {
      ctx.fillStyle = "#d8b47a"; ctx.beginPath(); ctx.ellipse(v.x, v.y, 22, 8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#e6c58c"; ctx.beginPath(); ctx.ellipse(v.x, v.y - 2, 16, 5, 0, 0, 7); ctx.fill();
      ctx.save(); ctx.translate(v.x, v.y + 22); ctx.fillStyle = v.L.skin; circle(0, -31, 7); hairCap(v.L);
      ctx.fillStyle = "#22201f"; circle(-2.5, -30.5, 1); circle(2.5, -30.5, 1); ctx.restore();
      ctx.fillStyle = v.L.skin; const w = Math.sin(t * 9) * 3;
      circle(v.x - 15, v.y - 6 + w, 2.6); circle(v.x + 15, v.y - 6 - w, 2.6);
      if (v.prog > 0) { ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(v.x, v.y - 9, 15, -Math.PI / 2, -Math.PI / 2 + v.prog * Math.PI * 2); ctx.stroke(); }
      badge(v.x, v.y - 30, t);
    } else if (v.type === "shark") {
      person(v.x + Math.sin(t * 40) * 0.8, v.y, v.L, { armsUp: true, t });
      badge(v.x, v.y - 52, t);
    } else if (v.type === "drunk") {
      person(v.x, v.y, v.L, { rot: Math.sin(t * 3) * 0.28, walk: true, t, bottle: true, flip: v.vx < 0 });
      badge(v.x, v.y - 52, t);
    } else if (v.type === "kite") {
      const danger = v.alt / 125;
      ctx.strokeStyle = `rgba(229,96,61,${0.4 + danger * 0.5})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(v.x, v.y, 15 + Math.sin(t * 6) * 2, 6, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = "rgba(90,60,30,.22)"; ctx.beginPath(); ctx.ellipse(v.x, v.y, 9 - danger * 3, 3, 0, 0, 7); ctx.fill();
      const py = v.y - v.alt, kx = v.x + 34 * Math.sign(v.wind || 1), ky = py - 82;
      ctx.strokeStyle = "rgba(23,80,63,.6)"; ctx.lineWidth = 1; line(v.x + 10 * Math.sign(v.wind || 1), py - 33, kx, ky + 16);
      person(v.x, py, v.L, { armsUp: true, t, noShadow: true, flip: v.wind < 0 });
      kite(kx, ky, t);
    }
  }

  function drawRush(t) {
    const k = 1 - rush.t / RUSH, pl = rush.pool;
    // the wave builds over the sea
    const crest = 150 - k * 70;
    ctx.fillStyle = "#2b8fa3";
    ctx.beginPath(); ctx.moveTo(0, TOP - 4);
    for (let x = 0; x <= W; x += 10) ctx.lineTo(x, crest + Math.sin(x * 0.04 + t * 3) * 6);
    ctx.lineTo(W, TOP - 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff";
    for (let x = 0; x <= W; x += 18) circle(x, crest - 2 + Math.sin(x * 0.04 + t * 3) * 6, 5);
    // the pool
    ctx.fillStyle = "#f6ecd6"; ctx.fillRect(pl.x - 8, pl.y - 8, pl.w + 16, pl.h + 16);
    ctx.fillStyle = C.water; ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) line(pl.x + 10, pl.y + 15 + i * 15, pl.x + pl.w - 10, pl.y + 15 + i * 15 + Math.sin(t * 3 + i) * 2);
    ctx.fillStyle = C.coral; ctx.font = `800 13px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("POOL", pl.x + pl.w / 2, pl.y + pl.h / 2);
    const ay = pl.y - 22 + Math.sin(t * 6) * 4;
    ctx.beginPath(); ctx.moveTo(pl.x + pl.w / 2 - 9, ay - 8); ctx.lineTo(pl.x + pl.w / 2 + 9, ay - 8); ctx.lineTo(pl.x + pl.w / 2, ay + 4); ctx.closePath(); ctx.fill();
  }
  function drawPointer() {
    const pl = rush.pool, a = Math.atan2(pl.y + pl.h / 2 - P.y, pl.x + pl.w / 2 - P.x);
    ctx.save(); ctx.translate(P.x + Math.cos(a) * 16, P.y - 62 + Math.sin(a) * 10); ctx.rotate(a);
    ctx.fillStyle = C.coral; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -9); ctx.lineTo(-4, 0); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawFx(dt) {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i]; f.t += dt; if (f.t > 1.1) { fx.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - f.t / 1.1; ctx.fillStyle = f.col;
      ctx.font = `800 ${f.txt.length > 4 ? 14 : 18}px ${FONT}`;
      ctx.fillText(f.txt, f.x, f.y - f.t * 26);
    }
    ctx.globalAlpha = 1;
  }

  function drawCalima() {
    const k = Math.min(1, calima / 0.8, (7 - calima) / 0.8);
    const g = ctx.createRadialGradient(P.x, P.y - 15, 55, P.x, P.y - 15, 165);
    g.addColorStop(0, "rgba(214,150,80,0)"); g.addColorStop(1, `rgba(206,140,72,${0.95 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function drawHud() {
    for (let i = 0; i < LIVES; i++) {
      ctx.globalAlpha = i < lives ? 1 : 0.22;
      curls(24 + i * 30, 52, 0.62);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = C.ink; ctx.font = `800 20px ${FONT}`;
    ctx.fillText(num(score), 112, 30);
    if (combo > 1) { ctx.fillStyle = C.coral; ctx.font = `800 15px ${FONT}`; ctx.fillText(`combo x${combo}`, 112, 52); }
    const pills = [];
    if (P.board > 0) pills.push(["Surf", P.board, C.sun]);
    if (P.magnet > 0) pills.push(["Mojo", P.magnet, C.coral]);
    if (P.drunk > 0) pills.push(["Mojito", P.drunk, "#5f9e3c"]);
    if (P.bald) pills.push(["No wig", 0, C.ink]);
    pills.forEach(([txt, s, col], i) => {
      const x = 14 + i * 84, y = 72;
      ctx.fillStyle = col; rrect(x, y, 78, 20, 10); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = `700 12px ${FONT}`; ctx.textAlign = "center";
      ctx.fillText(s > 0 ? `${txt} ${Math.ceil(s)}s` : txt, x + 39, y + 10.5);
    });
    if (rush) {
      ctx.fillStyle = rush.t < 4 ? C.coral : C.ink; circle(W / 2, 42, 27);
      ctx.textAlign = "center"; ctx.fillStyle = "#fff";
      ctx.font = `800 30px ${FONT}`; ctx.fillText(Math.ceil(rush.t), W / 2, 44);
    }
  }
  function drawBanner() {
    const a = banner.hold ? 1 : Math.min(1, banner.t / 0.2, (2.8 - banner.t) / 0.4);
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = `800 22px ${FONT}`;
    const w1 = ctx.measureText(banner.txt).width;
    ctx.font = `600 13px ${FONT}`;
    const w2 = banner.sub ? ctx.measureText(banner.sub).width : 0;
    const w = Math.max(w1, w2) + 36, h = banner.sub ? 58 : 38, x = W / 2 - w / 2, y = banner.hold ? 220 : 84;
    ctx.fillStyle = "rgba(23,80,63,.92)"; rrect(x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `800 22px ${FONT}`; ctx.fillText(banner.txt, W / 2, y + 20);
    if (banner.sub) { ctx.font = `600 13px ${FONT}`; ctx.fillStyle = "#f6e6c8"; ctx.fillText(banner.sub, W / 2, y + 43); }
    ctx.globalAlpha = 1;
  }

  function draw(dt, t) {
    if (!bg) bg = makeBg();
    ctx.drawImage(bg, 0, 0, W, H);
    shoreline(t);
    if (mode === "finale") { drawFinale(dt); drawFx(dt); drawHud(); return; }
    if (rush) drawRush(t);
    items.forEach(item);
    const ents = [];
    for (const v of victims) {
      ents.push({ y: v.y, d: () => drawVictim(v) });
      if (v.type === "shark") { const s = sharkPos(v); ents.push({ y: s.y, d: () => shark(s.x, s.y, s.flip, v.t) }); }
    }
    followers.forEach((L, i) => {
      const p = followerPos(i);
      ents.push({ y: p.y - 0.01, d: () => person(p.x, p.y, L, { flip: p.f, walk: P.moving, t: P.t + i * 0.37 }) });
    });
    ents.push({ y: P.y, d: () => {
      if (P.inv > 0 && mode === "play" && Math.floor(P.inv * 10) % 2) return;
      if (P.board > 0) board(P.x, P.y - 1, 0);
      const wob = P.drunk > 0 ? Math.sin(P.t * 6) * 0.25 : 0;
      person(P.x, P.y - (P.board > 0 ? 3 : 0), ME, { wig: true, bald: P.bald, flip: P.flip, walk: P.moving && P.board <= 0, t: P.t, rot: P.stun > 0 && mode === "play" ? Math.sin(P.t * 30) * 0.2 : wob });
    } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.d());
    if (P.magnet > 0) { ctx.strokeStyle = `rgba(229,96,61,${0.35 + Math.sin(t * 8) * 0.15})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(P.x, P.y - 12, 115, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    if (gull) {
      ctx.fillStyle = "rgba(90,60,30,.2)"; ctx.beginPath(); ctx.ellipse(gull.x, gull.y, 12, 4, 0, 0, 7); ctx.fill();
      if (gull.state === "carry") { ctx.strokeStyle = "rgba(229,96,61,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(gull.x, gull.y, 17, 6, 0, 0, 7); ctx.stroke(); }
      gullSprite(gull.x, gull.y - 75, gull.t, gull.state === "carry");
    }
    if (rush && mode === "play") drawPointer();
    drawFx(dt);
    if (calima > 0) drawCalima();
    if (mode !== "title") drawHud();
    if (banner) drawBanner();
  }

  // ---------- Loop, input, HUD ----------
  let raf = 0, lastT = 0, clock = 0, visible = true;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now; clock += dt;
    if (mode === "play") update(dt);
    else if (mode === "title") victims.forEach(v => moveVictim(v, dt, false));
    draw(dt, clock);
    loop();
  }
  function loop() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; lastT = 0; }

  function hud() {
    $("g-count").textContent = followers.length;
    $("g-score").textContent = num(score);
    $("g-bar").style.width = (followers.length / GOAL * 100) + "%";
  }

  function demo() {
    reset();
    [["buried", 140, 300], ["shark", 520, 240], ["drunk", 210, 460], ["kite", 560, 440]].forEach(([type, x, y]) => {
      victims.push({ type, x, y, L: pending.pop(), t: R(0, 3), prog: 0, alt: 45, ang: R(0, 6.28), vx: 0, vy: 0, turn: 0, wind: 0 });
    });
    items.push({ kind: "mojito", x: 420, y: 330, t: 0 });
    for (let i = 0; i < 3; i++) followers.push(pending.pop());
    for (let i = 0; i < 40; i++) trail.push({ x: P.x + 40 - i * 2.2, y: P.y, f: false });
    trail.reverse();
  }

  function start() {
    reset(); hud(); $("g-time").textContent = "0:00";
    mode = "play"; $("g-start").hidden = true; $("g-end").hidden = true;
    $("stage").classList.add("playing");
    loop();
  }

  const KEYMAP = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "u", w: "u", W: "u", ArrowDown: "d", s: "d", S: "d" };
  window.addEventListener("keydown", e => {
    const k = KEYMAP[e.key]; if (!k || mode !== "play") return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    keys[k] = true; e.preventDefault();
  });
  window.addEventListener("keyup", e => { const k = KEYMAP[e.key]; if (k) keys[k] = false; });
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; ptr = null; });

  const toLocal = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  cv.addEventListener("pointerdown", e => { if (mode !== "play") return; ptr = toLocal(e); try { cv.setPointerCapture(e.pointerId); } catch {} e.preventDefault(); });
  cv.addEventListener("pointermove", e => { if (ptr) ptr = toLocal(e); });
  ["pointerup", "pointercancel"].forEach(n => cv.addEventListener(n, () => { ptr = null; }));

  $("g-play").addEventListener("click", start);
  $("g-again").addEventListener("click", start);
  $("g-rsvp").addEventListener("click", () => { const el = document.getElementById("desk-h"); el && el.scrollIntoView({ behavior: "smooth", block: "center" }); const n = document.getElementById("name"); n && setTimeout(() => n.focus({ preventScroll: true }), 500); });

  // ---------- Hall of Fame (shared scoreboard) ----------
  let fameOK = false;
  async function rpc(fn, args) {
    const r = await fetch(`${API.url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: API.key, "Content-Type": "application/json" }, body: JSON.stringify(args || {}) });
    if (!r.ok) throw new Error("request failed");
    return r.json();
  }
  async function loadFame() {
    try {
      const rows = await rpc("j40_top_scores");
      fameOK = true;
      const ol = $("g-board"); ol.textContent = "";
      rows.forEach(r => {
        const li = document.createElement("li");
        const n = document.createElement("span"); n.className = "fn"; n.textContent = String(r.name).slice(0, 24);
        const s = document.createElement("b"); s.textContent = num(r.score);
        const d = document.createElement("small"); d.textContent = `${r.friends}/40 · ${fmt(r.secs)}`;
        li.append(n, d, s); ol.appendChild(li);
      });
      $("g-fame-empty").hidden = rows.length > 0;
      $("g-fame").hidden = false;
    } catch { fameOK = false; $("g-fame").hidden = true; }
  }
  $("g-save").addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("g-name").value.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!name) { $("g-save-msg").textContent = "Add your name first."; return; }
    if (last.saved) return;
    $("g-save-btn").disabled = true; $("g-save-msg").textContent = "Saving…";
    try {
      await rpc("j40_submit_score", { p_name: name, p_score: last.score, p_friends: last.friends, p_secs: last.secs });
      last.saved = true;
      try { localStorage.setItem("j40-player", name); } catch {}
      $("g-save-msg").textContent = "Saved. Check the Hall of Fame.";
      loadFame();
    } catch { $("g-save-msg").textContent = "Your score wasn't saved. Try again."; $("g-save-btn").disabled = false; }
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else loop(); });
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? loop() : stop(); }).observe(cv);
  window.addEventListener("resize", () => { if (Math.min(2, window.devicePixelRatio || 1) !== dpr) fit(); });

  fit(); demo();
  $("g-count").textContent = "0"; $("g-score").textContent = "0"; $("g-bar").style.width = "0%";
  draw(0, 0); loop(); loadFame();
})();
