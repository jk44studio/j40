// Rescate en Famara: a one-thumb surf runner. Tap anywhere to jump, hold to go higher, tap again in the air to double-jump.
// Jorge rides the wave at Famara, picks up friends who join his party wave, and takes all 40 to the pool party.
(() => {
  const cv = document.getElementById("game");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const $ = id => document.getElementById(id);
  const W = 640, H = 480, SURF = 318, PX = 190, SPC = 15, GOAL = 40, LIVES = 3, S = 1.35, FS = 1.12;
  const GRAV = 2100, JUMP = 660, JUMP2 = 590;
  const API = { url: "https://emjykorcvgukiaxpyunn.supabase.co", key: "sb_publishable_NSJwJP-j-lXmj-bHx2yR4A_kPyQQnGV" };
  const C = { coral: "#e5603d", sea: "#2795a8", sun: "#eea43c", rose: "#df6f8d", ink: "#17503f", water: "#5cbfd3" };
  const FONT = "'Bricolage Grotesque', Arial, sans-serif";
  const SKIN = ["#f3cfae", "#e0a982", "#b97c55", "#8a5a3c", "#f7dcc4"];
  const HAIR = ["#2b1d16", "#6b3e22", "#d9a441", "#141414", "#a8452c", "#9b9b9b", "#e7c27a"];
  const SHIRT = [C.coral, C.sea, C.sun, C.rose, "#79bf9f", "#8d6cc6", "#ffffff", "#3d6fb5"];
  const SHORTS = ["#17503f", "#2e3a59", "#c9b48a", "#e5603d", "#6a4c93"];
  const BOARDS = ["#fff3c4", "#bfe8ef", "#ffd0dc", "#d9f0c4", "#ffe0b0"];
  const ME = { skin: "#f1c9a5", shirt: "#ffffff", shorts: C.sea, hair: "#f4d774", board: "#ffe066" };

  const R = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const dist2 = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const look = () => ({ skin: pick(SKIN), hair: pick(HAIR), shirt: pick(SHIRT), shorts: pick(SHORTS), long: Math.random() < 0.45, board: pick(BOARDS) });
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const num = n => Math.floor(n).toLocaleString("es-ES");

  let dpr = 1, bg = null;
  function fit() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bg = null;
  }

  // ---------- Static background: sky, sun, La Graciosa, Risco de Famara, far sea ----------
  function makeBg() {
    const c = document.createElement("canvas"); c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext("2d"); g.scale(dpr, dpr);
    let gr = g.createLinearGradient(0, 0, 0, 200);
    gr.addColorStop(0, "#f6cdb8"); gr.addColorStop(0.6, "#fbe3cf"); gr.addColorStop(1, "#fdf0e2");
    g.fillStyle = gr; g.fillRect(0, 0, W, 200);
    g.fillStyle = "rgba(246,180,90,.55)"; g.beginPath(); g.arc(470, 120, 34, 0, 7); g.fill();
    g.fillStyle = "rgba(255,226,150,.9)"; g.beginPath(); g.arc(470, 120, 22, 0, 7); g.fill();
    [[80, 46, "#ef9fb0"], [250, 30, "#f4b678"], [560, 60, "#9fd3d8"]].forEach(([x, y, col]) => {
      g.globalAlpha = 0.35; g.fillStyle = col;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + i * 18, y + (i % 2) * 5, 34, 11, 0, 0, 7); g.fill(); }
    });
    g.globalAlpha = 1;
    g.fillStyle = "#c9a8a3";
    g.beginPath(); g.moveTo(40, 198); g.quadraticCurveTo(80, 176, 115, 190); g.quadraticCurveTo(150, 172, 195, 198); g.closePath(); g.fill();
    gr = g.createLinearGradient(0, 70, 0, 200);
    gr.addColorStop(0, "#9a6a63"); gr.addColorStop(0.6, "#b07b5f"); gr.addColorStop(1, "#7b5a62");
    g.fillStyle = gr;
    const ridge = [[250, 200], [300, 178], [330, 140], [360, 118], [400, 104], [450, 96], [500, 88], [545, 92], [590, 82], [640, 86], [640, 200]];
    g.beginPath(); ridge.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
    g.save(); g.clip();
    g.strokeStyle = "rgba(255,230,200,.18)"; g.lineWidth = 2;
    for (let y = 90; y < 200; y += 8) { g.beginPath(); g.moveTo(250, y + 4); for (let x = 250; x <= 640; x += 40) g.lineTo(x, y + Math.sin(x * 0.02 + y) * 2); g.stroke(); }
    g.strokeStyle = "rgba(60,40,50,.22)";
    for (let x = 340; x < 640; x += 20) { g.beginPath(); g.moveTo(x, 80); g.lineTo(x - 14, 200); g.stroke(); }
    g.restore();
    gr = g.createLinearGradient(0, 198, 0, H);
    gr.addColorStop(0, "#7cc9cf"); gr.addColorStop(1, "#3c9fb3");
    g.fillStyle = gr; g.fillRect(0, 198, W, H - 198);
    return c;
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
  // Feet at (x, y). o: s, flip, t, armsUp, surf, rot, wig, bottle, noLegs
  function person(x, y, L, o = {}) {
    const t = o.t || 0, s = o.s || 1;
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    ctx.scale(o.flip ? -s : s, s);
    if (!o.noLegs) {
      ctx.fillStyle = L.skin;
      if (o.surf) { ctx.fillRect(-7, -11, 4, 11); ctx.fillRect(3, -11, 4, 11); }
      else { ctx.fillRect(-5, -11, 4, 11); ctx.fillRect(1, -11, 4, 11); }
      ctx.fillStyle = L.shorts; ctx.fillRect(-7, -15, 14, 6);
    }
    ctx.fillStyle = L.shirt; rrect(-7, -25, 14, 12, 4); ctx.fill();
    ctx.strokeStyle = L.skin; ctx.lineWidth = 3; ctx.lineCap = "round";
    if (o.armsUp) { const w = Math.sin(t * 10) * 2; line(-6, -22, -11 + w, -34); line(6, -22, 11 - w, -34); }
    else if (o.surf) { line(-6, -22, -14, -19); line(6, -22, 14, -25); }
    else { line(-6, -22, -9, -14); line(6, -22, 9, -14); }
    if (o.bottle) { ctx.fillStyle = "#3f8f4e"; ctx.fillRect(-15, -27, 4, 8); ctx.fillRect(-14, -30, 2, 3); }
    ctx.fillStyle = L.skin; circle(0, -31, 7);
    if (o.wig) { curls(); ctx.fillStyle = L.skin; circle(0, -30, 5.6); shades(); ctx.fillStyle = C.coral; ctx.fillRect(-2, -26, 4, 1.4); }
    else { hairCap(L); ctx.fillStyle = "#22201f"; circle(-2.5, -30.5, 1); circle(2.5, -30.5, 1); }
    ctx.restore();
  }
  function surfboard(x, y, col, s = 1, rot = 0, len = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * len, s);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 17, 3.6, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(23,80,63,.45)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = C.coral; ctx.lineWidth = 1.4; line(-14, 0, 14, 0);
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
  function gullSprite(x, y, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(-1.2, 1.2);
    const f = Math.sin(t * 14) * 9;
    ctx.strokeStyle = "#8b98a3"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(-12, -8 - f, -22, -2 - f); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, 0); ctx.quadraticCurveTo(12, -8 - f, 22, -2 - f); ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, 7); ctx.fill();
    circle(7, -3, 4);
    ctx.fillStyle = "#f2b33d"; ctx.beginPath(); ctx.moveTo(10, -3); ctx.lineTo(16, -2); ctx.lineTo(10, -1); ctx.fill();
    ctx.fillStyle = "#1d2a30"; circle(8, -4, 1);
    ctx.restore();
  }
  function fin(x, y, t) {
    ctx.fillStyle = "rgba(30,60,80,.28)"; ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 26, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#6f8396";
    ctx.beginPath(); ctx.moveTo(x - 12, y + 2); ctx.quadraticCurveTo(x - 4, y - 14, x + 4, y - 26); ctx.quadraticCurveTo(x + 6, y - 10, x + 14, y + 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x - 14, y + 2, 6 + Math.sin(t * 9) * 1.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  function rock(x, y) {
    ctx.fillStyle = "#4b3f45";
    ctx.beginPath(); ctx.moveTo(x - 22, y + 6); ctx.lineTo(x - 18, y - 10); ctx.lineTo(x - 8, y - 22); ctx.lineTo(x + 4, y - 18); ctx.lineTo(x + 14, y - 26); ctx.lineTo(x + 22, y - 8); ctx.lineTo(x + 24, y + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.beginPath(); ctx.moveTo(x - 8, y - 22); ctx.lineTo(x + 2, y - 16); ctx.lineTo(x - 10, y - 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.ellipse(x, y + 5, 28, 4, 0, 0, 7); ctx.fill();
  }
  function donut(x, y, col) {
    ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y, 14, 5, 0, 0, 7); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x - 3, y - 2, 10, 2.5, 0, Math.PI, Math.PI * 1.6); ctx.stroke();
  }
  function flamingo(x, y, t) {
    ctx.fillStyle = "#f28bb0";
    ctx.beginPath(); ctx.ellipse(x, y - 4, 20, 8, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "#f28bb0"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x + 14, y - 8); ctx.quadraticCurveTo(x + 24, y - 22, x + 18, y - 32); ctx.stroke();
    ctx.fillStyle = "#f28bb0"; circle(x + 18, y - 34, 5);
    ctx.fillStyle = "#2b2b2b"; ctx.beginPath(); ctx.moveTo(x + 22, y - 34); ctx.lineTo(x + 28, y - 31); ctx.lineTo(x + 22, y - 31); ctx.fill();
  }
  function pickup(kind, x, y, t) {
    ctx.strokeStyle = `rgba(255,255,255,${0.55 + Math.sin(t * 6) * 0.3})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, 17, 0, 7); ctx.stroke();
    if (kind === "star") {
      surfboard(x, y, "#ffd34d", 0.9, -0.6);
      ctx.fillStyle = "#fff"; for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; circle(x + Math.cos(a) * 13, y + Math.sin(a) * 13, 1.8); }
    } else if (kind === "mojo") {
      ctx.fillStyle = "#8a5a3c"; ctx.beginPath(); ctx.ellipse(x, y + 3, 12, 5, 0, 0, Math.PI); ctx.fill(); ctx.fillRect(x - 12, y, 24, 3);
      ctx.fillStyle = "#e8c66a"; [[-6, -1], [0, -3], [6, -1], [-3, 1], [4, 1]].forEach(([a, c]) => circle(x + a, y + c, 3));
      ctx.fillStyle = "#c2321e"; circle(x - 2, y - 3, 1.6); circle(x + 4, y - 1, 1.6); circle(x - 6, y, 1.3);
    } else if (kind === "mojito") {
      ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.moveTo(x - 7, y - 10); ctx.lineTo(x + 7, y - 10); ctx.lineTo(x + 5, y + 8); ctx.lineTo(x - 5, y + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#b9e07a"; ctx.beginPath(); ctx.moveTo(x - 6, y - 4); ctx.lineTo(x + 6, y - 4); ctx.lineTo(x + 5, y + 8); ctx.lineTo(x - 5, y + 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#3f8f4e"; ctx.beginPath(); ctx.ellipse(x - 3, y - 8, 4, 2, -0.6, 0, 7); ctx.fill();
      ctx.strokeStyle = C.coral; ctx.lineWidth = 1.6; line(x + 2, y - 4, x + 7, y - 15);
    } else if (kind === "wig") curls(x, y + 30, 0.8);
  }

  function qbox(x, y, open, t, bump) {
    const b = bump > 0 ? Math.sin(bump / 0.25 * Math.PI) * 9 : 0;
    y -= b;
    ctx.fillStyle = open ? "#b88b5c" : C.sun; rrect(x - 14, y - 14, 28, 28, 4); ctx.fill();
    ctx.strokeStyle = "#7a4b22"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#7a4b22"; [[-9, -9], [9, -9], [-9, 9], [9, 9]].forEach(([a, c]) => circle(x + a, y + c, 1.6));
    if (!open) {
      ctx.fillStyle = "#fff"; ctx.font = `800 19px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("?", x, y + 1 + Math.sin(t * 5) * 1.2);
      ctx.strokeStyle = `rgba(255,255,255,${0.35 + Math.sin(t * 6) * 0.25})`; ctx.lineWidth = 2; rrect(x - 18, y - 18, 36, 36, 6); ctx.stroke();
    }
  }
  function whitewater(x, y, w, t) {
    ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.ellipse(x, y + 4, w / 2 + 6, 9, 0, 0, 7); ctx.fill();
    const n = Math.max(4, Math.round(w / 12));
    ctx.fillStyle = "rgba(255,255,255,.97)";
    for (let i = 0; i <= n; i++) {
      const xx = x - w / 2 + i * w / n, k = Math.sin(i / n * Math.PI);
      circle(xx, y - 4 - k * 10 + Math.sin(t * 9 + i * 1.7) * 2.5, 6 + k * 5 + (i % 2) * 2);
    }
    ctx.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < 5; i++) circle(x - w / 3 + ((t * 60 + i * 37) % (w * 0.66)), y - 22 - ((t * 80 + i * 23) % 18), 2);
  }
  function medusa(x, y, t) {
    ctx.strokeStyle = "rgba(214,104,160,.8)"; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 4, y + 2); for (let k = 1; k <= 4; k++) ctx.lineTo(x + i * 4 + Math.sin(t * 6 + k + i) * 3, y + 2 + k * 6); ctx.stroke(); }
    ctx.fillStyle = "rgba(240,140,190,.85)"; ctx.beginPath(); ctx.arc(x, y + 2, 13, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(x - 4, y - 5, 4, 2.5, -0.5, 0, 7); ctx.fill();
  }

  // ---------- State ----------
  let mode = "title", clock = 0, time, dist, speed, py, vy, held, holdT, jumps, spin, spinning, inv, lives, score, combo, comboT;
  let followers, hist, ents, fx, falls, gap, banner, star, magnet, mojito, calima, calimaT, arrive, actors, finT, confetti, seen, splash;
  let longb = 0, set = null, setT = 0, sw = 1, flipA = 0, sets = 0;

  const surfY = x => SURF + Math.sin((x + dist) * 0.018) * 5 * sw + Math.sin(clock * 1.7 + x * 0.01) * 2.5 * sw;
  const MX = () => Math.cos(flipA); // 1 = normal, -1 = surfing the other way
  const airborne = () => py < surfY(PX) - 1;

  function reset() {
    time = 0; dist = 0; speed = 250; py = SURF; vy = 0; held = false; holdT = 0; jumps = 0; spin = 0; spinning = false; inv = 0;
    lives = LIVES; score = 0; combo = 0; comboT = 0;
    followers = []; hist = []; ents = []; fx = []; falls = []; splash = []; gap = 300; banner = null;
    star = 0; magnet = 0; mojito = 0; calima = 0; calimaT = R(20, 28); arrive = 0; actors = null; finT = 0; confetti = []; seen = {};
    longb = 0; set = null; setT = 26; sw = 1; flipA = 0; sets = 0; sents = []; shist = []; flash = 0;
    py = surfY(PX);
  }

  function heightAt(d) {
    // binary search in the ride history for the height above the water at distance d
    let lo = 0, hi = hist.length - 1;
    if (hi < 0 || d <= hist[0].d) return hist.length ? hist[0].h : 0;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (hist[m].d <= d) lo = m; else hi = m - 1; }
    const a = hist[lo], b = hist[lo + 1];
    if (!b) return a.h;
    return a.h + (b.h - a.h) * ((d - a.d) / ((b.d - a.d) || 1));
  }
  const fx_ = i => set ? JX + (i + 1) * SSP : PX - (i + 1) * SPC;
  const fy_ = i => set ? yAtS(sd - (i + 1) * SSP) : surfY(fx_(i)) - heightAt(dist - (i + 1) * SPC);
  // ---- set-wave mode: Jorge rides across the face of a big wave, right to left ----
  const JX = 400, FT = 150, FB = 410, SSP = 17;
  let sy = 330, sv = 0, sd = 0, sspd = 300, shist = [], sents = [], sgap = 0, sair = false, flash = 0;
  function yAtS(d) {
    let lo = 0, hi = shist.length - 1;
    if (hi < 0) return sy;
    if (d <= shist[0].d) return shist[0].y;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (shist[m].d <= d) lo = m; else hi = m - 1; }
    const a = shist[lo], b = shist[lo + 1];
    if (!b) return a.y;
    return a.y + (b.y - a.y) * ((d - a.d) / ((b.d - a.d) || 1));
  }
  const lipY = (x, t) => FT - 22 - (x / W) * 34 + Math.sin(x * 0.03 + t * 2) * 4 + Math.sin(x * 0.011 - t) * 5;

  function say(txt, sub, key) { banner = { txt, sub: key && seen[key] ? "" : sub, t: 0 }; if (key) seen[key] = true; }
  function pop(x, y, txt, col) { fx.push({ x: clamp(x, 70, W - 70), y, txt, col, t: 0 }); }
  function burst(x, y, n, col) { for (let i = 0; i < n; i++) splash.push({ x, y, vx: R(-120, 120), vy: R(-260, -80), t: 0, c: col || "#fff" }); }

  // ---------- Input ----------
  function press() {
    if (mode !== "play") return;
    held = true;
    if (set) return;
    const boost = mojito > 0 ? R(0.65, 1.3) : 1;
    if (!airborne()) { vy = -JUMP * boost; holdT = 0.2; jumps = 1; burst(PX - 6, surfY(PX), 6); }
    else if (jumps < 2) { vy = -JUMP2 * boost; holdT = 0.1; jumps = 2; spinning = true; spin = 0; }
  }
  function release() { held = false; }

  // ---------- Level generator ----------
  function add(o) { ents.push(Object.assign({ t: R(0, 3), vx: 0 }, o)); }
  const friend = (x, k, extra) => add(Object.assign({ k, x, L: look(), hy: 0, ring: pick([C.coral, C.sun, C.rose]) }, extra || {}));

  function pattern() {
    const n = followers.length, x = W + 40;
    if (set) return setPattern(x, n);
    const P = [["float", 4], ["row", 3], ["arc", 3], ["rock", 3], ["flamingo", 2], ["item", 1], ["box", 2]];
    if (n >= 6) P.push(["boxRock", 2]);
    if (n >= 18) P.push(["medusa", 3], ["medusaPair", Math.min(3, (n - 14) / 4)]);
    if (n >= 3) P.push(["shark", 3], ["kiteRock", 2]);
    if (n >= 8) P.push(["gullFloat", 3], ["sharkArc", 2]);
    if (n >= 16) P.push(["double", 2], ["shark", 2], ["gullShark", 2]);
    if (n >= 26) P.push(["sharkPack", 2]);
    let r = Math.random() * P.reduce((a, p) => a + p[1], 0), name = P[0][0];
    for (const [k, w] of P) { r -= w; if (r <= 0) { name = k; break; } }
    const sharkV = 70 + n * 2.2;
    switch (name) {
      case "float": friend(x, "float"); return 0;
      case "row": for (let i = 0; i < 3; i++) friend(x + i * 42, "float"); return 84;
      case "arc": [55, 100, 120, 100, 55].forEach((h, i) => friend(x + i * 40, "air", { hy: h })); return 160;
      case "rock": add({ k: "rock", x }); return 0;
      case "flamingo": friend(x, "flamingo"); return 0;
      case "item": {
        const kinds = ["star", "star", "mojo", "mojo", "mojito", "mojito", "mojito"];
        if (lives < LIVES) kinds.push("wig", "wig");
        add({ k: "item", kind: pick(kinds), x, hy: R(50, 130) }); return 0;
      }
      case "shark": add({ k: "shark", x, vx: sharkV }); return 0;
      case "kiteRock": add({ k: "rock", x }); friend(x + 6, "kite", { hy: R(150, 175) }); return 20;
      case "gullFloat": add({ k: "gull", x, hy: R(85, 105), vx: 110 }); friend(x + 40, "float"); friend(x + 85, "float"); return 90;
      case "sharkArc": add({ k: "shark", x: x + 60, vx: 0 }); [70, 110, 70].forEach((h, i) => friend(x + 20 + i * 40, "air", { hy: h })); return 120;
      case "double": add({ k: "rock", x }); friend(x + 85, "air", { hy: 80 }); add({ k: "rock", x: x + 170 }); return 170;
      case "gullShark": add({ k: "shark", x, vx: sharkV }); add({ k: "gull", x: x + 140, hy: R(95, 120), vx: 100 }); return 150;
      case "box": add({ k: "box", x, hy: R(128, 142) }); return 0;
      case "boxRock": add({ k: "rock", x }); add({ k: "box", x: x + 4, hy: R(132, 145) }); return 10;
      case "medusa": add({ k: "medusa", x, hy: R(45, 70) }); friend(x + 70, "float"); return 70;
      case "medusaPair": add({ k: "medusa", x, hy: 50 }); add({ k: "medusa", x: x + 110, hy: 90, t: 1.4 }); return 110;
      case "sharkPack": add({ k: "shark", x, vx: sharkV }); add({ k: "shark", x: x + 120, vx: sharkV }); friend(x + 60, "air", { hy: 95 }); return 130;
    }
    return 0;
  }

  function setPattern(x, n) {
    const P = [["foam", 4], ["foamArc", 3], ["float", 2], ["box", 1], ["foamPair", n >= 15 ? 2 : 0.5]];
    let r = Math.random() * P.reduce((a, p) => a + p[1], 0), name = P[0][0];
    for (const [k, w] of P) { r -= w; if (r <= 0) { name = k; break; } }
    const fv = 40 + n * 1.2;
    switch (name) {
      case "foam": add({ k: "foam", x, w: R(60, 100), vx: fv }); return 50;
      case "foamArc": { const w = R(70, 100); add({ k: "foam", x: x + 50, w, vx: fv }); [70, 105, 70].forEach((h, i) => friend(x + 10 + i * 40, "air", { hy: h, vx: fv })); return 100; }
      case "float": friend(x, "float"); friend(x + 40, "float"); return 40;
      case "box": add({ k: "box", x, hy: R(128, 142) }); return 0;
      case "foamPair": add({ k: "foam", x, w: 70, vx: fv }); add({ k: "foam", x: x + 190, w: 80, vx: fv }); return 190;
    }
    return 0;
  }
  function startSet() {
    sets++;
    set = { t: 13 + Math.min(4, sets) };
    ents = []; sents = []; shist = []; sd = 0; sy = 330; sv = 0; sgap = 1.3; sair = false; spin = 0; spinning = false; flash = 0.9; calima = 0;
    say("¡SERIE!", "Cruise it: hold to climb, let go to drop. Launch off the lip for the sparkles!", "set");
  }
  function endSet(bonus = true) {
    set = null; flash = 0.7; sents = [];
    if (bonus) { score += 500; say("Set survived! +500", "", null); }
    setT = Math.max(20, R(32, 42) - time * 0.04);
    gap = Math.max(gap, speed * 1.2);
    py = surfY(PX); vy = 0; jumps = 0;
  }
  function spawnSet() {
    const r = Math.random();
    const recentWall = sents.some(e => e.k === "wall" && e.x < 220);
    if (!recentWall && set.age > 2 && Math.random() < 0.3) {
      // a white-water section closing the top or the bottom of the face: carve around it
      const cover = Math.min(0.5, 0.4 + sets * 0.02), face = FB - FT;
      if (Math.random() < 0.5) { const top = FB - cover * face; sents.push({ k: "wall", x: -40, gy: (FT - 60 + top) / 2, gh: top - (FT - 60), t: 0 }); }
      else { const bot = FT + cover * face; sents.push({ k: "wall", x: -40, gy: (bot + FB + 60) / 2, gh: FB + 60 - bot, t: 0 }); }
      sgap = R(0.9, 1.2);
      return;
    }
    if (r < 0.5) {
      const base = R(FT + 20, FB - 40), slope = R(-34, 34);
      for (let i = 0; i < 3; i++) sents.push({ k: "sf", x: -40 - i * 44, y: clamp(base + i * slope, FT + 10, FB), L: look(), t: R(0, 3) });
      sgap = R(0.8, 1.1);
    } else if (r < 0.8) {
      // sparkles above the lip: only reachable by launching an air
      for (let i = 0; i < 3; i++) sents.push({ k: "sp", x: -30 - i * 34, y: FT - 30 - Math.sin((i + 0.5) / 3 * Math.PI) * 26, t: R(0, 3) });
      sgap = R(0.9, 1.2);
    } else {
      sents.push({ k: "ball", x: -30, y: R(FT + 40, FB - 20), vy: R(-150, 150), t: 0 });
      sgap = R(0.9, 1.2);
    }
  }
  function updateSet(dt) {
    set.t -= dt; set.age = (set.age || 0) + dt;
    const k = (sy - FT) / (FB - FT);
    sspd = (255 + k * 115 + followers.length * 1.4 + sets * 8) * (longb > 0 ? 0.8 : 1);
    sd += sspd * dt; dist += speed * dt; score += sspd * dt / 10;
    if (sair) { sv += 1500 * dt; spin += dt * 7; }
    else { sv += (held ? -1050 : 900) * dt; sv = clamp(sv, -360, 360); }
    sy += sv * dt;
    if (sy > FB) { if (sv > 200) { score += 50; pop(JX, FB - 70, "Bottom turn! +50", C.sea); burst(JX, FB, 8); } sy = FB; sv = -Math.abs(sv) * 0.3; }
    if (!sair && sy < FT) {
      if (sv < -200) { sair = true; sv = -380; spin = 0; score += 150; pop(JX, FT - 80, "Off the lip! +150", C.sun); burst(JX, FT, 12); }
      else { sy = FT; sv = Math.abs(sv) * 0.25; }
    }
    if (sair && sy >= FT && sv > 0) { sair = false; const full = spin > Math.PI * 1.5; spin = 0; sv = 180; burst(JX, FT, 6); if (full) { score += 100; pop(JX, FT - 60, "Spin! +100", C.coral); } }
    shist.push({ d: sd, y: sy });
    while (shist.length > 2 && shist[1].d < sd - (GOAL + 2) * SSP) shist.shift();
    hist.push({ d: dist, h: 0 });
    while (hist.length > 2 && hist[1].d < dist - (GOAL + 2) * SPC) hist.shift();

    if (set.t > 1.6 && (sgap -= dt) <= 0) spawnSet();
    const cy = sy - 22;
    for (const e of sents) {
      e.t += dt; e.x += sspd * dt;
      if (e.k === "ball") { e.y += e.vy * dt; if (e.y < FT + 10 || e.y > FB) { e.vy *= -1; e.y = clamp(e.y, FT + 10, FB); } }
      if (e.dead) continue;
      if (e.k === "sf") {
        if (dist2(JX, cy, e.x, e.y - 14) < 30 || (magnet > 0 && Math.abs(e.x - JX) < 30)) { e.dead = true; addFriend(e.L, e.x, e.y - 14, 100); if (mode !== "play") return; }
      } else if (e.k === "sp") {
        if (dist2(JX, cy, e.x, e.y) < 30) { e.dead = true; score += 100 * (combo > 1 ? combo : 1); pop(e.x, e.y - 20, "+100", C.sun); burst(e.x, e.y, 6, "#ffe58a"); }
      } else if (e.k === "wall") {
        if (!e.hit && Math.abs(e.x - JX) < 24 && Math.abs(cy - e.gy) > e.gh / 2 - 6) {
          if (star > 0) { e.dead = true; score += 75; pop(JX, cy - 40, "SMASH +75", C.coral); burst(e.x, cy, 14); }
          else if (inv <= 0) { e.hit = true; say("White water!", "Carve around the foam: hold to go up, let go to go down.", "wall"); hurt("Wiped!"); if (mode !== "play") return; }
        }
        if (!e.passed && e.x > JX + 20) { e.passed = true; if (!e.hit) { score += 75; pop(JX, cy - 50, "Clean! +75", C.sea); } }
      } else if (e.k === "ball") {
        if (!e.hit && dist2(JX, cy, e.x, e.y - 10) < 26) {
          if (star > 0) { e.dead = true; burst(e.x, e.y, 10); }
          else { e.hit = true; combo = 0; comboT = 0; sv += 160; pop(JX, cy - 40, "Splash!", C.sea); burst(e.x, e.y, 8); wipe(Math.max(0, followers.length - 2), JX + 40); }
        }
      }
    }
    sents = sents.filter(e => !e.dead && e.x < W + 120);
    if (arrive || set.t <= 0) endSet(!arrive);
  }
  function openBox(e) {
    e.open = true; e.bump = 0.25; score += 50; burst(e.x, e.y - 10, 12, "#ffe58a");
    const opts = [["friends", 5], ["long", 3], ["star", 2], ["mojo", 2], ["mojito", 2], ["flock", 2]];
    if (lives < LIVES) opts.push(["wig", 3]);
    let r = Math.random() * opts.reduce((a, o) => a + o[1], 0), what = opts[0][0];
    for (const [k, w] of opts) { r -= w; if (r <= 0) { what = k; break; } }
    if (what === "friends") {
      const k = 2 + (Math.random() < 0.4 ? 1 : 0);
      for (let i = 0; i < k; i++) addFriend(look(), e.x, e.y - 20 - i * 18, 100);
      pop(e.x, e.y - 70, `¡${k} amigos!`, C.coral);
    } else if (what === "long") { longb = 9; say("¡Longboard!", "Cruising: slower, and friends score double.", "long"); }
    else if (what === "flock") {
      for (let i = 0; i < 3; i++) add({ k: "gull", x: W + 60 + i * 80, hy: R(85, 120), vx: 90 });
      say("¡Gaviotas!", "A whole flock is coming. Stay low!", "flock");
    } else useItem({ kind: what, x: e.x, cy: e.y - 20 });
  }

  // ---------- Rules ----------
  function collect(e) {
    e.dead = true;
    addFriend(e.L, e.x, e.cy, e.k === "kite" ? 250 : 100);
  }
  function addFriend(L, x, y, base) {
    if (followers.length >= GOAL) return;
    followers.push(L);
    combo = comboT > 0 ? Math.min(5, combo + 1) : 1; comboT = 2.4;
    const mult = (set ? 2 : 1) * (longb > 0 ? 2 : 1);
    const pts = base * combo * mult; score += pts;
    pop(x, y - 30, `+${pts}`, C.coral);
    if (combo > 1) pop(x, y - 52, `x${combo}`, C.ink);
    hud();
    if (followers.length >= GOAL && !arrive) { arrive = 2.6; say("¡40 amigos!", "Pool party ahead!", null); }
  }
  function wipe(from, msgX) {
    const lost = followers.splice(from);
    lost.forEach((L, j) => { const i = from + j, x = fx_(i); if (x > -20) falls.push({ L, x, y: fy_(i), vx: R(-60, 40), vy: R(-280, -160), r: 0, t: 0 }); });
    if (lost.length) pop(msgX, SURF - 90, `-${lost.length} friends`, C.ink);
    hud();
    return lost.length;
  }
  function hurt(msg) {
    lives--; inv = 1.6; combo = 0; comboT = 0;
    const hx = set ? JX : PX, hy = set ? sy : py;
    burst(hx, hy - 20, 12, "#fff");
    pop(hx + 10, hy - 70, msg, C.coral);
    wipe(Math.max(0, followers.length - 3), PX - 40);
    hud();
    if (lives <= 0) gameOver();
  }
  function useItem(e) {
    e.dead = true; score += 50; burst(e.x, e.cy, 10, "#ffe58a");
    if (e.kind === "star") { star = 5; mojito = 0; say("Party Wave!", "Unstoppable for 5 seconds. Smash everything.", "star"); }
    else if (e.kind === "mojo") { magnet = 6; say("¡Papas con mojo!", "Friend magnet for 6 seconds.", "mojo"); }
    else if (e.kind === "mojito") { mojito = 5; say("¡Mojito!", "Wobbly jumps and a spinning head.", "mojito"); }
    else if (e.kind === "wig") { lives = Math.min(LIVES, lives + 1); say("Spare wig!", "+1 wig", "wig"); }
    hud();
  }

  function update(dt) {
    time += dt;
    const target = Math.min(580, 250 + time * 2.4 + followers.length * 3.5) + (set ? 50 : 0);
    speed = target * (star > 0 ? 1.25 : 1) * (longb > 0 ? 0.68 : 1);
    longb = Math.max(0, longb - dt);
    if (banner && (banner.t += dt) > 2.6) banner = null;
    if (flash > 0) flash -= dt;
    for (const k of ["inv", "star", "magnet", "mojito"]) { if (k === "inv") inv = Math.max(0, inv - dt); }
    star = Math.max(0, star - dt); magnet = Math.max(0, magnet - dt); mojito = Math.max(0, mojito - dt);
    if ((comboT -= dt) <= 0) combo = 0;
    if (set) {
      updateSet(dt);
      if (mode !== "play") return;
      for (let i = falls.length - 1; i >= 0; i--) { const f = falls[i]; f.t += dt; f.vy += GRAV * 0.7 * dt; f.x += (f.vx + sspd * 0.4) * dt; f.y += f.vy * dt; f.r += dt * 9; if (f.y > H + 40) falls.splice(i, 1); }
      stepSplash(dt);
      if (hudTick(dt)) $("g-time").textContent = fmt(time);
      if (arrive && (arrive -= dt) <= 0) startFinale();
      return;
    }
    dist += speed * dt;
    score += speed * dt / 10;

    // Jorge's physics
    const g = held && holdT > 0 && vy < 0 ? GRAV * 0.42 : GRAV;
    if (held && holdT > 0) holdT -= dt;
    vy += g * dt; py += vy * dt;
    if (spinning) { spin += dt * 14; if (spin >= Math.PI * 2) { spinning = false; spin = 0; score += 100; pop(PX, py - 70, "Flip! +100", C.sun); } }
    const s0 = surfY(PX);
    if (py >= s0) {
      if (vy > 300) burst(PX, s0, 8);
      if (spinning) { spinning = false; spin = 0; pop(PX, s0 - 70, "Sketchy!", C.ink); }
      py = s0; vy = 0; jumps = 0;
    }
    if (py < 40) { py = 40; vy = Math.max(vy, 0); }
    hist.push({ d: dist, h: surfY(PX) - py });
    while (hist.length > 2 && hist[1].d < dist - (GOAL + 2) * SPC) hist.shift();

    // The world
    const pc = { x: PX, y: py - 22 };
    for (const e of ents) {
      e.t += dt; e.x -= (speed + e.vx) * dt;
      const sy = surfY(e.x);
      if (e.k === "float") { e.y = sy + 2; e.cy = sy - 14; }
      else if (e.k === "air" || e.k === "item") { e.y = sy - e.hy + Math.sin(e.t * 3) * 3; e.cy = e.y - 12; if (e.k === "item") e.cy = e.y; }
      else if (e.k === "kite") { e.y = sy - e.hy + Math.sin(e.t * 2) * 8; e.cy = e.y - 18; }
      else if (e.k === "flamingo") { e.y = sy - Math.abs(Math.sin(e.t * 2.6)) * 70; e.cy = e.y - 26; if (Math.random() < dt * 0.6) pop(e.x + 14, e.y - 60, "hic!", C.ink); }
      else if (e.k === "rock") { e.y = SURF + 6; e.cy = SURF - 8; }
      else if (e.k === "shark") { e.y = sy; e.cy = sy - 12; }
      else if (e.k === "gull") { e.y = sy - e.hy; e.cy = e.y; }
      else if (e.k === "box") { e.y = sy - e.hy; e.cy = e.y; if (e.bump > 0) e.bump -= dt; }
      else if (e.k === "foam") { e.y = sy; e.cy = sy - 6; }
      else if (e.k === "medusa") { e.y = sy - e.hy + Math.sin(e.t * 2.2) * 30; e.cy = e.y; }
      else if (e.k === "debris") { e.vy += GRAV * 0.6 * dt; e.y += e.vy * dt; e.rot += dt * 8; e.x += 220 * dt; e.cy = e.y; }
      if (e.dead || e.k === "debris") continue;
      const friendly = e.k === "float" || e.k === "air" || e.k === "kite" || e.k === "flamingo";
      if (friendly && magnet > 0 && e.x > PX - 20 && e.x - PX < 190) { e.x += (PX - e.x) * Math.min(1, dt * 5); e.hy = (e.hy || 0) + ((surfY(PX) - py + 10) - (e.hy || 0)) * Math.min(1, dt * 5); if (e.k === "float") e.k = "air"; }
      const d = dist2(pc.x, pc.y, e.x, e.cy);
      if (friendly) { if (d < 26) collect(e); continue; }
      if (e.k === "item") { if (d < 24) useItem(e); continue; }
      if (e.k === "box") {
        if (!e.open && Math.abs(e.x - PX) < 24) {
          const head = py - 60;
          if (vy < 0 && head <= e.y + 15 && head >= e.y - 6) { openBox(e); vy = 160; holdT = 0; if (mode !== "play") return; }
          else if (vy > 0 && py >= e.y - 16 && py <= e.y + 2) { vy = -JUMP * 0.95; jumps = 1; holdT = 0.12; pop(e.x, e.y - 40, "Boing!", C.sea); }
        } else if (e.open && Math.abs(e.x - PX) < 22 && vy > 0 && py >= e.y - 16 && py <= e.y + 2) { vy = -JUMP * 0.8; jumps = 1; }
        continue;
      }
      if (e.k === "foam") {
        const span = e.w / 2 + 6, onWater = surfY(PX) - py < 10;
        if (!e.hit && onWater && Math.abs(e.x - PX) < span && star <= 0 && inv <= 0) {
          e.hit = true; say("White water!", "Jump the foam. It also catches friends behind you.", "foam");
          hurt("Wiped!"); if (mode !== "play") return;
        }
        if (!e.passed && e.x + e.w / 2 < PX - 10) { e.passed = true; if (!e.hit) { score += 75; pop(PX, py - 76, "Clean! +75", C.sea); } }
        if (!e.ate && e.x - e.w / 2 < PX - 8) {
          for (let i = 0; i < followers.length; i++) {
            const x = fx_(i); if (x < -10) break;
            if (Math.abs(e.x - x) < e.w / 2 && surfY(x) - fy_(i) < 10) { e.ate = true; if (star <= 0) wipe(i, x); break; }
          }
        }
        continue;
      }
      // hazards
      const hr = e.k === "gull" ? 20 : 22;
      if (!e.hit && d < hr) {
        if (star > 0) { e.k = "debris"; e.vy = -420; e.rot = 0; score += 75; pop(e.x, e.cy - 30, "SMASH +75", C.coral); burst(e.x, e.cy, 10); continue; }
        if (inv <= 0) { e.hit = true; hurt(e.k === "shark" ? "Shark!" : e.k === "gull" ? "Gaviota!" : e.k === "medusa" ? "Medusa!" : "Rock!"); if (mode !== "play") return; continue; }
      }
      if (!e.passed && e.x < PX - 14 && (e.k === "rock" || e.k === "shark")) {
        e.passed = true;
        if (!e.hit && airborne() && surfY(PX) - py < 60) { score += 50; pop(PX, py - 76, "Close! +50", C.sea); }
      }
      // sharks swim into your party wave from the front and bite whoever is on the water
      if (e.k === "shark" && !e.ate && e.x < PX - 8) {
        for (let i = 0; i < followers.length; i++) {
          const x = fx_(i); if (x < -10) break;
          if (Math.abs(e.x - x) < 9) {
            if (surfY(x) - fy_(i) < 22) { e.ate = true; if (star <= 0) { const n = wipe(i, x); if (n) say("Chomp!", "Sharks eat whoever is still on the water behind you.", "chomp"); } }
            break;
          }
        }
      }
    }
    ents = ents.filter(e => !e.dead && e.x > -120 && e.y < H + 60);

    if (!arrive) { gap -= speed * dt; if (gap <= 0) { const len = pattern(); gap = len + R(1, 1.6) * speed * Math.max(0.58, 0.88 - time * 0.0022); } }
    if (!arrive) {
      if (set) { if ((set.t -= dt) <= 0) endSet(); }
      else if (followers.length >= 4 && (setT -= dt) <= 0) startSet();
    } else if (set) endSet();
    else if ((arrive -= dt) <= 0) { startFinale(); return; }

    if (!arrive && !set && followers.length >= 18) {
      if (calima > 0) calima -= dt;
      else if ((calimaT -= dt) <= 0) { calima = 4.5; calimaT = R(32, 42); say("¡Calima!", "Sahara dust. Hard to see what's coming.", "calima"); }
    } else calima = Math.max(0, calima - dt);

    for (let i = falls.length - 1; i >= 0; i--) { const f = falls[i]; f.t += dt; f.vy += GRAV * 0.7 * dt; f.x += (f.vx - speed * 0.4) * dt; f.y += f.vy * dt; f.r += dt * 9; if (f.y > H + 40) falls.splice(i, 1); }
    stepSplash(dt);
    if (hudTick(dt)) $("g-time").textContent = fmt(time);
  }
  let hudT = 0;
  function hudTick(dt) { if ((hudT -= dt) <= 0) { hudT = 0.25; $("g-score").textContent = num(score); return true; } return false; }
  function stepSplash(dt) {
    for (let i = splash.length - 1; i >= 0; i--) { const p = splash[i]; p.t += dt; p.vy += GRAV * 0.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > 0.7) splash.splice(i, 1); }
  }

  // ---------- Endings ----------
  const POOL = { x: 150, y: 270, w: 340, h: 180 };
  let last = { score: 0, friends: 0, secs: 0, saved: false };
  function startFinale() {
    mode = "finale"; finT = 0; held = false; banner = null; combo = 0; star = 0; magnet = 0; mojito = 0; calima = 0; set = null; flipA = 0; sw = 1; longb = 0;
    $("stage").classList.remove("playing");
    const bonus = 5000 + Math.max(0, 240 - Math.floor(time)) * 20 + lives * 1000;
    score += bonus;
    const slots = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) slots.push({ tx: POOL.x + 30 + c * (POOL.w - 60) / 8 + (r % 2) * 7, ty: POOL.y + 42 + r * (POOL.h - 62) / 4 });
    const me = slots.splice(22, 1)[0];
    actors = [{ L: ME, me: true, sx: -30, sy: 330, ...me, d: 0.2 }];
    followers.forEach((L, i) => actors.push({ L, sx: -40 - (i % 8) * 18, sy: 240 + (i % 5) * 45, ...slots[i], d: 0.3 + i * 0.05, ring: i % 5 === 0 ? pick([C.coral, C.rose, C.sun]) : null }));
    endCard("¡40 amigos rescatados!",
      `Jorge's whole party wave made it to the pool in ${fmt(time)} with ${lives} ${lives === 1 ? "wig" : "wigs"} left. Bonus +${num(bonus)}. The real pool party is Saturday 12 from 14:00. Wigs and sunnies mandatory.`, 3200);
    hud(); $("g-score").textContent = num(score);
  }
  function gameOver() {
    mode = "over"; held = false; star = 0; magnet = 0; mojito = 0; calima = 0; longb = 0;
    $("stage").classList.remove("playing");
    banner = { txt: "Wiped out!", sub: "No wigs left", t: 0, hold: true };
    endCard("Out of wigs", `Jorge's party wave reached ${followers.length} of 40 friends.`, 900);
    $("g-score").textContent = num(score);
  }
  function endCard(title, text, delay) {
    last = { score: Math.floor(score), friends: mode === "finale" ? GOAL : followers.length, secs: Math.floor(time), saved: false };
    const best = loadBest(), isBest = last.score > 0 && last.score > best;
    if (isBest) saveBest(last.score);
    $("g-end-h").textContent = title;
    $("g-end-txt").textContent = `${text} Score: ${num(last.score)}${isBest ? " (your best yet)" : best ? `. Your best: ${num(best)}` : ""}.`;
    $("g-save-msg").textContent = "";
    $("g-save").hidden = !fameOK || last.score <= 0;
    $("g-save-btn").disabled = false;
    try { $("g-name").value = $("g-name").value || localStorage.getItem("j40-player") || ""; } catch {}
    setTimeout(() => { if (mode === "finale" || mode === "over") $("g-end").hidden = false; }, delay);
  }
  function loadBest() { try { return Number(localStorage.getItem("j40-best-surf")) || 0; } catch { return 0; } }
  function saveBest(v) { try { localStorage.setItem("j40-best-surf", String(v)); } catch {} }

  function drawFinale(dt) {
    finT += dt;
    const { x, y, w, h } = POOL;
    ctx.fillStyle = "#f3dcae"; ctx.fillRect(0, 205, W, H - 205);
    ctx.fillStyle = "rgba(150,110,60,.12)"; for (let i = 0; i < 120; i++) ctx.fillRect((i * 97) % W, 210 + (i * 53) % (H - 210), 1.5, 1.5);
    ctx.fillStyle = "#f6ecd6"; ctx.fillRect(x - 16, y - 16, w + 32, h + 32);
    ctx.fillStyle = "#bfe3ea"; ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
    ctx.fillStyle = C.water; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const yy = y + 12 + i * 22; ctx.beginPath(); for (let xx = x + 6; xx < x + w - 6; xx += 10) { const k = yy + Math.sin(xx * 0.05 + finT * 2 + i) * 2; xx === x + 6 ? ctx.moveTo(xx, k) : ctx.lineTo(xx, k); } ctx.stroke(); }
    [[x - 55, y + 30], [x + w + 55, y + 100]].forEach(([px, p2]) => {
      ctx.strokeStyle = "#8a6440"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, p2 + 70); ctx.quadraticCurveTo(px + 10, p2 + 30, px, p2 - 10); ctx.stroke();
      ctx.strokeStyle = "#4f8f4a"; ctx.lineWidth = 5;
      for (let a = 0; a < 6; a++) { const an = a / 6 * Math.PI * 2 + Math.sin(finT) * 0.05; ctx.beginPath(); ctx.moveTo(px, p2 - 10); ctx.quadraticCurveTo(px + Math.cos(an) * 20, p2 - 24 + Math.sin(an) * 8, px + Math.cos(an) * 34, p2 - 6 + Math.sin(an) * 14); ctx.stroke(); }
    });
    ctx.fillStyle = C.coral; ctx.fillRect(x + w / 2 - 110, y - 50, 220, 30);
    ctx.fillStyle = "#fff"; ctx.font = `800 18px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("J40 POOL PARTY", x + w / 2, y - 34);
    const list = actors.map((a, i) => {
      const k = clamp((finT - a.d) / 2.2, 0, 1), e = 1 - Math.pow(1 - k, 3);
      return { a, i, k, x: a.sx + (a.tx - a.sx) * e, y: a.sy + (a.ty - a.sy) * e - Math.sin(k * Math.PI) * 50 };
    }).sort((p, q) => p.y - q.y);
    for (const { a, i, k, x: ax, y: ay } of list) {
      if (k < 1) { person(ax, ay, a.L, { t: finT + i, wig: a.me, armsUp: true, rot: k * 6.28 * (i % 2 ? 1 : -1) }); continue; }
      const bob = Math.sin(finT * 3 + i) * 1.5;
      person(ax, ay + 13 + bob, a.L, { noLegs: true, armsUp: (i + Math.floor(finT * 1.5)) % 3 === 0, t: finT + i, wig: a.me });
      ctx.fillStyle = C.water; ctx.fillRect(ax - 13, ay - 2 + bob, 26, 18);
      if (a.ring) donut(ax, ay - 2 + bob, a.ring);
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(ax, ay - 1 + bob, 15, 4.5, 0, 0, 7); ctx.stroke();
      if (finT - a.d - 2.2 < dt * 1.5) burst(ax, ay, 6);
    }
    stepSplash(dt); drawSplash();
    if (finT > 1.2 && confetti.length < 260) for (let n = 0; n < 4; n++) confetti.push({ x: R(0, W), y: -10, vx: R(-30, 30), vy: R(60, 140), r: R(0, 6), c: pick([C.coral, C.sun, C.rose, C.sea, "#fff"]) });
    for (let i = confetti.length - 1; i >= 0; i--) {
      const p = confetti[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 6;
      if (p.y > H + 10) { confetti.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-3, -1.5, 6, 3); ctx.restore();
    }
  }

  // ---------- Draw ----------
  function drawSea(t) {
    // drifting whitecaps on the far sea
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const x = ((i * 113 - dist * 0.25) % (W + 60) + W + 60) % (W + 60) - 30, y = 210 + (i * 37) % 80;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 9, y - 4, x + 18, y); ctx.stroke();
    }
    // the wave face Jorge rides
    const gr = ctx.createLinearGradient(0, SURF - 10, 0, H);
    gr.addColorStop(0, "#56bccb"); gr.addColorStop(1, "#1f7b90");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, surfY(x));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 3;
    ctx.beginPath(); for (let x = 0; x <= W; x += 8) { const y = surfY(x); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      const x = ((i * 89 - dist) % (W + 80) + W + 80) % (W + 80) - 40, y = SURF + 22 + (i * 29) % 130;
      line(x, y, x + 26 + (i % 3) * 8, y);
    }
  }
  function drawCurl(t) {
    // the breaking lip of the wave chasing the party from the left
    ctx.save(); ctx.translate(0, SURF); ctx.scale(1 + (sw - 1) * 0.35, 1 + (sw - 1) * 0.45); ctx.translate(0, -SURF);
    ctx.fillStyle = "#2f97ab";
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, SURF - 150);
    ctx.quadraticCurveTo(60, SURF - 175, 92, SURF - 120);
    ctx.quadraticCurveTo(70, SURF - 130, 58, SURF - 95);
    ctx.quadraticCurveTo(62, SURF - 40, 40, SURF); ctx.lineTo(40, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.92)";
    for (let i = 0; i < 9; i++) { const a = i / 8; circle(4 + a * 86 + Math.sin(t * 5 + i) * 2, SURF - 150 - Math.sin(a * Math.PI) * 18 + (a > 0.8 ? (a - 0.8) * 120 : 0), 6 + (i % 3)); }
    ctx.fillStyle = "rgba(255,255,255,.5)";
    for (let i = 0; i < 6; i++) circle(30 + Math.sin(t * 3 + i * 2) * 20, SURF - 60 + i * 12, 4);
    ctx.restore();
  }

  function drawEnt(e) {
    const t = e.t;
    if (e.k === "float") { person(e.x, e.y + 12, e.L, { noLegs: true, armsUp: true, t }); donut(e.x, e.y - 2, e.ring); }
    else if (e.k === "air") { person(e.x, e.y + 10, e.L, { noLegs: true, armsUp: true, t }); donut(e.x, e.y - 4, C.rose); }
    else if (e.k === "kite") {
      ctx.strokeStyle = "rgba(23,80,63,.6)"; ctx.lineWidth = 1; line(e.x + 9, e.y - 33, e.x + 30, e.y - 92);
      person(e.x, e.y, e.L, { armsUp: true, t }); kite(e.x + 30, e.y - 106, t);
    }
    else if (e.k === "flamingo") { flamingo(e.x, e.y, t); person(e.x - 4, e.y - 8, e.L, { noLegs: true, armsUp: Math.sin(t * 2.6) > 0, bottle: true, t, rot: Math.sin(t * 3) * 0.2 }); }
    else if (e.k === "rock") rock(e.x, e.y);
    else if (e.k === "shark") fin(e.x, e.y, t);
    else if (e.k === "gull") gullSprite(e.x, e.y, t);
    else if (e.k === "item") pickup(e.kind, e.x, e.y, t);
    else if (e.k === "box") qbox(e.x, e.y, e.open, t, e.bump || 0);
    else if (e.k === "foam") whitewater(e.x, e.y, e.w, t);
    else if (e.k === "medusa") medusa(e.x, e.y, t);
    else if (e.k === "debris") { ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.rot); ctx.fillStyle = "#4b3f45"; ctx.fillRect(-10, -10, 20, 20); ctx.restore(); }
  }

  function drawJorge(t) {
    if (inv > 0 && mode === "play" && Math.floor(inv * 12) % 2) return;
    const sway = mojito > 0 ? Math.sin(t * 6) * 0.25 : 0;
    const air = airborne();
    if (star > 0) {
      const gr = ctx.createRadialGradient(PX, py - 24, 4, PX, py - 24, 46);
      gr.addColorStop(0, "rgba(255,230,120,.7)"); gr.addColorStop(1, "rgba(255,230,120,0)");
      ctx.fillStyle = gr; circle(PX, py - 24, 46);
    }
    ctx.save(); ctx.translate(PX, py); ctx.rotate(spin + (air ? -0.12 : Math.sin(t * 4) * 0.05) + sway);
    surfboard(0, 0, star > 0 ? "#ffd34d" : longb > 0 ? "#ffb3c7" : ME.board, S, 0, longb > 0 ? 1.9 : 1);
    person(0, -4, ME, { s: S, wig: true, surf: !air, armsUp: air && !spinning, t });
    ctx.restore();
  }
  function drawFollowers(t) {
    for (let i = followers.length - 1; i >= 0; i--) {
      const x = fx_(i); if (x < -20) continue;
      const y = fy_(i), air = surfY(x) - y > 3, L = followers[i];
      ctx.save(); ctx.translate(x, y); ctx.rotate(air ? -0.15 : Math.sin(t * 4 + i) * 0.06);
      surfboard(0, 0, L.board, FS);
      person(0, -4, L, { s: FS, surf: !air, armsUp: air || (i + Math.floor(t * 2)) % 7 === 0, t: t + i });
      ctx.restore();
    }
  }
  function drawFalls() {
    for (const f of falls) { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.r); person(0, 0, f.L, { s: FS, armsUp: true, t: f.t }); ctx.restore(); }
  }
  function drawSplash() { for (const p of splash) { ctx.globalAlpha = 1 - p.t / 0.7; ctx.fillStyle = p.c; circle(p.x, p.y, 2.6); } ctx.globalAlpha = 1; }
  function drawFx(dt) {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i]; f.t += dt; if (f.t > 1.1) { fx.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - f.t / 1.1;
      ctx.font = `800 ${f.txt.length > 5 ? 15 : 19}px ${FONT}`;
      const fx0 = mode === "finale" ? f.x : clamp(set ? W - f.x : f.x, 60, W - 60);
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.strokeText(f.txt, fx0, f.y - f.t * 30);
      ctx.fillStyle = f.col; ctx.fillText(f.txt, fx0, f.y - f.t * 30);
    }
    ctx.globalAlpha = 1;
  }
  function drawCalima() {
    const k = Math.min(1, calima / 0.8, (4.5 - calima) / 0.8);
    const g = ctx.createLinearGradient(PX + 130, 0, PX + 380, 0);
    g.addColorStop(0, "rgba(206,140,72,0)"); g.addColorStop(1, `rgba(206,140,72,${0.82 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function drawHud() {
    for (let i = 0; i < LIVES; i++) { ctx.globalAlpha = i < lives ? 1 : 0.22; curls(22 + i * 28, 52, 0.6); }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = C.ink; ctx.font = `800 22px ${FONT}`; ctx.fillText(num(score), 104, 30);
    ctx.font = `700 14px ${FONT}`; ctx.fillText(`${followers.length} / 40 friends`, 104, 52);
    if (combo > 1) { ctx.fillStyle = C.coral; ctx.font = `800 16px ${FONT}`; ctx.fillText(`combo x${combo}`, 230, 30); }
    const pills = [];
    if (star > 0) pills.push(["Party Wave", star, C.sun]);
    if (magnet > 0) pills.push(["Mojo", magnet, C.coral]);
    if (mojito > 0) pills.push(["Mojito", mojito, "#5f9e3c"]);
    if (longb > 0) pills.push(["Longboard", longb, C.rose]);
    if (set) pills.push(["Serie x2", set.t, C.sea]);
    pills.forEach(([txt, s, col], i) => {
      const x = 12 + i * 112, y = 70;
      ctx.fillStyle = col; rrect(x, y, 104, 20, 10); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = `700 12px ${FONT}`; ctx.textAlign = "center";
      ctx.fillText(`${txt} ${Math.ceil(s)}s`, x + 52, y + 10.5);
    });
  }
  function drawBanner() {
    const a = banner.hold ? 1 : Math.min(1, banner.t / 0.2, (2.6 - banner.t) / 0.4);
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = `800 24px ${FONT}`;
    const w1 = ctx.measureText(banner.txt).width;
    ctx.font = `600 13px ${FONT}`;
    const w2 = banner.sub ? ctx.measureText(banner.sub).width : 0;
    const w = Math.max(w1, w2) + 36, h = banner.sub ? 60 : 40, x = W / 2 - w / 2, y = banner.hold ? 150 : 104;
    ctx.fillStyle = "rgba(23,80,63,.92)"; rrect(x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `800 24px ${FONT}`; ctx.fillText(banner.txt, W / 2, y + 21);
    if (banner.sub) { ctx.font = `600 13px ${FONT}`; ctx.fillStyle = "#f6e6c8"; ctx.fillText(banner.sub, W / 2, y + 45); }
    ctx.globalAlpha = 1;
  }

  function drawSet(t) {
    // the face of a big set wave, seen side-on; Jorge travels right to left, the wave breaks behind him on the right
    const gr = ctx.createLinearGradient(0, FT - 40, 0, FB + 30);
    gr.addColorStop(0, "#9fe0d6"); gr.addColorStop(0.35, "#4fb3c4"); gr.addColorStop(1, "#1d6f86");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, lipY(x, t));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    // shoulder on the left is gentler and lighter, the pocket on the right steeper and darker
    const sh = ctx.createLinearGradient(0, 0, W, 0);
    sh.addColorStop(0, "rgba(255,255,255,.10)"); sh.addColorStop(0.55, "rgba(10,60,80,0)"); sh.addColorStop(1, "rgba(10,50,70,.32)");
    ctx.fillStyle = sh;
    ctx.beginPath(); ctx.moveTo(0, FB + 17);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, lipY(x, t));
    ctx.lineTo(W, FB + 17); ctx.closePath(); ctx.fill();
    // curved contour lines down the face
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1.5;
    for (let k = 1; k <= 4; k++) { ctx.beginPath(); for (let x = 0; x <= W; x += 16) { const y = lipY(x, t) + k * k * 15 + (x / W) * k * 8; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    // face texture streaming past
    ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.lineWidth = 2;
    for (let i = 0; i < 22; i++) {
      const x = ((i * 97 + sd) % (W + 120)) - 60, y = FT + 10 + (i * 41) % (FB - FT);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y + 4, x + 44, y + 2); ctx.stroke();
    }
    // the lip, feathering
    ctx.fillStyle = "rgba(255,255,255,.95)";
    for (let x = 0; x <= W; x += 14) circle(x, lipY(x, t) + 2, 5 + Math.sin(x * 0.2 + t * 6) * 2);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    for (let i = 0; i < 18; i++) { const x = ((i * 53 + t * 90) % W), y = lipY(x, t) - 6 - ((t * 40 + i * 17) % 22); circle(x, y, 2); }
    // the trough
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(0, FB + 14, W, 3);
    ctx.fillStyle = "#1a6276"; ctx.fillRect(0, FB + 17, W, H - FB - 17);
    // the breaking section chasing from the right
    ctx.fillStyle = "#2a8ea4";
    ctx.beginPath(); ctx.moveTo(W, FT - 80); ctx.quadraticCurveTo(W - 110, FT - 90, W - 120, FT - 20); ctx.quadraticCurveTo(W - 90, FT - 40, W - 70, FT - 10); ctx.lineTo(W, FT); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.95)";
    for (let i = 0; i < 26; i++) { const a = i / 25; circle(W - 40 - Math.sin(t * 4 + i) * 18 - (i % 3) * 14, FT - 70 + a * (FB - FT + 110), 14 + (i % 4) * 4); }
    for (let i = 0; i < 9; i++) circle(W - 118 + i * 12, FT - 84 + Math.sin(t * 6 + i) * 3, 6);
  }
  function drawSetEnts(t) {
    for (const e of sents) {
      if (e.k === "sf") {
        ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(-0.2);
        surfboard(0, 0, C.sun, FS); person(0, -4, e.L, { s: FS, armsUp: true, t: e.t }); ctx.restore();
      } else if (e.k === "wall") {
        ctx.fillStyle = "rgba(255,255,255,.96)";
        for (let y = FT - 30; y < FB + 24; y += 13) {
          if (Math.abs(y - e.gy) < e.gh / 2 - 4) continue;
          circle(e.x - 9 + Math.sin(e.t * 9 + y) * 4, y, 13 + Math.sin(y * 0.7 + e.t * 7) * 3);
          circle(e.x + 9 + Math.cos(e.t * 8 + y) * 4, y + 6, 12 + Math.cos(y * 0.6 + e.t * 6) * 3);
        }
        ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
        line(e.x - 22, e.gy - e.gh / 2 + 4, e.x - 22, e.gy + e.gh / 2 - 4); ctx.setLineDash([]);
      } else if (e.k === "sp") {
        ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.t * 2);
        ctx.fillStyle = "#ffd34d"; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 12, a = i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      } else if (e.k === "ball") {
        ctx.fillStyle = "rgba(255,255,255,.95)";
        for (let i = 0; i < 6; i++) { const a = e.t * 8 + i; circle(e.x + Math.cos(a) * 9, e.y - 10 + Math.sin(a) * 9, 9); }
      }
    }
  }
  function drawSetRiders(t) {
    for (let i = followers.length - 1; i >= 0; i--) {
      const x = fx_(i); if (x > W + 20) continue;
      const y = fy_(i), y2 = yAtS(sd - (i + 1) * SSP - 6), ang = Math.atan2(y - y2, 6) * 0.9, L = followers[i];
      ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); ctx.rotate(ang);
      surfboard(0, 0, L.board, FS); person(0, -4, L, { s: FS, surf: true, armsUp: (i + Math.floor(t * 2)) % 6 === 0, t: t + i });
      ctx.restore();
    }
    if (inv > 0 && mode === "play" && Math.floor(inv * 12) % 2) return;
    if (star > 0) { const g = ctx.createRadialGradient(JX, sy - 24, 4, JX, sy - 24, 46); g.addColorStop(0, "rgba(255,230,120,.7)"); g.addColorStop(1, "rgba(255,230,120,0)"); ctx.fillStyle = g; circle(JX, sy - 24, 46); }
    const ang = sair ? spin : Math.atan2(sv, sspd);
    ctx.save(); ctx.translate(JX, sy); ctx.scale(-1, 1); ctx.rotate(ang);
    surfboard(0, 0, star > 0 ? "#ffd34d" : longb > 0 ? "#ffb3c7" : ME.board, S, 0, longb > 0 ? 1.9 : 1);
    person(0, -4, ME, { s: S, wig: true, surf: !sair, armsUp: sair, t });
    ctx.restore();
    // spray off the rail when carving
    if (!sair && Math.abs(sv) > 250 && Math.random() < 0.6) splash.push({ x: JX + 18, y: sy, vx: R(40, 140), vy: R(-200, -60), t: 0, c: "#fff" });
  }

  function draw(dt, t) {
    if (!bg) bg = makeBg();
    ctx.drawImage(bg, 0, 0, W, H);
    if (mode === "finale") { drawFinale(dt); drawFx(dt); drawHud(); return; }
    if (set) {
      // drawn mirrored so the set is surfed in the same direction as the rest of the game (left to right)
      ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1);
      drawSet(t); drawSetEnts(t); drawSetRiders(t); drawFalls(); drawSplash();
      ctx.restore();
      if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, W, H); }
      drawFx(dt); if (mode !== "title") drawHud(); if (banner) drawBanner();
      return;
    }
    ctx.save();
    const mx = MX();
    if (mx < 0.999) { ctx.translate(W / 2, 0); ctx.scale(Math.abs(mx) < 0.02 ? 0.02 * Math.sign(mx || 1) : mx, 1); ctx.translate(-W / 2, 0); }
    if (mojito > 0) { ctx.translate(W / 2, H / 2); ctx.rotate(Math.sin(t * 2.2) * 0.035); ctx.translate(-W / 2, -H / 2); }
    drawSea(t);
    ents.forEach(drawEnt);
    drawFollowers(t);
    drawJorge(t);
    drawCurl(t);
    drawFalls();
    drawSplash();
    if (calima > 0) drawCalima();
    ctx.restore();
    if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, W, H); }
    drawFx(dt);
    if (mode !== "title") drawHud();
    if (banner) drawBanner();
  }

  // ---------- Loop ----------
  let raf = 0, lastT = 0, visible = true;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.04, (now - (lastT || now)) / 1000); lastT = now; clock += dt;
    if (mode === "play") update(dt);
    else if (mode === "title") { dist += 60 * dt; ents.forEach(e => { e.t += dt; }); py = surfY(PX); placeDemo(); }
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

  function placeDemo() {
    for (const e of ents) {
      const sy = surfY(e.x);
      if (e.k === "float") e.y = sy + 2;
      else if (e.k === "air" || e.k === "item") e.y = sy - e.hy + Math.sin(e.t * 3) * 3;
      else if (e.k === "kite") e.y = sy - e.hy + Math.sin(e.t * 2) * 8;
      else if (e.k === "shark") e.y = sy;
      else if (e.k === "rock") e.y = SURF + 6;
      else if (e.k === "box") e.y = sy - e.hy;
    }
    hist.length = 0; hist.push({ d: -1e9, h: 0 });
  }
  function demo() {
    reset();
    for (let i = 0; i < 5; i++) followers.push(look());
    friend(330, "float"); add({ k: "shark", x: 420 }); friend(500, "kite", { hy: 160 }); add({ k: "rock", x: 560 }); friend(470, "air", { hy: 90 });
    add({ k: "box", x: 600, hy: 135 });
    placeDemo();
  }

  function start() {
    reset(); hud(); $("g-time").textContent = "0:00";
    mode = "play"; $("g-start").hidden = true; $("g-end").hidden = true;
    $("stage").classList.add("playing");
    say("Tap to jump!", "Hold for higher. Tap again in the air to double-jump.", "start");
    const st = $("stage"), r = st.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) st.scrollIntoView({ behavior: "smooth", block: "center" });
    loop();
  }

  const stage = $("stage");
  stage.addEventListener("pointerdown", e => { if (mode !== "play") return; e.preventDefault(); press(); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(n => stage.addEventListener(n, release));
  stage.addEventListener("contextmenu", e => { if (mode === "play") e.preventDefault(); });
  const JUMPKEYS = { " ": 1, ArrowUp: 1, w: 1, W: 1, Enter: 0 };
  window.addEventListener("keydown", e => {
    if (!(e.key in JUMPKEYS) || mode !== "play") return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)) return;
    e.preventDefault(); if (!e.repeat) press();
  });
  window.addEventListener("keyup", e => { if (e.key in JUMPKEYS) release(); });
  window.addEventListener("blur", release);

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

  document.addEventListener("visibilitychange", () => { if (document.hidden) { release(); stop(); } else loop(); });
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? loop() : stop(); }).observe(cv);
  window.addEventListener("resize", () => { if (Math.min(2, window.devicePixelRatio || 1) !== dpr) fit(); });

  fit(); demo();
  $("g-count").textContent = "0"; $("g-score").textContent = "0"; $("g-bar").style.width = "0%";
  draw(0, 0); loop(); loadFame();
})();
