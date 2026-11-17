// Rescate en Famara: top-down beach rescue. Save 40 friends; they follow in a conga line; finish at the pool party.
(() => {
  const cv = document.getElementById("game");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const $ = id => document.getElementById(id);
  const W = 720, H = 540, TOP = 172, GOAL = 40, SP = 7;
  const C = { coral: "#e5603d", sea: "#2795a8", sun: "#eea43c", rose: "#df6f8d", ink: "#17503f", water: "#5cbfd3" };
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
    // watercolour clouds
    [[90, 30, "#ef9fb0"], [210, 18, "#f4b678"], [640, 40, "#9fd3d8"]].forEach(([x, y, col]) => {
      g.globalAlpha = 0.35; g.fillStyle = col;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + i * 18, y + (i % 2) * 5, 34, 11, 0, 0, 7); g.fill(); }
    });
    g.globalAlpha = 1;
    // La Graciosa on the horizon
    g.fillStyle = "#c7a39f";
    g.beginPath(); g.moveTo(20, 92); g.quadraticCurveTo(60, 70, 95, 84); g.quadraticCurveTo(130, 66, 175, 92); g.closePath(); g.fill();
    // sea
    gr = g.createLinearGradient(0, 90, 0, TOP);
    gr.addColorStop(0, "#3fa7b9"); gr.addColorStop(1, "#8fd6d4");
    g.fillStyle = gr; g.fillRect(0, 90, W, TOP - 82);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) { const x = R(0, 260), y = R(100, TOP - 30); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 20, y); g.stroke(); }
    // Risco de Famara
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
    // sand
    gr = g.createLinearGradient(0, TOP - 10, 0, H);
    gr.addColorStop(0, "#e9cf9d"); gr.addColorStop(0.15, "#f3dcae"); gr.addColorStop(1, "#efd29e");
    g.fillStyle = gr; g.fillRect(0, TOP - 12, W, H - TOP + 12);
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(150,110,60,${R(.08, .2)})`; g.fillRect(R(0, W), R(TOP, H), 1.4, 1.4); }
    // volcanic rocks and an aloe, like the poster
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

  function wig() {
    ctx.fillStyle = "#f4d774"; ctx.strokeStyle = "#c9a23c"; ctx.lineWidth = 1;
    [[-8, -24], [8, -24], [-9, -30], [9, -30], [-7, -36], [7, -36], [-3, -39], [3, -39], [0, -41]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4.4, 0, 7); ctx.fill(); ctx.stroke(); });
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
  // Feet at (x, y). o: flip, walk, t, armsUp, rot, wig, bottle, noLegs, noShadow, s
  function person(x, y, L, o = {}) {
    const t = o.t || 0;
    if (!o.noShadow) { ctx.fillStyle = "rgba(90,60,30,.18)"; ctx.beginPath(); ctx.ellipse(x, y, 9, 3, 0, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    const s = o.s || 1; ctx.scale(o.flip ? -s : s, s);
    if (!o.noLegs) {
      const k = o.walk ? Math.sin(t * 14) * 2.5 : 0;
      ctx.fillStyle = L.skin; ctx.fillRect(-5, -11 - Math.max(0, k), 4, 11); ctx.fillRect(1, -11 - Math.max(0, -k), 4, 11);
      ctx.fillStyle = L.shorts; ctx.fillRect(-6, -15, 12, 6);
    }
    ctx.fillStyle = L.shirt; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-7, -25, 14, 12, 4) : ctx.rect(-7, -25, 14, 12); ctx.fill();
    ctx.strokeStyle = L.skin; ctx.lineWidth = 3; ctx.lineCap = "round";
    if (o.armsUp) { const w = Math.sin(t * 10) * 2; line(-6, -22, -11 + w, -34); line(6, -22, 11 - w, -34); }
    else { line(-6, -22, -9, -14); line(6, -22, 9, -14); }
    if (o.bottle) { ctx.fillStyle = "#3f8f4e"; ctx.fillRect(8, -21, 4, 8); ctx.fillRect(9, -24, 2, 3); }
    ctx.fillStyle = L.skin; circle(0, -31, 7);
    if (o.wig) { wig(); ctx.fillStyle = L.skin; circle(0, -30, 5.6); shades(); ctx.fillStyle = C.coral; ctx.fillRect(-2, -26, 4, 1.4); }
    else { hairCap(L); ctx.fillStyle = "#22201f"; circle(-2.5, -30.5, 1); circle(2.5, -30.5, 1); }
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
  function badge(x, y, t) {
    const b = Math.sin(t * 6) * 2;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.coral; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y + b, 7, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.coral; ctx.font = "800 11px 'Bricolage Grotesque', Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("!", x, y + b + 0.5);
  }

  // ---------- State ----------
  let mode = "title", P, trail, followers, victims, fx, confetti, time, spawnT, pending, actors, finT, hudT = 0;
  const keys = {}; let ptr = null;

  function reset() {
    P = { x: W / 2, y: 400, stun: 0, inv: 0, flip: false, moving: false, t: 0 };
    trail = []; followers = []; victims = []; fx = []; confetti = []; time = 0; spawnT = 0.4; finT = 0; actors = null;
    pending = Array.from({ length: GOAL }, look);
  }

  const sharkPos = v => ({ x: v.x + Math.cos(v.ang) * 58, y: v.y + Math.sin(v.ang) * 26, flip: Math.sin(v.ang) > 0 });

  function spawn(forced) {
    if (!pending.length) return;
    let types = ["buried", "drunk", "kite", "shark"];
    if (victims.filter(v => v.type === "shark").length >= 2) types = types.filter(t => t !== "shark");
    const type = forced || pick(types);
    let x, y, n = 0;
    do {
      x = R(70, W - 70); y = type === "shark" ? R(TOP + 45, TOP + 120) : R(TOP + 45, H - 30); n++;
    } while (n < 40 && (dist(x, y, P.x, P.y) < 150 || victims.some(v => dist(x, y, v.x, v.y) < 95)));
    victims.push({ type, x, y, L: pending.pop(), t: R(0, 3), prog: 0, alt: 0, ang: R(0, 6.28), vx: 0, vy: 0, turn: 0, wind: R(14, 22) * (Math.random() < .5 ? -1 : 1) });
  }

  function pop(x, y, txt, col) { fx.push({ x, y, txt, col, t: 0 }); }

  function rescue(i) {
    const v = victims[i]; victims.splice(i, 1);
    followers.push(v.L);
    pop(v.x, v.y - 50, "+1", C.coral);
    hud();
    if (followers.length >= GOAL) startFinale();
  }

  function bite() {
    P.stun = 0.9; P.inv = 2.2;
    pop(P.x, P.y - 52, "Ouch!", C.coral);
    const lost = followers.splice(Math.max(0, followers.length - 3));
    if (lost.length) { pending.push(...lost); pop(P.x + 20, P.y - 70, `-${lost.length}`, C.ink); }
    hud();
  }

  function moveVictim(v, dt, live) {
    v.t += dt;
    if (v.type === "shark") v.ang += dt * (1.7 + followers.length * 0.02);
    else if (v.type === "drunk") {
      v.turn -= dt;
      if (v.turn <= 0) { const a = R(0, 6.28), sp = 70 + followers.length; v.vx = Math.cos(a) * sp; v.vy = Math.sin(a) * sp; v.turn = R(0.5, 1.3); }
      v.x += v.vx * dt; v.y += v.vy * dt;
      if (v.x < 40 || v.x > W - 40) v.vx *= -1;
      if (v.y < TOP + 40 || v.y > H - 20) v.vy *= -1;
      v.x = clamp(v.x, 40, W - 40); v.y = clamp(v.y, TOP + 40, H - 20);
      if (Math.random() < dt * 0.5) pop(v.x + 10, v.y - 46, "hic!", C.ink);
    } else if (v.type === "kite") {
      if (live) v.alt += dt * (7 + followers.length * 0.09); else v.alt = 45 + Math.sin(v.t) * 10;
      v.x += v.wind * dt; if (v.x < 50 || v.x > W - 50) { v.wind *= -1; v.x = clamp(v.x, 50, W - 50); }
    }
  }

  function update(dt) {
    P.t += dt; time += dt;
    let dx = 0, dy = 0;
    if (keys.l) dx--; if (keys.r) dx++; if (keys.u) dy--; if (keys.d) dy++;
    if (ptr && !dx && !dy) { const ex = ptr.x - P.x, ey = ptr.y - P.y, d = Math.hypot(ex, ey); if (d > 6) { dx = ex / d; dy = ey / d; } }
    const m = Math.hypot(dx, dy);
    P.moving = false;
    if (P.inv > 0) P.inv -= dt;
    if (P.stun > 0) P.stun -= dt;
    else if (m > 0) { P.x += dx / m * 180 * dt; P.y += dy / m * 180 * dt; P.moving = true; if (Math.abs(dx) > 0.1) P.flip = dx < 0; }
    P.x = clamp(P.x, 16, W - 16); P.y = clamp(P.y, TOP + 20, H - 8);
    const lt = trail[trail.length - 1];
    if (!lt || dist(lt.x, lt.y, P.x, P.y) > 2.2) { trail.push({ x: P.x, y: P.y, f: P.flip }); if (trail.length > GOAL * SP + 20) trail.shift(); }

    for (let i = victims.length - 1; i >= 0; i--) {
      const v = victims[i];
      moveVictim(v, dt, true);
      const near = P.stun <= 0 && dist(P.x, P.y, v.x, v.y) < 26;
      if (v.type === "buried") {
        if (P.stun <= 0 && dist(P.x, P.y, v.x, v.y) < 34) v.prog += dt / 0.9; else v.prog = Math.max(0, v.prog - dt * 0.6);
        if (v.prog >= 1) { rescue(i); if (mode !== "play") return; continue; }
      } else if (v.type === "shark") {
        const s = sharkPos(v);
        if (P.inv <= 0 && dist(P.x, P.y, s.x, s.y - 6) < 24) bite();
        if (near) { rescue(i); if (mode !== "play") return; continue; }
      } else if (v.type === "kite" && v.alt > 125) {
        pop(v.x, v.y - v.alt - 40, "Bye!", C.coral); pending.unshift(v.L); victims.splice(i, 1); continue;
      } else if (near) { rescue(i); if (mode !== "play") return; continue; }
    }

    spawnT -= dt;
    const target = Math.min(6, 2 + Math.floor(followers.length / 8));
    if (spawnT <= 0 && victims.length < target && pending.length) { spawn(); spawnT = R(0.6, 1.4); }

    hudT -= dt; if (hudT <= 0) { $("g-time").textContent = fmt(time); hudT = 0.25; }
  }

  // ---------- Finale: everyone into the pool ----------
  const POOL = { x: 180, y: 250, w: 360, h: 210 };
  function startFinale() {
    mode = "finale"; finT = 0; ptr = null;
    $("stage").classList.remove("playing");
    const slots = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) slots.push({ x: POOL.x + 36 + c * (POOL.w - 72) / 8 + (r % 2) * 8, y: POOL.y + 50 + r * (POOL.h - 75) / 4 });
    const me = slots.splice(22, 1)[0];
    actors = [{ L: ME, me: true, sx: P.x, sy: P.y, ...pos(me), d: 0 }];
    followers.forEach((L, i) => {
      const p = trail[Math.max(0, trail.length - 1 - (i + 1) * SP)] || P;
      actors.push({ L, sx: p.x, sy: p.y, ...pos(slots[i]), d: 0.15 + i * 0.03, ring: i % 5 === 0 ? pick([C.coral, C.rose, C.sun]) : null });
    });
    function pos(s) { return { tx: s.x, ty: s.y }; }
    const best = loadBest(), isBest = !best || time < best;
    if (isBest) saveBest(time);
    $("g-end-txt").textContent = `Everyone made it to the pool in ${fmt(time)}${isBest ? ", your best time yet" : `. Your best is ${fmt(best)}`}. The real pool party is Saturday 12 from 14:00. Wigs and sunnies mandatory.`;
    $("g-time").textContent = fmt(time);
    setTimeout(() => { $("g-end").hidden = false; }, 2600);
  }
  function loadBest() { try { return Number(localStorage.getItem("j40-best")) || 0; } catch { return 0; } }
  function saveBest(v) { try { localStorage.setItem("j40-best", String(v)); } catch {} }

  function drawPool(t) {
    const { x, y, w, h } = POOL;
    ctx.fillStyle = "#f6ecd6"; ctx.fillRect(x - 18, y - 18, w + 36, h + 36);
    ctx.fillStyle = "#bfe3ea"; ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
    ctx.fillStyle = C.water; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const yy = y + 14 + i * 22; ctx.beginPath(); for (let xx = x + 6; xx < x + w - 6; xx += 10) { const k = yy + Math.sin(xx * 0.05 + t * 2 + i) * 2; xx === x + 6 ? ctx.moveTo(xx, k) : ctx.lineTo(xx, k); } ctx.stroke(); }
    ctx.strokeStyle = "#c9cfd2"; ctx.lineWidth = 3; line(x + w - 30, y - 16, x + w - 30, y + 14); line(x + w - 16, y - 16, x + w - 16, y + 14);
    // palms
    [[x - 60, y + 40], [x + w + 60, y + 120]].forEach(([px, py]) => {
      ctx.strokeStyle = "#8a6440"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, py + 70); ctx.quadraticCurveTo(px + 10, py + 30, px, py - 10); ctx.stroke();
      ctx.strokeStyle = "#4f8f4a"; ctx.lineWidth = 5;
      for (let a = 0; a < 6; a++) { const an = a / 6 * Math.PI * 2 + Math.sin(t) * 0.05; ctx.beginPath(); ctx.moveTo(px, py - 10); ctx.quadraticCurveTo(px + Math.cos(an) * 20, py - 24 + Math.sin(an) * 8, px + Math.cos(an) * 34, py - 6 + Math.sin(an) * 14); ctx.stroke(); }
    });
    // banner
    ctx.fillStyle = C.coral; ctx.fillRect(x + w / 2 - 110, y - 52, 220, 30);
    ctx.fillStyle = "#fff"; ctx.font = "800 18px 'Bricolage Grotesque', Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
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
      const py = v.y - v.alt, kx = v.x + 34 * Math.sign(v.wind), ky = py - 82;
      ctx.strokeStyle = "rgba(23,80,63,.6)"; ctx.lineWidth = 1; line(v.x + 10 * Math.sign(v.wind), py - 33, kx, ky + 16);
      person(v.x, py, v.L, { armsUp: true, t, noShadow: true, flip: v.wind < 0 });
      kite(kx, ky, t);
    }
  }

  function drawFx(dt) {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i]; f.t += dt; if (f.t > 1.1) { fx.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - f.t / 1.1; ctx.fillStyle = f.col;
      ctx.font = `800 ${f.txt.length > 3 ? 14 : 18}px 'Bricolage Grotesque', Arial, sans-serif`;
      ctx.fillText(f.txt, f.x, f.y - f.t * 26);
    }
    ctx.globalAlpha = 1;
  }

  function draw(dt, t) {
    if (!bg) bg = makeBg();
    ctx.drawImage(bg, 0, 0, W, H);
    shoreline(t);
    if (mode === "finale") { drawFinale(dt); drawFx(dt); return; }
    const ents = [];
    for (const v of victims) {
      ents.push({ y: v.y, d: () => drawVictim(v) });
      if (v.type === "shark") { const s = sharkPos(v); ents.push({ y: s.y, d: () => shark(s.x, s.y, s.flip, v.t) }); }
    }
    followers.forEach((L, i) => {
      const p = trail[Math.max(0, trail.length - 1 - (i + 1) * SP)] || P;
      ents.push({ y: p.y - 0.01, d: () => person(p.x, p.y, L, { flip: p.f, walk: P.moving, t: P.t + i * 0.37 }) });
    });
    ents.push({ y: P.y, d: () => {
      if (P.inv > 0 && Math.floor(P.inv * 10) % 2) return;
      person(P.x, P.y, ME, { wig: true, flip: P.flip, walk: P.moving, t: P.t, rot: P.stun > 0 ? Math.sin(P.t * 30) * 0.2 : 0 });
    } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.d());
    drawFx(dt);
  }

  // ---------- Loop, input, HUD ----------
  let raf = 0, last = 0, clock = 0, visible = true;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; clock += dt;
    if (mode === "play") update(dt);
    else if (mode === "title") victims.forEach(v => moveVictim(v, dt, false));
    draw(dt, clock);
    loop();
  }
  function loop() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; }

  function hud() {
    $("g-count").textContent = followers.length;
    $("g-bar").style.width = (followers.length / GOAL * 100) + "%";
  }

  function demo() {
    reset();
    [["buried", 140, 300], ["shark", 520, 240], ["drunk", 210, 460], ["kite", 560, 440]].forEach(([type, x, y]) => {
      victims.push({ type, x, y, L: pending.pop(), t: R(0, 3), prog: 0, alt: 45, ang: R(0, 6.28), vx: 0, vy: 0, turn: 0, wind: 0 });
    });
    for (let i = 0; i < 3; i++) { followers.push(pending.pop()); }
    for (let i = 0; i < 40; i++) trail.push({ x: P.x + 40 - i * 2.2, y: P.y, f: false });
    trail.reverse(); P.flip = false;
  }

  function start() {
    reset(); hud(); $("g-time").textContent = "0:00";
    mode = "play"; $("g-start").hidden = true; $("g-end").hidden = true;
    $("stage").classList.add("playing");
    cv.focus && cv.focus({ preventScroll: true });
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

  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else loop(); });
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? loop() : stop(); }).observe(cv);
  window.addEventListener("resize", () => { if (Math.min(2, window.devicePixelRatio || 1) !== dpr) fit(); });

  fit(); demo(); hud(); $("g-count").textContent = "0"; $("g-bar").style.width = "0%";
  draw(0, 0); loop();
})();
