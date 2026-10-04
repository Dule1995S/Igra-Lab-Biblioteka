/* Pokretač interaktivne priče. Sadržaj dolazi iz STORY (podaci), slike iz ASSETS (data URI), crteži iz ART (SVG tekst). */
(function () {
  "use strict";
  var W = 1280, H = 720;
  var stage = document.getElementById("stage");
  var scene = document.getElementById("scene");
  var bar = document.getElementById("bar");
  var pillsEl = document.getElementById("pills");
  var liskoEl = document.getElementById("lisko");
  var bubble = document.getElementById("bubble");
  var nextBtn = document.getElementById("nextBtn");
  var fx = document.getElementById("fx");
  var parentsEl = document.getElementById("parents");
  var scale = 1;
  var skipBtn = document.getElementById("skipBtn");

  var BADGE = (STORY.steps.filter(function (s) { return s.game.type === "stickers"; })[0] || {}).game || null;
  function newBadge() { return { color: BADGE && BADGE.colors ? BADGE.colors[0] : null, slots: BADGE ? BADGE.slots.map(function () { return null; }) : [] }; }
  var S = { name: "", done: STORY.steps.map(function () { return false; }), reached: 0, muted: false, badge: newBadge(), magic: STORY.magic ? STORY.magic.word.split("").map(function () { return ""; }) : [] };
  var magicEl = document.getElementById("magic");
  var ALPHA = ["А","Б","В","Г","Д","Ђ","Е","Ж","З","И","Ј","К","Л","Љ","М","Н","Њ","О","П","Р","С","Т","Ћ","У","Ф","Х","Ц","Ч","Џ","Ш"];

  /* ---------- pomoćne ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "class") el.className = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) el.appendChild(x); });
      else el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs || {}) el.setAttribute(k, attrs[k]);
    return el;
  }
  function A(key) { return ASSETS[key]; }
  function N(key) { return (STORY.names && STORY.names[key]) || ""; }
  function img(key, attrs) { var a = attrs || {}; a.src = A(key); a.alt = a.alt == null ? N(key) : a.alt; a.draggable = "false"; return h("img", a); }
  function who(txt) { txt = txt || ""; return S.name ? txt.replace("{ime}", S.name) : txt.replace(/[,!]?\s*\{ime\}/g, ""); }
  function toStage(e) { var r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function layout() {
    var vp = document.getElementById("viewport"), vw = vp.clientWidth, vh = vp.clientHeight;
    scale = Math.min(vw / W, vh / H);
    stage.style.transform = "translate(" + (vw - W * scale) / 2 + "px," + (vh - H * scale) / 2 + "px) scale(" + scale + ")";
    document.getElementById("rotate").classList.toggle("on", vh > vw && vw < 700 && parentsEl.hidden);
  }
  window.addEventListener("resize", layout);
  layout();

  /* ---------- zvuk ---------- */
  var actx = null;
  function tone(freqs, dur) {
    if (S.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime;
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * dur); g.gain.exponentialRampToValueAtTime(0.18, t + i * dur + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (i + 1) * dur);
        o.connect(g); g.connect(actx.destination); o.start(t + i * dur); o.stop(t + (i + 1) * dur + 0.05);
      });
    } catch (e) { /* bez zvuka */ }
  }
  var SND = { ok: function () { tone([660, 880], 0.12); }, no: function () { tone([240, 200], 0.14); }, win: function () { tone([523, 659, 784, 1047], 0.14); }, tap: function () { tone([520], 0.06); } };

  function burst(x, y, n) {
    var cols = ["#ee5f45", "#ffc93a", "#3f7cb8", "#7ab356", "#a06be0"];
    for (var i = 0; i < (n || 18); i++) {
      var star = i % 4 === 0;
      var c = h("span", { class: "confetti" + (star ? " star" : ""), text: star ? "★" : "" });
      var a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 150;
      c.style.left = x + "px"; c.style.top = y + "px"; c.style.background = cols[i % cols.length]; c.style.color = cols[i % cols.length];
      c.style.setProperty("--dx", Math.cos(a) * d + "px"); c.style.setProperty("--dy", Math.sin(a) * d + 60 + "px"); c.style.setProperty("--r", Math.random() * 540 - 270 + "deg");
      fx.appendChild(c); setTimeout(function (el) { el.remove(); }.bind(null, c), 1200);
    }
  }
  function burstAt(el, n) { var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(); burst((r.left + r.width / 2 - s.left) / scale, (r.top + r.height / 2 - s.top) / scale, n); }

  /* ---------- Lisko, dugme Dalje, traka ---------- */
  function say(text) {
    text = text || "";
    bubble.textContent = who(text);
    bubble.classList.toggle("long", text.length > 150);
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
  }
  function nextAction(label, cb) {
    nextBtn.hidden = false; nextBtn.textContent = label;
    nextBtn.onclick = function () { nextBtn.hidden = true; SND.tap(); cb(); };
  }
  function renderPills(cur) {
    pillsEl.textContent = "";
    pillsEl.classList.toggle("many", STORY.steps.length > 6);
    STORY.steps.forEach(function (st, i) {
      var state = S.done[i] ? "done" : i === cur ? "now" : "todo";
      var b = h("button", { class: "pill-step", "data-state": state, style: "--c:" + st.color, "aria-label": st.label }, h("i"), st.label);
      if (i > S.reached) b.disabled = true; else b.onclick = function () { go(2 + i); };
      pillsEl.appendChild(b);
    });
  }

  var ctx = {
    say: say, burst: burstAt, snd: SND,
    next: nextAction,
    finish: function (msg, idx) {
      S.done[idx] = true; S.reached = Math.max(S.reached, idx + 1);
      renderPills(idx); SND.win(); say(msg);
      var st = STORY.steps[idx];
      if (STORY.magic && st.reward) showReward(st, idx);
      else nextAction("Даље ➜", function () { go(2 + idx + 1); });
    }
  };

  function renderMagic() {
    magicEl.textContent = "";
    if (!STORY.magic) return;
    S.magic.forEach(function (L) { magicEl.appendChild(h("b", { class: L ? "on" : "", text: L })); });
  }
  function revealLetter(st) { S.magic[st.slot] = STORY.magic.word.charAt(st.slot); renderMagic(); }
  function showReward(st, idx) {
    var next = function () { nextAction("Даље ➜", function () { go(2 + idx + 1); }); };
    if (st.reward.letter) { revealLetter(st); say("Слово је " + st.reward.letter + "! Оно иде у чаробну реч горе."); next(); return; }
    var grid = h("div", { class: "alpha" });
    var ov = h("div", { class: "reward" }, h("div", { class: "rw-t", text: "Добио си број " + st.reward.number + "!" }),
      h("div", { class: "rw-s", text: "Нађи у азбуци слово са тим бројем и додирни га." }), grid);
    ALPHA.forEach(function (L, i) {
      var b = h("button", { class: "al", "data-n": String(i + 1), "aria-label": "слово " + L + ", број " + (i + 1) }, h("b", { text: L }), h("small", { text: String(i + 1) }));
      b.onclick = function () {
        if (i + 1 === st.reward.number) {
          SND.ok(); ov.remove(); revealLetter(st); burst(1000, 40, 24); say("Слово је " + L + "! Оно иде у чаробну реч горе."); next();
        } else { SND.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); say("То није број " + st.reward.number + ". Бројимо: А је 1, Б је 2, В је 3..."); }
      };
      grid.appendChild(b);
    });
    scene.appendChild(ov);
  }

  /* ---------- scene ---------- */
  var order = ["title", "name"].concat(STORY.steps.map(function (s, i) { return i; }), ["finale", "parents"]);
  var cur = -1;

  function go(i) {
    cur = i; scene.textContent = ""; nextBtn.hidden = true; parentsEl.hidden = true; fx.textContent = ""; layout();
    var key = order[i];
    var themes = { title: "cream", name: "cream", finale: "treasure" };
    var theme = typeof key === "number" ? STORY.steps[key].theme : themes[key] || "cream";
    stage.dataset.theme = theme;
    bar.hidden = key === "title" || key === "name";
    renderMagic();
    skipBtn.hidden = typeof key !== "number";
    liskoEl.hidden = key === "title";
    if (typeof key === "number") {
      renderPills(key);
      var st = STORY.steps[key];
      addDeco(theme);
      var root = h("div", { class: "scene-" + st.game.type }); scene.appendChild(root);
      GAMES[st.game.type](root, st.game, ctx, key);
      say(st.intro);
    } else if (key === "finale") { renderPills(-1); addDeco(theme); finale(); }
    else if (key === "title") titleScene();
    else if (key === "name") nameScene();
    else if (key === "parents") parentsScene();
  }

  function addDeco(theme) {
    if (["day", "dragon", "tourney", "jungle", "sky", "meadow", "garden", "mountain", "river", "field", "forest", "snow"].indexOf(theme) >= 0) {
      [[120, 120], [620, 150], [1010, 100]].forEach(function (p) { var c = h("div", { class: "cloud" }); c.style.left = p[0] + "px"; c.style.top = p[1] + "px"; scene.appendChild(c); });
    }
  }

  function titleScene() {
    var s = h("div", { class: "title-scene" },
      img("logo", { class: "logo", alt: "Igra Lab" }),
      h("div", { class: "left" },
        h("h1", { text: STORY.title, style: STORY.title.split(" ").some(function (w) { return w.length >= 10; }) ? "font-size:62px" : "" }),
        h("div", { class: "sub", text: STORY.subtitle }),
        h("div", { class: "chips" }, STORY.chips.map(function (c) { return h("span", { class: "chip", text: c }); })),
        h("button", { class: "big-btn go", text: "ПОЧНИ ПРИЧУ", onclick: function () { SND.tap(); go(1); } }),
        h("div", { class: "note", text: "Родитељу: прочитајте детету шта Лиско каже у облачићу." })),
      img("cover", { class: "cover", alt: STORY.title })
    );
    scene.appendChild(s);
  }

  function nameScene() {
    say(STORY.nameMsg || "Ја сам Лиско и заједно ћемо кроз ову причу. А како се ти зовеш?");
    var inp = h("input", { type: "text", maxlength: "16", placeholder: "име", "aria-label": "Име", autocomplete: "off" });
    function ok() { S.name = inp.value.trim().replace(/[<>&]/g, ""); SND.tap(); go(2); }
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") ok(); });
    scene.appendChild(h("div", { class: "name-scene" },
      h("h2", { text: "Како се зове храбро дете?" }), inp,
      h("div", { class: "row" }, h("button", { class: "big-btn", text: "ДАЉЕ ➜", onclick: ok }), h("button", { class: "link-btn", text: "прескочи", onclick: function () { S.name = ""; go(2); } }))
    ));
    setTimeout(function () { inp.focus({ preventScroll: true }); }, 50);
  }

  /* ---------- igre ---------- */
  var GAMES = {};

  // Šta ne pripada: u svakom redu jedna stvar nije iz tog vremena
  GAMES.odd = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r]; root.textContent = ""; nextBtn.hidden = true;
      var cards = h("div", { class: "cards" });
      R.items.forEach(function (k, i) {
        var b = h("button", { class: "card", "aria-label": N(k) }, img(k), h("div", { class: "nm", text: N(k) }));
        b.onclick = function () {
          if (i === R.odd) {
            c.snd.ok(); b.classList.add("right");
            Array.prototype.forEach.call(cards.children, function (x) { x.disabled = true; if (x !== b) x.classList.add("dim"); });
            c.burst(b, 22);
            if (r < p.rounds.length - 1) { c.say(R.fact); c.next("Даље ➜", function () { r++; round(); }); }
            else c.finish(R.fact + (p.bonus ? " " + p.bonus : ""), idx);
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); c.say(p.hint); }
        };
        cards.appendChild(b);
      });
      root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: R.title }),
        h("div", { class: "rounddots" }, p.rounds.map(function (_, i) { return h("b", { class: i <= r ? "on" : "" }); }))));
      root.appendChild(cards);
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Šta je u stvarnosti veće
  GAMES.bigger = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r]; root.textContent = ""; nextBtn.hidden = true;
      var cards = h("div", { class: "cards two" });
      ["a", "b"].forEach(function (side) {
        var k = R[side], sc = side === "a" ? R.sa : R.sb, im = img(k);
        if (sc) im.style.maxHeight = Math.round(190 * sc) + "px";
        var b = h("button", { class: "card", "aria-label": N(k) }, im, h("div", { class: "nm", text: R.hideNames ? "" : N(k) }));
        b.onclick = function () {
          if (R.bigger === side) {
            c.snd.ok(); b.classList.add("right");
            Array.prototype.forEach.call(cards.children, function (x) { x.disabled = true; if (x !== b) x.classList.add("dim"); });
            c.burst(b, 22);
            if (r < p.rounds.length - 1) { c.say(R.fact); c.next("Даље ➜", function () { r++; round(); }); }
            else c.finish(R.fact + (p.bonus ? " " + p.bonus : ""), idx);
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); c.say(p.hint); }
        };
        cards.appendChild(b);
      });
      root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: R.title || p.title }),
        h("div", { class: "rounddots" }, p.rounds.map(function (_, i) { return h("b", { class: i <= r ? "on" : "" }); }))));
      root.appendChild(cards);
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Senka: povuci buktinju bliže i dalje od štita
  GAMES.shadow = function (root, p, c, idx) {
    var Ox = 760, Wx = 960, Cy = 340, SH = 150, LMIN = 130, LMAX = 640, WALL_TOP = 90;
    var shW = SH * (p.objRatio || 0.81), LH = 150, lightY = p.lightY == null ? 0.22 : p.lightY;
    root.classList.add("shadow-scene");
    var wall = h("div", { class: "wall" }); root.appendChild(wall);
    root.appendChild(h("div", { class: "floor" }));
    var rays = svgEl("svg", { viewBox: "0 0 1280 720" });
    var rayA = svgEl("line", { stroke: "#ffd86b", "stroke-width": 4, "stroke-dasharray": "10 8", "stroke-linecap": "round" });
    var rayB = svgEl("line", { stroke: "#ffd86b", "stroke-width": 4, "stroke-dasharray": "10 8", "stroke-linecap": "round" });
    rays.appendChild(rayA); rays.appendChild(rayB); root.appendChild(rays);
    var post = h("div", { class: "post" }); post.style.cssText = "left:" + (Ox - 5) + "px;top:" + (Cy + SH / 2 - 8) + "px;height:" + (590 - (Cy + SH / 2) + 8) + "px"; root.appendChild(post);
    var shield = img(p.object || "stit", { class: "shield", alt: "" }); shield.style.left = Ox - shW / 2 + "px"; root.appendChild(shield);
    var wallclip = h("div", { class: "wallclip" }); root.appendChild(wallclip);
    var shade = img(p.object || "stit", { class: "shade", alt: "" }); wallclip.appendChild(shade);
    var glow = h("div", { class: "glow" }); root.appendChild(glow);
    var torch = img(p.light || "buktinja", { class: "torch", alt: "светло", tabindex: "0", role: "slider", "aria-label": "Светло: повуци лево или десно", "aria-valuemin": LMIN, "aria-valuemax": LMAX });
    torch.style.top = Cy - LH * lightY + "px"; torch.style.height = LH + "px"; root.appendChild(torch);
    var hint = h("div", { class: "drag-hint", text: p.dragHint || "◀ вуци буктињу ▶" }); hint.style.left = "100px"; hint.style.top = "470px"; root.appendChild(hint);
    var tw = LH * (p.lightRatio || 0.403);
    var near = false, far = false, done = false, lx = 190;

    function place(x) {
      lx = clamp(x, LMIN, LMAX);
      torch.style.left = lx - tw / 2 + "px"; torch.setAttribute("aria-valuenow", Math.round(lx));
      glow.style.left = lx - 170 + "px"; glow.style.top = Cy - 170 + "px";
      var s = (Wx - lx) / (Ox - lx);   // koliko puta je senka veća od štita
      shade.style.width = shW * s + "px"; shade.style.height = SH * s + "px";
      shade.style.left = 160 - shW * s / 2 + "px"; shade.style.top = Cy - WALL_TOP - SH * s / 2 + "px";
      [[rayA, -1], [rayB, 1]].forEach(function (r) {
        r[0].setAttribute("x1", lx); r[0].setAttribute("y1", Cy);
        r[0].setAttribute("x2", Wx); r[0].setAttribute("y2", Cy + r[1] * (SH / 2) * s);
      });
      if (!done) {
        if (!near && s > 2.2) { near = true; hint.style.opacity = 0; c.say(p.nearMsg); c.snd.ok(); }
        if (near && !far && s < 1.45) { far = true; }
        if (near && far) { done = true; c.burst(shade, 24); c.finish(p.doneMsg, idx); }
      }
    }
    place(lx);
    var drag = false, off = 0;
    torch.addEventListener("pointerdown", function (e) { drag = true; off = toStage(e).x - lx; torch.setPointerCapture(e.pointerId); hint.style.opacity = 0; e.preventDefault(); });
    torch.addEventListener("pointermove", function (e) { if (drag) place(toStage(e).x - off); });
    torch.addEventListener("pointerup", function () { drag = false; });
    torch.addEventListener("pointercancel", function () { drag = false; });
    torch.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") { place(lx - 24); e.preventDefault(); } if (e.key === "ArrowRight") { place(lx + 24); e.preventDefault(); } });
  };

  // Trag: prati liniju prstom od početka do kraja
  GAMES.trace = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r]; root.textContent = ""; nextBtn.hidden = true;
      root.classList.add("trace-scene");
      root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: R.title }),
        h("div", { class: "rounddots" }, p.rounds.map(function (_, i) { return h("b", { class: i <= r ? "on" : "" }); }))));
      var svg = svgEl("svg", { viewBox: "0 0 1280 720" });
      var base = svgEl("path", { d: R.d, fill: "none", stroke: "rgba(58,26,20,.14)", "stroke-width": 64, "stroke-linecap": "round", "stroke-linejoin": "round" });
      var dash = svgEl("path", { d: R.d, fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-dasharray": "2 18", "stroke-linecap": "round", "stroke-linejoin": "round" });
      var L = base.getTotalLength(), n = Math.ceil(L / 5) + 1, pts = [];
      for (var i = 0; i < n; i++) pts.push(base.getPointAtLength(i * L / (n - 1)));
      var prog = svgEl("path", { d: R.d, fill: "none", stroke: "#5bb581", "stroke-width": 30, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": L + " " + (L + 10), "stroke-dashoffset": L });
      var prog2 = svgEl("path", { d: R.d, fill: "none", stroke: "#3a1a14", "stroke-width": 40, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": L + " " + (L + 10), "stroke-dashoffset": L, opacity: 0.0 });
      var start = svgEl("g"); start.innerHTML = '<circle r="36" fill="#fff" stroke="#3a1a14" stroke-width="5"/><text y="6" text-anchor="middle" font-size="16" font-weight="900" fill="#3a1a14" font-family="Nunito,sans-serif">СТАРТ</text>';
      start.setAttribute("transform", "translate(" + pts[0].x + "," + pts[0].y + ")");
      var end = svgEl("g");
      if (p.end) { var ew = p.endW || 96, eh = p.endH || 72; end.appendChild(svgEl("circle", { r: 54, fill: "#fff", stroke: "#3a1a14", "stroke-width": 5 })); end.appendChild(svgEl("image", { href: A(p.end), x: -ew / 2 + 0, y: -eh / 2, width: ew, height: eh, preserveAspectRatio: "xMidYMid meet" })); }
      else end.innerHTML = '<circle r="32" fill="#ffd23f" stroke="#3a1a14" stroke-width="5"/><text y="11" text-anchor="middle" font-size="34" fill="#3a1a14">★</text>';
      end.setAttribute("transform", "translate(" + pts[n - 1].x + "," + pts[n - 1].y + ")");
      var head = svgEl("g");
      if (p.head) { var hw = p.headW || 84, hh = p.headH || 84; head.appendChild(svgEl("image", { href: A(p.head), width: hw, height: hh, x: -hw / 2, y: -hh + 14, preserveAspectRatio: "xMidYMid meet" })); }
      else { head.innerHTML = ART.dragon; head.firstChild.setAttribute("width", 84); head.firstChild.setAttribute("height", 84); head.firstChild.setAttribute("x", -42); head.firstChild.setAttribute("y", -62); }
      [base, dash, prog2, prog, start, end, head].forEach(function (x) { svg.appendChild(x); });
      root.appendChild(svg);
      var k = 0, drawing = false, fin = false;
      function paint() {
        var off = L - (k * L / (n - 1));
        prog.setAttribute("stroke-dashoffset", off);
        head.setAttribute("transform", "translate(" + pts[k].x + "," + pts[k].y + ")");
      }
      paint();
      svg.addEventListener("pointerdown", function (e) {
        if (fin) return;
        var q = toStage(e), d = Math.hypot(q.x - pts[k].x, q.y - pts[k].y);
        if (d < 80) { drawing = true; svg.setPointerCapture(e.pointerId); }
        else { c.say(k === 0 ? p.startHint : p.resumeHint); }
        e.preventDefault();
      });
      svg.addEventListener("pointermove", function (e) {
        if (!drawing || fin) return;
        var q = toStage(e), best = k, bd = 1e9, lim = Math.min(n - 1, k + 40);
        for (var j = k; j <= lim; j++) { var d = Math.hypot(q.x - pts[j].x, q.y - pts[j].y); if (d < bd) { bd = d; best = j; } }
        if (bd < 46 && best > k) { k = best; paint(); }
        if (k >= n - 4) { k = n - 1; paint(); fin = true; drawing = false; c.snd.ok(); c.burst(end, 26); win(); }
      });
      var stop = function () { drawing = false; };
      svg.addEventListener("pointerup", stop); svg.addEventListener("pointercancel", stop);
      function win() {
        if (r < p.rounds.length - 1) { c.say(R.done); c.next("Даље ➜", function () { r++; round(); }); }
        else c.finish(R.done + (p.bonus ? " " + p.bonus : ""), idx);
      }
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Mreža: u svakom redu i koloni svaka stvar samo jednom
  GAMES.grid = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r]; root.textContent = ""; nextBtn.hidden = true;
      root.classList.add("grid-scene");
      var grid = h("div", { class: "grid3" }), holeCell = null;
      R.grid.forEach(function (row, y) {
        row.forEach(function (v, x) {
          var cell = h("div", { class: "cell" });
          if (y === R.hole[0] && x === R.hole[1]) { cell.className = "cell hole"; cell.textContent = "?"; holeCell = cell; }
          else cell.appendChild(img(R.symbols[v], { alt: N(R.symbols[v]) }));
          grid.appendChild(cell);
        });
      });
      var correct = R.grid[R.hole[0]][R.hole[1]];
      var row = h("div", { class: "row" }), btns = [];
      R.symbols.forEach(function (k, v) {
        var b = h("button", { class: "card", "aria-label": N(k) }, img(k), h("div", { class: "nm", text: "" }));
        b.onclick = function () {
          if (v === correct) {
            c.snd.ok(); holeCell.className = "cell filled"; holeCell.textContent = ""; holeCell.appendChild(img(k)); c.burst(holeCell, 24);
            btns.forEach(function (x) { x.disabled = true; });
            if (r < p.rounds.length - 1) { c.say(R.fact); c.next("Даље ➜", function () { r++; round(); }); }
            else c.finish(R.fact + (p.bonus ? " " + p.bonus : ""), idx);
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); c.say(p.hint); }
        };
        btns.push(b); row.appendChild(b);
      });
      root.appendChild(grid);
      root.appendChild(h("div", { class: "choices" }, h("h3", { text: p.question }), row));
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Izbor: model (običan ili silueta) i ponuđeni odgovori; jedan je tačan
  GAMES.choose = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r]; root.textContent = ""; nextBtn.hidden = true;
      root.classList.add("choose-scene");
      var model = h("div", { class: "model card" }, img(R.model, { class: R.silhouette ? "sil" : "" }), h("div", { class: "nm", text: R.silhouette ? "" : N(R.model) }));
      var cards = h("div", { class: "choices-row" });
      R.choices.forEach(function (ch, i) {
        var key = typeof ch === "string" ? ch : ch.key, tr = typeof ch === "string" ? "" : ch.transform || "";
        var im = img(key); if (tr) im.style.transform = tr;
        var b = h("button", { class: "card", "aria-label": N(key) }, im, h("div", { class: "nm", text: R.hideNames ? "" : N(key) }));
        b.onclick = function () {
          if (i === R.right) {
            c.snd.ok(); b.classList.add("right");
            Array.prototype.forEach.call(cards.children, function (x) { x.disabled = true; if (x !== b) x.classList.add("dim"); });
            if (R.silhouette) model.querySelector("img").classList.remove("sil");
            c.burst(b, 22);
            if (r < p.rounds.length - 1) { c.say(R.fact); c.next("Даље ➜", function () { r++; round(); }); }
            else c.finish(R.fact + (p.bonus ? " " + p.bonus : ""), idx);
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); c.say(p.hint); }
        };
        cards.appendChild(b);
      });
      root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: R.title || p.title }),
        h("div", { class: "rounddots" }, p.rounds.map(function (_, i) { return h("b", { class: i <= r ? "on" : "" }); }))));
      root.appendChild(model); root.appendChild(cards);
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Razvrstaj: jedna po jedna stvar ide u odgovarajuću korpu
  GAMES.sort = function (root, p, c, idx) {
    var i = 0, bins = [], itemCard = null;
    root.classList.add("sort-scene");
    root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: p.title })));
    var dots = h("div", { class: "rounddots" }); root.firstChild.appendChild(dots);
    var binsEl = h("div", { class: "bins bins" + p.bins.length });
    function paintDots() { dots.textContent = ""; p.items.forEach(function (_, k) { dots.appendChild(h("b", { class: k < i ? "on" : "" })); }); }
    p.bins.forEach(function (B, bi) {
      var thumbs = h("div", { class: "thumbs" });
      var b = h("button", { class: "bin", style: "--c:" + (B.color || "#3f7cb8") }, h("div", { class: "lbl", text: B.label }), thumbs);
      b.onclick = function () { choose(bi, b, thumbs); };
      bins.push(b); binsEl.appendChild(b);
    });
    root.appendChild(binsEl);
    function show() {
      if (itemCard) itemCard.remove();
      var it = p.items[i];
      itemCard = h("div", { class: "item card" }, img(it.key), h("div", { class: "nm", text: N(it.key) }));
      root.appendChild(itemCard); paintDots();
    }
    var busy = false;
    function choose(bi, b, thumbs) {
      if (busy) return;
      var it = p.items[i];
      if (bi === it.bin) {
        busy = true; c.snd.ok(); c.burst(b, 14);
        var t = img(it.key, { class: "thumb" }); thumbs.appendChild(t);
        itemCard.classList.add("right");
        i++;
        function advance() { busy = false; if (i < p.items.length) show(); else finishAll(); }
        if (it.fact && i < p.items.length) { c.say(it.fact); c.next("Даље ➜", advance); }
        else if (i < p.items.length) { c.say(p.ok || "Тачно!"); setTimeout(advance, 650); }
        else advance();
      } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); c.say(it.hint || p.hint); }
    }
    function finishAll() {
      if (itemCard) itemCard.remove(); paintDots();
      var last = p.items[p.items.length - 1];
      c.finish((last.fact ? last.fact + " " : "") + p.doneMsg, idx);
    }
    show();
  };

  // Redosled: dodirni redom (od najmanjeg do najvećeg, od prvog do poslednjeg)
  GAMES.order = function (root, p, c, idx) {
    root.classList.add("order-scene");
    root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: p.title })));
    var row = h("div", { class: "order-row" }), got = 0, total = p.items.length;
    root.appendChild(h("div", { class: "ground" })); root.appendChild(row);
    p.show.forEach(function (k) {
      var it = p.items[k];
      var im = img(it.key); im.style.height = (it.size || 1) * (p.base || 220) + "px";
      var badge = h("span", { class: "rank", text: "" });
      var b = h("button", { class: "ob", "aria-label": N(it.key) }, im, badge);
      b.onclick = function () {
        if (b.dataset.done) return;
        if (it.rank === got + 1) {
          got++; b.dataset.done = "1"; badge.textContent = String(got); b.classList.add("right"); c.snd.ok(); c.burst(b, 12);
          if (got < total) c.say(p.next.replace("{n}", String(got + 1)));
          else c.finish(p.doneMsg, idx);
        } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); c.say(p.hint.replace("{n}", String(got + 1))); }
      };
      row.appendChild(b);
    });
  };

  // Kopanje: prstom/mišem skloni zemlju i otkrij šta je ispod
  GAMES.dig = function (root, p, c, idx) {
    root.classList.add("dig-scene");
    var CW = 820, CH = 450;
    var box = h("div", { class: "dig-box" });
    p.under.forEach(function (u) { var im = img(u.key, { class: "under" }); im.style.cssText = "left:" + u.x + "px;top:" + u.y + "px;height:" + u.h + "px"; box.appendChild(im); });
    var cv = h("canvas", { width: CW, height: CH, class: "dirt" });
    box.appendChild(cv); root.appendChild(box);
    root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: p.title })));
    var g = cv.getContext("2d");
    g.fillStyle = p.dirt || "#8b5a34"; g.fillRect(0, 0, CW, CH);
    for (var k = 0; k < 900; k++) { g.fillStyle = ["#7a4c2a", "#9c6a40", "#6e4426", "#a8774b"][k % 4]; g.beginPath(); g.arc(Math.random() * CW, Math.random() * CH, 3 + Math.random() * 9, 0, 6.3); g.fill(); }
    g.globalCompositeOperation = "destination-out";
    var drawing = false, last = null, moves = 0, done = false, hinted = false;
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width, y: (e.clientY - r.top) * CH / r.height }; }
    function brush(a, b) {
      g.lineCap = "round"; g.lineWidth = 78; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    function cleared() {
      var d = g.getImageData(0, 0, CW, CH).data, tot = 0, clr = 0;
      p.under.forEach(function (u) {
        var x0 = u.x, y0 = u.y, w = u.h * (u.ratio || 1), h2 = u.h;
        for (var yy = y0; yy < y0 + h2; yy += 14) for (var xx = x0; xx < x0 + w; xx += 14) { tot++; if (d[((Math.min(CH - 1, yy | 0)) * CW + Math.min(CW - 1, xx | 0)) * 4 + 3] < 40) clr++; }
      });
      return clr / Math.max(1, tot);
    }
    cv.addEventListener("pointerdown", function (e) { if (done) return; drawing = true; cv.setPointerCapture(e.pointerId); last = pos(e); brush(last, last); e.preventDefault(); });
    cv.addEventListener("pointermove", function (e) {
      if (!drawing || done) return;
      var q = pos(e); brush(last, q); last = q; moves++;
      if (!hinted && moves > 12) { hinted = true; c.say(p.keep); }
      if (moves % 8 === 0 && cleared() > 0.62) win();
    });
    var stop = function () { drawing = false; if (!done && cleared() > 0.62) win(); };
    cv.addEventListener("pointerup", stop); cv.addEventListener("pointercancel", stop);
    function win() { done = true; cv.style.transition = "opacity .6s"; cv.style.opacity = 0; c.burst(box, 30); c.finish(p.doneMsg, idx); }
  };

  // Šta fali: gornji red je ceo, u donjem jedna stvar fali
  GAMES.missing = function (root, p, c, idx) {
    var r = 0;
    function row(keys, hole) {
      var el = h("div", { class: "mrow" });
      keys.forEach(function (k) { el.appendChild(k == null ? (hole.el = h("div", { class: "hole", text: "?" })) : img(k)); });
      return el;
    }
    function round() {
      var R = p.rounds[r], hole = {}; root.textContent = ""; nextBtn.hidden = true;
      root.classList.add("missing-scene");
      root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: R.title || p.title }),
        h("div", { class: "rounddots" }, p.rounds.map(function (_, i) { return h("b", { class: i <= r ? "on" : "" }); }))));
      root.appendChild(h("div", { class: "rows" }, row(R.top, hole), row(R.bottom, hole)));
      var cards = h("div", { class: "choices-row" });
      R.choices.forEach(function (k, i) {
        var b = h("button", { class: "card", "aria-label": N(k) }, img(k), h("div", { class: "nm", text: N(k) }));
        b.onclick = function () {
          if (i === R.right) {
            c.snd.ok(); b.classList.add("right");
            Array.prototype.forEach.call(cards.children, function (x) { x.disabled = true; if (x !== b) x.classList.add("dim"); });
            hole.el.textContent = ""; hole.el.className = "hole filled"; hole.el.appendChild(img(R.choices[R.right]));
            c.burst(hole.el, 22);
            if (r < p.rounds.length - 1) { c.say(R.fact); c.next("Даље ➜", function () { r++; round(); }); }
            else c.finish(R.fact + (p.bonus ? " " + p.bonus : ""), idx);
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); c.say(p.hint); }
        };
        cards.appendChild(b);
      });
      root.appendChild(cards);
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Svaki n-ti: dodirni svaku treću (četvrtu...) sliku u redu
  GAMES.nth = function (root, p, c, idx) {
    var n = p.n || 3, left = 0, rowsEl = h("div", { class: "nth-rows" });
    root.classList.add("nth-scene");
    root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: p.title })));
    p.rows.forEach(function (keys, ri) {
      var row = h("div", { class: "nth-row" });
      keys.forEach(function (k, i) {
        var target = (i + 1) % n === 0; if (target) left++;
        var b = h("button", { class: "nb", "aria-label": N(k) }, img(k), h("span", { class: "cnt", text: String((i % n) + 1) }));
        b.onclick = function () {
          if (b.dataset.done) return;
          if (target) {
            b.dataset.done = "1"; b.classList.add("hit"); c.snd.ok(); c.burst(b, 10); left--;
            if (left === 0) c.finish(p.doneMsg, idx);
            else c.say(p.next);
          } else { c.snd.no(); row.classList.add("counted"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); c.say(p.hint); }
        };
        row.appendChild(b);
      });
      rowsEl.appendChild(row);
    });
    root.appendChild(rowsEl);
  };

  // Nalepnice: slaganje sopstvenog znaka (štit, životinja...) sa tačno toliko znakova koliko ima mesta
  function badgeSVG(cfg, state, interactive, onSlot) {
    var svg = svgEl("svg", { viewBox: "0 0 300 360", class: "shield-svg" });
    if (cfg.shape === "image") {
      var bx = cfg.baseBox || [10, 20, 280, 320];
      svg.appendChild(svgEl("image", { href: A(cfg.base), x: bx[0], y: bx[1], width: bx[2], height: bx[3], preserveAspectRatio: "xMidYMid meet" }));
    } else {
      svg.appendChild(svgEl("path", { d: "M20 30 H280 V170 C280 262 222 322 150 348 C78 322 20 262 20 170 Z", fill: state.color, stroke: "#3a1a14", "stroke-width": 9, "stroke-linejoin": "round" }));
      svg.appendChild(svgEl("path", { d: "M34 44 H266 V170 C266 250 214 306 150 331 C86 306 34 250 34 170 Z", fill: "none", stroke: "rgba(255,255,255,.55)", "stroke-width": 4 }));
    }
    var R = cfg.slotR || 40;
    cfg.slots.forEach(function (pt, i) {
      var k = state.slots[i], g = svgEl("g", { transform: "translate(" + pt[0] + "," + pt[1] + ")" });
      if (k) {
        var isDot = k.indexOf("dot") === 0;   // „dot…“ znakovi (tačke) idu bez bele podloge
        if (!isDot) g.appendChild(svgEl("circle", { r: R, fill: "#fff", stroke: "#3a1a14", "stroke-width": 4 }));
        if (ART[k]) { var st = svgEl("g"); st.innerHTML = ART[k]; if (isDot) st.setAttribute("transform", "scale(" + R / 26 + ")"); g.appendChild(st); }
        else g.appendChild(svgEl("image", { href: A(k), x: -R * 0.75, y: -R * 0.75, width: R * 1.5, height: R * 1.5, preserveAspectRatio: "xMidYMid meet" }));
      } else if (interactive) {
        g.appendChild(svgEl("circle", { r: R - 4, fill: "rgba(255,255,255,.35)", stroke: "rgba(58,26,20,.45)", "stroke-width": 4, "stroke-dasharray": "8 7" }));
      }
      if (interactive && onSlot) { g.setAttribute("class", "slot-hit"); g.addEventListener("click", function () { onSlot(i); }); }
      svg.appendChild(g);
    });
    return svg;
  }
  GAMES.stickers = function (root, p, c, idx) {
    root.classList.add("shield-scene");
    var sh = S.badge, finished = false, shieldEl, dots = h("div", { class: "dots" }), need = p.slots.length;
    function count() { return sh.slots.filter(Boolean).length; }
    function redraw() {
      var n = badgeSVG(p, sh, true, function (i) { if (sh.slots[i]) { sh.slots[i] = null; SND.tap(); redraw(); c.say(p.removed); } });
      if (shieldEl) root.replaceChild(n, shieldEl); else root.appendChild(n);
      shieldEl = n;
      dots.textContent = ""; sh.slots.forEach(function (s, i) { dots.appendChild(h("b", { class: s ? "on" : "", text: s ? "✓" : String(i + 1) })); });
    }
    root.appendChild(dots);
    var panel = h("div", { class: "panel" });
    if (p.colors) {
      var sw = h("div", { class: "swatches" });
      p.colors.forEach(function (col) {
        var b = h("button", { class: "swatch", style: "--c:" + col, "aria-label": "боја", "aria-pressed": col === sh.color ? "true" : "false" });
        b.onclick = function () { sh.color = col; SND.tap(); Array.prototype.forEach.call(sw.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); redraw(); };
        sw.appendChild(b);
      });
      panel.appendChild(h("h3", { text: "1. " + (p.colorTitle || "БОЈА") })); panel.appendChild(sw);
    }
    panel.appendChild(h("h3", { text: (p.colors ? "2. " : "") + p.trayTitle }));
    var tray = h("div", { class: "tray" });
    p.emblems.forEach(function (k) {
      var inner;
      if (ART[k]) { inner = svgEl("svg", { viewBox: "-40 -40 80 80", width: 70, height: 70 }); inner.innerHTML = ART[k]; } else inner = img(k);
      var b = h("button", { class: "card", "aria-label": N(k) || (ART[k] ? "знак" : "") }, inner);
      b.onclick = function () {
        var free = sh.slots.indexOf(null);
        if (free < 0) { c.snd.no(); c.say(p.full); return; }
        sh.slots[free] = k; SND.tap(); redraw();
        if (count() === need && !finished) { finished = true; c.burst(shieldEl, 30); c.finish(p.doneMsg, idx); }
        else if (count() < need) c.say(p.left.replace("{n}", String(need - count())));
      };
      tray.appendChild(b);
    });
    panel.appendChild(tray); root.appendChild(panel);
    redraw();
  };

  /* ---------- zaključivanje (Mali detektiv) ---------- */
  function roundHead(p, R, r) {
    return h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: R.title || p.title }),
      p.rounds.length > 1 ? h("div", { class: "rounddots" }, p.rounds.map(function (_, i) { return h("b", { class: i <= r ? "on" : "" }); })) : null);
  }
  function cluesPanel(list) {
    var ol = h("ol", { class: "clues" });
    list.forEach(function (t) {
      var li = h("li", { tabindex: "0", role: "button" }, h("span", { text: typeof t === "string" ? t : t.text }));
      li.onclick = function () { li.classList.toggle("done"); SND.tap(); };
      li.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); } };
      ol.appendChild(li);
    });
    return h("div", { class: "cluebox" }, h("h3", { text: "ТРАГОВИ" }), ol, h("div", { class: "cluehint", text: "додирни траг кад га искористиш" }));
  }
  function rowsDone(r, p, R, c, idx, fact) {
    if (r < p.rounds.length - 1) { c.say(fact); return false; }
    c.finish(fact + (p.bonus ? " " + p.bonus : ""), idx); return true;
  }

  // Imena i tragovi: dodeli imena slikama po redu (sleva nadesno)
  GAMES.assign = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], n = R.slots.length, got = R.slots.map(function () { return -1; }), sel = -1, done = false;
      root.textContent = ""; nextBtn.hidden = true; root.classList.add("assign-scene");
      root.appendChild(roundHead(p, R, r));
      var slotEls = [], chipEls = [];
      var slotsEl = h("div", { class: "as-slots s" + n }), chipsEl = h("div", { class: "as-chips" });
      var check = h("button", { class: "big-btn as-check", text: "ПРОВЕРИ ✓", hidden: "" });
      R.slots.forEach(function (k, i) {
        var line = h("div", { class: "as-line" }), pos = h("div", { class: "as-pos", text: String(i + 1) });
        var b = h("button", { class: "as-slot", "aria-label": "место " + (i + 1) }, pos, img(k), line);
        b.onclick = function () {
          if (done) return;
          if (sel >= 0) { got[i] = sel; sel = -1; SND.tap(); }
          else if (got[i] >= 0) { got[i] = -1; SND.tap(); }
          paint();
        };
        slotEls.push({ b: b, line: line }); slotsEl.appendChild(b);
      });
      R.names.forEach(function (nm, k) {
        var ch = h("button", { class: "nm-chip", text: nm });
        ch.onclick = function () {
          if (done) return;
          var at = got.indexOf(k);
          if (at >= 0) { got[at] = -1; sel = k; } else sel = sel === k ? -1 : k;
          SND.tap(); paint();
        };
        chipEls.push(ch); chipsEl.appendChild(ch);
      });
      function paint() {
        slotEls.forEach(function (s, i) { s.line.textContent = got[i] >= 0 ? R.names[got[i]] : ""; s.b.classList.toggle("has", got[i] >= 0); });
        chipEls.forEach(function (ch, k) { ch.classList.toggle("used", got.indexOf(k) >= 0); ch.classList.toggle("sel", sel === k); });
        check.hidden = got.indexOf(-1) >= 0 || done;
      }
      check.onclick = function () {
        var ok = got.every(function (v, i) { return v === R.solution[i]; });
        if (ok) {
          done = true; c.snd.ok(); paint(); slotEls.forEach(function (s) { s.b.classList.add("right"); }); c.burst(slotsEl, 26);
          if (rowsDone(r, p, R, c, idx, R.fact)) return;
          c.next("Даље ➜", function () { r++; round(); });
        } else {
          c.snd.no(); slotEls.forEach(function (s) { s.b.classList.remove("shake"); void s.b.offsetWidth; s.b.classList.add("shake"); }); c.say(p.hint);
        }
      };
      root.appendChild(slotsEl); root.appendChild(h("div", { class: "as-note", text: R.note || "Слике броји с лева на десно." }));
      root.appendChild(chipsEl); root.appendChild(check); root.appendChild(cluesPanel(R.clues));
      paint(); c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Tabela: ✕ gde ne može, ✓ gde mora
  GAMES.table = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], done = false, lastConflict = "";
      var st = R.tables.map(function () { return R.rows.map(function () { return R.tables[0].cols.map(function () { return 0; }); }); });
      st = R.tables.map(function (T) { return R.rows.map(function () { return T.cols.map(function () { return 0; }); }); });
      root.textContent = ""; nextBtn.hidden = true; root.classList.add("table-scene");
      root.appendChild(roundHead(p, R, r));
      var wrap = h("div", { class: "tables t" + R.tables.length }), cells = [];
      R.tables.forEach(function (T, ti) {
        var tb = h("table", { class: "dt c" + T.cols.length }), head = h("tr", null, h("th", { class: "corner", text: T.title || "" }));
        T.cols.forEach(function (col) { head.appendChild(h("th", { class: "colh" }, col.t ? h("span", { text: col.t }) : img(col.k, { alt: N(col.k) }))); });
        tb.appendChild(head); cells[ti] = [];
        R.rows.forEach(function (nm, ri) {
          var tr = h("tr", null, h("th", { class: "rowh", text: nm })); cells[ti][ri] = [];
          T.cols.forEach(function (_, ci) {
            var b = h("button", { class: "cell0", "aria-label": nm + ", колона " + (ci + 1) + ": празно" });
            b.onclick = function () { if (done) return; st[ti][ri][ci] = (st[ti][ri][ci] + 1) % 3; SND.tap(); redraw(); verify(ti, ri, ci); };
            cells[ti][ri][ci] = b; tr.appendChild(h("td", null, b));
          });
          tb.appendChild(tr);
        });
        wrap.appendChild(tb);
      });
      root.appendChild(wrap); root.appendChild(cluesPanel(R.clues));
      function redraw() {
        st.forEach(function (T, ti) { T.forEach(function (row, ri) { row.forEach(function (v, ci) {
          var b = cells[ti][ri][ci]; b.textContent = v === 1 ? "✕" : v === 2 ? "✓" : ""; b.className = "cell0" + (v === 1 ? " x" : v === 2 ? " v" : "");
        }); }); });
      }
      function verify(ti, ri, ci) {
        var T = st[ti], msg = "";
        if (T[ri][ci] === 2) {
          var rowN = T[ri].filter(function (v) { return v === 2; }).length, colN = T.filter(function (row) { return row[ci] === 2; }).length;
          if (rowN > 1 || colN > 1) msg = p.conflict;
        }
        if (msg) { c.snd.no(); cells[ti][ri][ci].classList.add("shake"); if (lastConflict !== msg) c.say(msg); lastConflict = msg; return; }
        lastConflict = "";
        var all = st.every(function (T2, t2) { return T2.every(function (row, r2) { return row.every(function (v, c2) { return (v === 2) === (R.solution[t2][r2] === c2); }); }); });
        if (all) {
          done = true; c.snd.ok(); c.burst(wrap, 28);
          if (rowsDone(r, p, R, c, idx, R.fact)) return;
          c.next("Даље ➜", function () { r++; round(); });
        }
      }
      c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Bojenje po tragovima
  var COL = { red: "#e4553f", blue: "#3f7cb8", yellow: "#f0b429", green: "#5aa24a" };
  var COLNAME = { red: "црвена", blue: "плава", yellow: "жута", green: "зелена" };
  var PS = 'stroke="#3a1a14" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
  function rays(cx, cy, r1, r2) { var s = ""; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += '<line x1="' + (cx + Math.cos(a) * r1).toFixed(1) + '" y1="' + (cy + Math.sin(a) * r1).toFixed(1) + '" x2="' + (cx + Math.cos(a) * r2).toFixed(1) + '" y2="' + (cy + Math.sin(a) * r2).toFixed(1) + '" ' + PS + '/>'; } return s; }
  var SHAPES = {
    sun: function () { return { w: 140, h: 140, svg: rays(70, 70, 44, 64) + '<circle class="f" cx="70" cy="70" r="38" fill="#fff" ' + PS + '/>' }; },
    house: function () { return { w: 170, h: 160, svg: '<path class="f" fill="#fff" ' + PS + ' d="M10 80 L85 12 L160 80 L146 80 L146 150 L24 150 L24 80 Z"/><rect x="72" y="98" width="30" height="52" fill="#fff" ' + PS + '/><rect x="34" y="94" width="26" height="26" fill="#fff" ' + PS + '/><rect x="112" y="94" width="26" height="26" fill="#fff" ' + PS + '/>' }; },
    tree: function () { return { w: 140, h: 210, svg: '<rect x="56" y="120" width="28" height="86" fill="#b98a5a" ' + PS + '/><circle class="f" cx="70" cy="70" r="60" fill="#fff" ' + PS + '/>' }; },
    flower: function () { return { w: 110, h: 180, svg: '<path d="M55 90 V176" fill="none" stroke="#3b8a3a" stroke-width="8" stroke-linecap="round"/><path d="M55 140 q-30 -8 -34 -30 q26 2 34 30z" fill="#7fc36a" ' + PS + '/>' + [0, 1, 2, 3, 4].map(function (i) { var a = i * 1.2566 - 1.57; return '<circle class="f" cx="' + (55 + Math.cos(a) * 28).toFixed(1) + '" cy="' + (52 + Math.sin(a) * 28).toFixed(1) + '" r="20" fill="#fff" ' + PS + '/>'; }).join("") + '<circle cx="55" cy="52" r="14" fill="#fff" ' + PS + '/>' }; },
    balloon: function () { return { w: 100, h: 190, svg: '<path d="M50 112 q-10 14 4 28 q12 14 -2 44" fill="none" ' + PS + '/><path class="f" fill="#fff" ' + PS + ' d="M50 108 C10 100 4 60 18 34 C32 8 68 8 82 34 C96 60 90 100 50 108 Z"/>' }; },
    cube: function () { return { w: 120, h: 120, svg: '<rect class="f" x="8" y="8" width="104" height="104" rx="14" fill="#fff" ' + PS + '/><path d="M28 30 h22" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".0"/>' }; },
    win: function () { return { w: 108, h: 108, svg: '<rect class="f" x="6" y="6" width="96" height="96" rx="6" fill="#fff" ' + PS + '/><path d="M54 6 V102 M6 54 H102" fill="none" ' + PS + '/>' }; },
    fish: function (o) { return { w: 180, h: 110, svg: '<path class="f" fill="#fff" ' + PS + ' d="M10 55 C30 14 100 8 130 52 C100 98 30 96 10 55 Z"/><path class="f" fill="#fff" ' + PS + ' d="M128 54 L172 18 L172 90 Z"/>' + (o.stripes ? '<path d="M50 20 q-10 34 0 70 M76 14 q-10 40 0 82 M102 20 q-8 34 0 64" fill="none" ' + PS + '/>' : "") + (o.dots ? '<circle cx="50" cy="44" r="6" fill="#3a1a14"/><circle cx="80" cy="64" r="6" fill="#3a1a14"/><circle cx="100" cy="40" r="6" fill="#3a1a14"/>' : "") + '<circle cx="34" cy="48" r="5.5" fill="#3a1a14"/>' }; },
  };
  GAMES.paint = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], pal = R.palette || ["red", "blue", "yellow", "green"], cur = null, done = false, filled = {};
      root.textContent = ""; nextBtn.hidden = true; root.classList.add("paint-scene");
      root.appendChild(roundHead(p, R, r));
      var svg = svgEl("svg", { viewBox: "0 0 760 420", class: "paint-svg" });
      svg.appendChild(svgEl("rect", { x: 0, y: 0, width: 760, height: 420, rx: 24, fill: "#fff", stroke: "#3a1a14", "stroke-width": 5 }));
      if (R.ground) svg.appendChild(svgEl("line", { x1: 30, y1: R.ground, x2: 730, y2: R.ground, stroke: "#3a1a14", "stroke-width": 5, "stroke-linecap": "round" }));
      var gEls = {};
      R.shapes.forEach(function (S2) {
        var D = SHAPES[S2.type](S2), g = svgEl("g", { transform: "translate(" + S2.x + "," + S2.y + ") scale(" + (S2.s || 1) + ")", class: "pshape", tabindex: "0", role: "button", "aria-label": S2.label || S2.type });
        g.innerHTML = D.svg + '<rect x="-6" y="-6" width="' + (D.w + 12) + '" height="' + (D.h + 12) + '" fill="transparent"/>';
        function paintIt() {
          if (done) return;
          if (!cur) { c.say(p.pick); return; }
          Array.prototype.forEach.call(g.querySelectorAll(".f"), function (e) { e.setAttribute("fill", COL[cur]); });
          filled[S2.id] = cur; SND.tap(); check();
        }
        g.addEventListener("click", paintIt); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); paintIt(); } });
        gEls[S2.id] = g; svg.appendChild(g);
      });
      var crayons = h("div", { class: "crayons" });
      pal.forEach(function (k) {
        var b = h("button", { class: "crayon", style: "--c:" + COL[k], "aria-pressed": "false", "aria-label": COLNAME[k] + " боја" });
        b.onclick = function () { cur = k; SND.tap(); Array.prototype.forEach.call(crayons.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); };
        crayons.appendChild(b);
      });
      function check() {
        if (R.shapes.some(function (S2) { return !filled[S2.id]; })) return;
        var ok = R.shapes.every(function (S2) { return filled[S2.id] === R.solution[S2.id]; });
        if (ok) {
          done = true; c.snd.ok(); c.burst(svg, 30);
          if (rowsDone(r, p, R, c, idx, R.fact)) return;
          c.next("Даље ➜", function () { r++; round(); });
        } else { c.snd.no(); svg.classList.remove("shake"); void svg.getBoundingClientRect(); svg.classList.add("shake"); c.say(p.hint); }
      }
      root.appendChild(svg); root.appendChild(h("div", { class: "palette" }, h("h3", { text: "БОЈИЦЕ" }), crayons));
      root.appendChild(cluesPanel(R.clues));
      c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Precrtavanje: svaki trag izbaci tačno one koji se ne slažu
  GAMES.eliminate = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], alive = R.animals.map(function () { return true; }), step = 0, finished = false;
      root.textContent = ""; nextBtn.hidden = true; root.classList.add("elim-scene");
      root.appendChild(roundHead(p, R, r));
      var strip = h("div", { class: "clue-strip" }), cards = h("div", { class: "elim-cards n" + R.animals.length }), btns = [];
      function fails(a, cl) { var has = a.traits.indexOf(cl.trait) >= 0; return cl.has ? !has : has; }
      function showClue() { strip.textContent = ""; strip.appendChild(h("span", { class: "cs-n", text: "Траг " + (step + 1) + " од " + R.clues.length })); strip.appendChild(h("span", { class: "cs-t", text: R.clues[step].text })); }
      R.animals.forEach(function (a, i) {
        var b = h("button", { class: "card elim", "aria-label": N(a.key) }, img(a.key), h("div", { class: "nm", text: R.hideNames ? "" : N(a.key) }), h("span", { class: "xx", text: "✕" }));
        b.onclick = function () {
          if (finished || !alive[i]) return;
          var cl = R.clues[step];
          if (fails(a, cl)) {
            alive[i] = false; b.classList.add("out"); c.snd.tap();
            var left = R.animals.some(function (a2, j) { return alive[j] && fails(a2, cl); });
            if (!left) {
              step++;
              if (step >= R.clues.length) {
                finished = true; c.snd.ok();
                btns.forEach(function (x, j) { if (alive[j]) x.classList.add("right"); }); c.burst(cards, 26);
                if (rowsDone(r, p, R, c, idx, R.fact)) return;
                c.next("Даље ➜", function () { r++; round(); });
              } else { c.say(p.stepOk); showClue(); }
            }
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); c.say(p.hint); }
        };
        btns.push(b); cards.appendChild(b);
      });
      root.appendChild(strip); root.appendChild(cards); showClue();
      c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Brojevi: jednačina sa slikama ili piramida; bira se broj koji fali
  GAMES.numq = function (root, p, c, idx) {
    var r = 0;
    function tok(t) {
      if (t.img) return img(t.img, { class: "tk-img", style: t.s ? "height:" + t.s + "px" : "" });
      if (t.t) return h("span", { class: "tk-t", text: t.t });
      if (t.n != null) return h("span", { class: "tk-n", text: String(t.n) });
      if (t.b != null) return h("span", { class: "brick", text: String(t.b) });
      if (t.bq) return h("span", { class: "brick q", text: "?" });
      return h("span", { class: "tk-q", text: "?" });
    }
    function round() {
      var R = p.rounds[r]; root.textContent = ""; nextBtn.hidden = true; root.classList.add("numq-scene");
      root.appendChild(roundHead(p, R, r));
      var board = h("div", { class: "nboard " + (R.style || "eq") }), qEls = [];
      R.rows.forEach(function (row) { var line = h("div", { class: "nrow" }); row.forEach(function (t) { var e = tok(t); if (t.q || t.bq) qEls.push(e); line.appendChild(e); }); board.appendChild(line); });
      var keys = h("div", { class: "nkeys" }), done = false;
      R.choices.forEach(function (v) {
        var b = h("button", { class: "nkey", text: String(v) });
        b.onclick = function () {
          if (done) return;
          if (v === R.answer) {
            done = true; c.snd.ok(); qEls.forEach(function (e) { e.textContent = String(v); e.classList.add("ok"); }); b.classList.add("right"); c.burst(board, 24);
            if (rowsDone(r, p, R, c, idx, R.fact)) return;
            c.next("Даље ➜", function () { r++; round(); });
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); c.say(p.hint); }
        };
        keys.appendChild(b);
      });
      root.appendChild(board); root.appendChild(h("div", { class: "nask", text: R.ask || "Који број иде на место питања?" })); root.appendChild(keys);
      c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  /* ---------- mozgalice ---------- */
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffled(arr, seed) { var a = arr.slice(), r = rng(seed || 1); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var T = window.__T = {};
  var SHAPE = {
    circle: '<circle cx="50" cy="50" r="40"/>', square: '<rect x="12" y="12" width="76" height="76" rx="6"/>',
    triangle: '<polygon points="50,10 92,86 8,86"/>', diamond: '<polygon points="50,4 96,50 50,96 4,50"/>',
    oval: '<ellipse cx="50" cy="50" rx="44" ry="27"/>',
    heart: '<path d="M50 88 C10 58 6 30 28 20 C40 14 48 22 50 30 C52 22 60 14 72 20 C94 30 90 58 50 88Z"/>',
    star: '<polygon points="50,6 61,36 94,38 68,58 77,90 50,72 23,90 32,58 6,38 39,36"/>'
  };
  function shapeSvg(type, size, fill, rot) {
    var s = svgEl("svg", { viewBox: "0 0 100 100", width: size, height: size });
    s.innerHTML = '<g fill="' + (fill || "#fff") + '" stroke="#3a1a14" stroke-width="5" stroke-linejoin="round"' + (rot ? ' transform="rotate(' + rot + ' 50 50)"' : "") + ">" + SHAPE[type] + "</g>";
    return s;
  }
  function doneRound(r, p, c, idx, fact, redo) {
    if (r < p.rounds.length - 1) { c.say(fact || ""); c.next("Даље ➜", redo); return false; }
    c.finish((fact || "") + (p.bonus ? " " + p.bonus : ""), idx); return true;
  }
  function wrongShake(el, c, msg) { c.snd.no(); el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); if (msg) c.say(msg); }

  // Spoji iste: levo i desno su iste slike
  GAMES.match = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], n = R.keys.length, order = R.right || shuffled([].slice.call(Array(n).keys()), 11 + r), sel = -1, got = 0, done = {};
      root.textContent = ""; nextBtn.hidden = true; root.classList.add("match-scene");
      root.appendChild(roundHead(p, R, r));
      var gap = Math.min(112, 440 / n), y = function (i) { return 330 + (i - (n - 1) / 2) * gap; };
      var svg = svgEl("svg", { viewBox: "0 0 1280 720", class: "match-svg" }); root.appendChild(svg);
      var L = [], Rr = [];
      R.keys.forEach(function (k, i) {
        var b = h("button", { class: "mcard", style: "left:300px;top:" + (y(i) - 44) + "px", "aria-label": N(k) }, img(k));
        b.onclick = function () { if (done["l" + i]) return; sel = i; SND.tap(); paint(); };
        L.push(b); root.appendChild(b);
      });
      order.forEach(function (ki, j) {
        var k = R.keys[ki], b = h("button", { class: "mcard", style: "left:880px;top:" + (y(j) - 44) + "px", "aria-label": N(k) }, img(k));
        b.onclick = function () {
          if (sel < 0 || done["r" + j]) { if (sel < 0) c.say(p.pick || "Прво додирни слику лево."); return; }
          if (ki === sel) {
            done["l" + sel] = done["r" + j] = true; got++; c.snd.ok();
            svg.appendChild(svgEl("line", { x1: 420, y1: y(sel), x2: 880, y2: y(j), stroke: ["#e4553f", "#3f7cb8", "#f0b429", "#5aa24a", "#8456c6"][sel % 5], "stroke-width": 8, "stroke-linecap": "round" }));
            L[sel].classList.add("right"); b.classList.add("right"); sel = -1; paint();
            if (got === n) { c.burst(svg, 26); if (doneRound(r, p, c, idx, R.fact, function () { r++; round(); })) return; }
          } else wrongShake(b, c, p.hint);
        };
        Rr.push(b); root.appendChild(b);
      });
      function paint() { L.forEach(function (b, i) { b.classList.toggle("sel", sel === i); }); }
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Koliko ih ima
  GAMES.count = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], done = false; root.textContent = ""; nextBtn.hidden = true; root.classList.add("count-scene");
      root.appendChild(roundHead(p, R, r));
      var hgt = R.n <= 3 ? 150 : R.n <= 6 ? 112 : 84, panel = h("div", { class: "count-panel" });
      for (var i = 0; i < R.n; i++) panel.appendChild(img(R.key, { style: "height:" + hgt + "px" }));
      var keys = h("div", { class: "nkeys" });
      R.choices.forEach(function (v) {
        var b = h("button", { class: "nkey", text: String(v) });
        b.onclick = function () {
          if (done) return;
          if (v === R.n) { done = true; c.snd.ok(); b.classList.add("right"); c.burst(panel, 22); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
          else wrongShake(b, c, p.hint);
        };
        keys.appendChild(b);
      });
      root.appendChild(panel); root.appendChild(h("div", { class: "nask", text: p.ask || "Колико их има? Преброј прстом." })); root.appendChild(keys);
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Tačka do tačke
  GAMES.connect = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], k = 0, done = false; root.textContent = ""; nextBtn.hidden = true; root.classList.add("connect-scene");
      root.appendChild(roundHead(p, R, r));
      var svg = svgEl("svg", { viewBox: "0 0 760 440", class: "connect-svg" }); root.appendChild(svg);
      svg.appendChild(svgEl("rect", { x: 3, y: 3, width: 754, height: 434, rx: 26, fill: "#fff", stroke: "#3a1a14", "stroke-width": 5 }));
      var P = R.pts.map(function (q) { return [50 + q[0] * 6.6, 40 + q[1] * 3.6]; });
      var fillEl = svgEl("polygon", { points: "", fill: R.color || "#ffd23f", opacity: 0, stroke: "#3a1a14", "stroke-width": 6, "stroke-linejoin": "round" }); svg.appendChild(fillEl);
      var lines = svgEl("g"); svg.appendChild(lines);
      var dots = P.map(function (q, i) {
        var g = svgEl("g", { transform: "translate(" + q[0] + "," + q[1] + ")", class: "cdot", tabindex: "0", role: "button", "aria-label": "тачка " + (i + 1) });
        g.innerHTML = '<g class="cdin"><circle r="30" fill="transparent"/><circle class="cd" r="17" fill="#fff" stroke="#3a1a14" stroke-width="4"/><text y="7" text-anchor="middle" font-size="19" font-weight="900" fill="#3a1a14" font-family="Nunito,sans-serif">' + (i + 1) + "</text></g>";
        function tap() { hit(i); }
        g.addEventListener("click", tap); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } });
        svg.appendChild(g); return g;
      });
      function mark() { dots.forEach(function (g, i) { var cd = g.querySelector(".cd"); cd.setAttribute("fill", i < k ? "#ffd23f" : "#fff"); cd.setAttribute("stroke", i === k ? "#e4553f" : "#3a1a14"); cd.setAttribute("stroke-width", i === k ? 7 : 4); }); }
      function line(a, b) { lines.appendChild(svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#3a1a14", "stroke-width": 6, "stroke-linecap": "round" })); }
      function hit(i) {
        if (done) return;
        if (i !== k) { wrongShake(dots[i].firstChild, c, p.hint.replace("{n}", String(k + 1))); return; }
        c.snd.tap(); if (k > 0) line(P[k - 1], P[k]); k++; mark();
        if (k === P.length) {
          done = true; if (R.close) line(P[P.length - 1], P[0]);
          fillEl.setAttribute("points", P.map(function (q) { return q.join(","); }).join(" ")); fillEl.setAttribute("opacity", ".92"); lines.setAttribute("opacity", ".0");
          svg.appendChild(svgEl("polyline", { points: P.map(function (q) { return q.join(","); }).join(" ") + (R.close ? " " + P[0].join(",") : ""), fill: "none", stroke: "#3a1a14", "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round" }));
          dots.forEach(function (g) { g.style.display = "none"; });
          c.snd.ok(); c.burst(svg, 28); doneRound(r, p, c, idx, R.fact, function () { r++; round(); });
        }
      }
      mark(); T.connect = P.map(function (q) { var rc = svg.getBoundingClientRect(); return [rc.left + q[0] * rc.width / 760, rc.top + q[1] * rc.height / 440]; });
      T.connectPts = function () { var rc = svg.getBoundingClientRect(); return P.map(function (q) { return [rc.left + q[0] * rc.width / 760, rc.top + q[1] * rc.height / 440]; }); };
      c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Nađi sve oblike kao model
  GAMES.findall = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], left = R.cells.filter(function (q) { return q.t === R.target; }).length; root.textContent = ""; nextBtn.hidden = true; root.classList.add("findall-scene");
      root.appendChild(roundHead(p, R, r));
      root.appendChild(h("div", { class: "fa-model" }, shapeSvg(R.target, 120, "#fff"), h("div", { class: "fa-t", text: R.label || "нађи све" })));
      var grid = h("div", { class: "fa-grid c" + (R.cols || 4) });
      R.cells.forEach(function (q) {
        var b = h("button", { class: "fa-cell", "aria-label": q.t }, shapeSvg(q.t, 118 * (q.s || 1), q.col || "#fff", q.rot || 0)), isT = q.t === R.target;
        b.onclick = function () {
          if (b.dataset.done) return;
          if (isT) { b.dataset.done = "1"; b.classList.add("right"); c.snd.ok(); c.burst(b, 10); left--; if (left === 0) doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
          else wrongShake(b, c, p.hint);
        };
        grid.appendChild(b);
      });
      root.appendChild(grid); if (r > 0) c.say(p.again);
    }
    round();
  };

  // Lavirint
  GAMES.maze = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], cols = R.cols, rows = R.rows, cs = Math.min(660 / cols, 396 / rows), W = cols * cs, H = rows * cs, ox = 640 - W / 2, oy = 352 - H / 2;
      var cur = [0, 0], path = [[0, 0]], done = false, goal = [cols - 1, rows - 1];
      root.textContent = ""; nextBtn.hidden = true; root.classList.add("maze-scene");
      root.appendChild(roundHead(p, R, r));
      var svg = svgEl("svg", { viewBox: "0 0 1280 720", class: "maze-svg" }); root.appendChild(svg);
      svg.appendChild(svgEl("rect", { x: ox - 12, y: oy - 12, width: W + 24, height: H + 24, rx: 22, fill: "#fff", stroke: "#3a1a14", "stroke-width": 5 }));
      var trail = svgEl("polyline", { points: "", fill: "none", stroke: "#5bb581", "stroke-width": cs * 0.36, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.85 }); svg.appendChild(trail);
      var walls = svgEl("g", { stroke: "#3a1a14", "stroke-width": 6, "stroke-linecap": "round" }); svg.appendChild(walls);
      function seg(x1, y1, x2, y2) { walls.appendChild(svgEl("line", { x1: ox + x1 * cs, y1: oy + y1 * cs, x2: ox + x2 * cs, y2: oy + y2 * cs })); }
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var b = R.cells[y][x];
        if (!(b & 1) && y > 0) seg(x, y, x + 1, y);
        if (!(b & 8) && x > 0) seg(x, y, x, y + 1);
        if (!(b & 4) && y < rows - 1) seg(x, y + 1, x + 1, y + 1);
        if (!(b & 2) && x < cols - 1) seg(x + 1, y, x + 1, y + 1);
      }
      var isz = cs * 0.8;
      svg.appendChild(svgEl("image", { href: A(R.from), x: ox + (cs - isz) / 2, y: oy + (cs - isz) / 2, width: isz, height: isz, preserveAspectRatio: "xMidYMid meet" }));
      svg.appendChild(svgEl("image", { href: A(R.to), x: ox + goal[0] * cs + (cs - isz) / 2, y: oy + goal[1] * cs + (cs - isz) / 2, width: isz, height: isz, preserveAspectRatio: "xMidYMid meet" }));
      var head = svgEl("circle", { r: cs * 0.2, fill: "#e4553f", stroke: "#3a1a14", "stroke-width": 3 }); svg.appendChild(head);
      var DIRS = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
      function open(a, b2) { var dx = b2[0] - a[0], dy = b2[1] - a[1]; for (var i = 0; i < 4; i++) if (DIRS[i][0] === dx && DIRS[i][1] === dy) return !!(R.cells[a[1]][a[0]] & DIRS[i][2]); return false; }
      function bfs(a, b2) { var q = [[a, [a]]], seen = {}; seen[a] = 1; while (q.length) { var it = q.shift(), cc = it[0]; if (cc[0] === b2[0] && cc[1] === b2[1]) return it[1]; DIRS.forEach(function (d) { var nx = [cc[0] + d[0], cc[1] + d[1]]; if (nx[0] < 0 || nx[1] < 0 || nx[0] >= cols || nx[1] >= rows || seen[nx] || !open(cc, nx)) return; seen[nx] = 1; q.push([nx, it[1].concat([nx])]); }); } return null; }
      function redraw() {
        var pts = path.map(function (q) { return (ox + (q[0] + 0.5) * cs) + "," + (oy + (q[1] + 0.5) * cs); }).join(" "); trail.setAttribute("points", pts);
        head.setAttribute("cx", ox + (cur[0] + 0.5) * cs); head.setAttribute("cy", oy + (cur[1] + 0.5) * cs);
      }
      function goTo(cell) {
        if (done || (cell[0] === cur[0] && cell[1] === cur[1])) return;
        var pi = -1; path.forEach(function (q, i) { if (q[0] === cell[0] && q[1] === cell[1]) pi = i; });
        if (pi >= 0) { path = path.slice(0, pi + 1); cur = cell; redraw(); return; }
        var route = bfs(cur, cell); if (!route || route.length > 4) return;
        route.slice(1).forEach(function (q) { path.push(q); }); cur = cell; redraw();
        if (cur[0] === goal[0] && cur[1] === goal[1]) { done = true; c.snd.ok(); c.burst(svg, 30); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
      }
      function cellAt(e) { var q = toStage(e), x = Math.floor((q.x - ox) / cs), y2 = Math.floor((q.y - oy) / cs); return x < 0 || y2 < 0 || x >= cols || y2 >= rows ? null : [x, y2]; }
      var drag = false;
      svg.addEventListener("pointerdown", function (e) { var cl = cellAt(e); if (!cl) return; drag = true; svg.setPointerCapture(e.pointerId); if (Math.abs(cl[0] - cur[0]) + Math.abs(cl[1] - cur[1]) > 1 && !(cl[0] === 0 && cl[1] === 0)) c.say(p.startHint); goTo(cl); e.preventDefault(); });
      svg.addEventListener("pointermove", function (e) { if (!drag) return; var cl = cellAt(e); if (cl) goTo(cl); });
      var up = function () { drag = false; }; svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
      root.tabIndex = 0;
      window.addEventListener("keydown", function kh(e) { if (!root.isConnected) { window.removeEventListener("keydown", kh); return; } var d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key]; if (d == null) return; e.preventDefault(); var nx = [cur[0] + DIRS[d][0], cur[1] + DIRS[d][1]]; if (nx[0] >= 0 && nx[1] >= 0 && nx[0] < cols && nx[1] < rows && open(cur, nx)) goTo(nx); });
      T.mazePts = function () { var rc = svg.getBoundingClientRect(), s = rc.width / 1280, sol = bfs([0, 0], goal); return sol.map(function (q) { return [rc.left + (ox + (q[0] + 0.5) * cs) * s, rc.top + (oy + (q[1] + 0.5) * cs) * s]; }); };
      redraw(); c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Slovo u gužvi
  GAMES.letters = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], left = 0; root.textContent = ""; nextBtn.hidden = true; root.classList.add("letters-scene");
      R.grid.forEach(function (row) { row.forEach(function (ch) { if (ch === R.target) left++; }); });
      root.appendChild(roundHead(p, R, r));
      root.appendChild(h("div", { class: "lt-model" }, h("div", { class: "lt-big", text: R.target }), h("div", { class: "fa-t", text: "нађи свако" })));
      var cols = R.grid[0].length, grid = h("div", { class: "lt-grid", style: "grid-template-columns:repeat(" + cols + ",1fr)" });
      R.grid.forEach(function (row) {
        row.forEach(function (ch) {
          var b = h("button", { class: "lt-cell", text: ch, "aria-label": "слово " + ch });
          b.onclick = function () {
            if (b.dataset.done) return;
            if (ch === R.target) { b.dataset.done = "1"; b.classList.add("right"); c.snd.ok(); left--; if (left === 0) { c.burst(grid, 24); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); } }
            else wrongShake(b, c, p.hint);
          };
          grid.appendChild(b);
        });
      });
      root.appendChild(grid); if (r > 0) c.say(p.again);
    }
    round();
  };

  // Slovo po slovo: reč sa slike ili šifra
  GAMES.spell = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], word = R.word.split(""), got = [], tiles = []; root.textContent = ""; nextBtn.hidden = true; root.classList.add("spell-scene");
      root.appendChild(roundHead(p, R, r));
      var top = h("div", { class: "sp-top" });
      if (R.legend) { var lg = h("div", { class: "sp-legend" }, h("div", { class: "sp-lt", text: "КЉУЧ" })); R.legend.forEach(function (q) { lg.appendChild(h("div", { class: "sp-li" }, img(q.img, { alt: "" }), h("b", { text: q.letter }))); }); top.appendChild(lg); }
      var slotsEl = h("div", { class: "sp-slots" }), slotEls = [];
      word.forEach(function (_, i) {
        var s = h("button", { class: "sp-slot" }, R.imgs ? img(R.imgs[i], { alt: "" }) : null, h("span", { class: "sp-ch" }));
        s.onclick = function () { if (got.length && got[got.length - 1] !== null && i === got.length - 1) { got.pop(); SND.tap(); paint(); } };
        slotEls.push(s); slotsEl.appendChild(s);
      });
      if (R.img) top.appendChild(h("div", { class: "sp-pic" }, img(R.img, { alt: N(R.img) })));
      top.appendChild(slotsEl); root.appendChild(top);
      var tray = h("div", { class: "sp-tray" }), letters = shuffled(word.concat((R.decoys || "").split("")), 5 + r), used = {};
      letters.forEach(function (L, i) {
        var b = h("button", { class: "sp-tile", text: L, "aria-label": "слово " + L });
        b.onclick = function () {
          if (got.length >= word.length || used[i]) return; used[i] = true; got.push({ L: L, i: i, b: b }); SND.tap(); paint();
          if (got.length === word.length) {
            if (got.map(function (q) { return q.L; }).join("") === R.word) { c.snd.ok(); slotEls.forEach(function (s) { s.classList.add("right"); }); c.burst(slotsEl, 22); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
            else { c.snd.no(); slotsEl.classList.remove("shake"); void slotsEl.offsetWidth; slotsEl.classList.add("shake"); c.say(p.hint); setTimeout(function () { got.forEach(function (q) { used[q.i] = false; }); got.length = 0; paint(); }, 550); }
          }
        };
        tiles.push(b); tray.appendChild(b);
      });
      function paint() {
        slotEls.forEach(function (s, i) { s.querySelector(".sp-ch").textContent = got[i] ? got[i].L : ""; });
        tiles.forEach(function (b, i) { b.classList.toggle("used", !!used[i]); });
      }
      root.appendChild(tray); if (r > 0) c.say(p.again);
    }
    round();
  };

  // Slika-sudoku
  GAMES.sudoku = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], n = R.n, vals = R.given.map(function (row, y) { return row.map(function (g, x) { return g ? R.sol[y][x] : 0; }); }), sel = null, done = false;
      root.textContent = ""; nextBtn.hidden = true; root.classList.add("sudoku-scene");
      root.appendChild(roundHead(p, R, r));
      var cs = n <= 4 ? 104 : 72, board = h("div", { class: "su-board", style: "grid-template-columns:repeat(" + n + "," + cs + "px);grid-template-rows:repeat(" + n + "," + cs + "px)" }), cells = [];
      for (var y = 0; y < n; y++) { cells[y] = []; for (var x = 0; x < n; x++) (function (y, x) {
        var b = h("button", { class: "su-cell" + (R.given[y][x] ? " given" : "") + ((x + 1) % R.bc === 0 && x < n - 1 ? " rb" : "") + ((y + 1) % R.br === 0 && y < n - 1 ? " bb" : ""), "aria-label": "поље " + (y + 1) + "," + (x + 1) });
        b.onclick = function () { if (done || R.given[y][x]) return; if (vals[y][x]) { vals[y][x] = 0; SND.tap(); paint(); return; } sel = [y, x]; paint(); };
        cells[y][x] = b; board.appendChild(b);
      })(y, x); }
      root.appendChild(board);
      var tray = h("div", { class: "su-tray" });
      R.symbols.forEach(function (k, i) {
        var b = h("button", { class: "card", "aria-label": N(k) || "слика " + (i + 1) }, img(k));
        b.onclick = function () {
          if (done) return; if (!sel) { c.say(p.pick); return; }
          var y = sel[0], x = sel[1], v = i + 1, bad = false;
          for (var q = 0; q < n; q++) { if (vals[y][q] === v || vals[q][x] === v) bad = true; }
          var by = Math.floor(y / R.br) * R.br, bx = Math.floor(x / R.bc) * R.bc;
          for (var a = 0; a < R.br; a++) for (var d = 0; d < R.bc; d++) if (vals[by + a][bx + d] === v) bad = true;
          if (bad) { wrongShake(cells[y][x], c, p.conflict); return; }
          vals[y][x] = v; sel = null; SND.tap(); paint();
          var all = vals.every(function (row, yy) { return row.every(function (vv, xx) { return vv === R.sol[yy][xx]; }); });
          if (all) { done = true; c.snd.ok(); c.burst(board, 30); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
        };
        tray.appendChild(b);
      });
      root.appendChild(tray);
      function paint() { for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var b = cells[y][x]; b.textContent = ""; if (vals[y][x]) b.appendChild(img(R.symbols[vals[y][x] - 1], { alt: "" })); b.classList.toggle("sel", !!sel && sel[0] === y && sel[1] === x); } }
      paint(); c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Vaga: koja strana pretegne
  GAMES.scale = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], done = false; root.textContent = ""; nextBtn.hidden = true; root.classList.add("scale-scene");
      root.appendChild(roundHead(p, R, r));
      var svg = svgEl("svg", { viewBox: "0 0 1280 720", class: "scale-svg" }); root.appendChild(svg);
      var beam = svgEl("g"), px = 640, py = 250, arm = 300;
      svg.appendChild(svgEl("path", { d: "M640 250 L600 520 L680 520 Z", fill: "#b98a5a", stroke: "#3a1a14", "stroke-width": 5, "stroke-linejoin": "round" }));
      svg.appendChild(svgEl("rect", { x: 560, y: 516, width: 160, height: 22, rx: 8, fill: "#8a5a35", stroke: "#3a1a14", "stroke-width": 5 }));
      svg.appendChild(beam); svg.appendChild(svgEl("circle", { cx: px, cy: py, r: 16, fill: "#ffd23f", stroke: "#3a1a14", "stroke-width": 5 }));
      var pans = {};
      ["left", "right"].forEach(function (side) {
        var g = svgEl("g", { class: "pan", tabindex: "0", role: "button", "aria-label": side === "left" ? "лева страна" : "десна страна" });
        var inner = svgEl("g"); g.appendChild(inner);
        inner.innerHTML = '<line x1="0" y1="0" x2="-110" y2="150" stroke="#3a1a14" stroke-width="4"/><line x1="0" y1="0" x2="110" y2="150" stroke="#3a1a14" stroke-width="4"/><path d="M-130 150 H130 Q120 190 70 190 H-70 Q-120 190 -130 150Z" fill="#fff" stroke="#3a1a14" stroke-width="5"/><rect x="-140" y="-10" width="280" height="260" fill="transparent"/>';
        var items = R[side], list = [];
        items.forEach(function (it) { for (var i = 0; i < it.n; i++) list.push(it.key); });
        var per = Math.min(5, list.length), sz = per > 4 ? 52 : 64;
        list.forEach(function (k, i) { var row = Math.floor(i / 5), col = i % 5, cnt = Math.min(5, list.length - row * 5); var im = svgEl("image", { href: A(k), x: (col - (cnt - 1) / 2) * (sz + 4) - sz / 2, y: 140 - sz - row * (sz + 2), width: sz, height: sz, preserveAspectRatio: "xMidYMax meet" }); inner.appendChild(im); });
        g.addEventListener("click", function () { pick(side); }); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(side); } });
        pans[side] = g; svg.appendChild(g);
      });
      function setAngle(a) {
        var rad = a * Math.PI / 180, dx = Math.cos(rad) * arm, dy = Math.sin(rad) * arm;
        beam.textContent = ""; beam.appendChild(svgEl("line", { x1: px - dx, y1: py - dy, x2: px + dx, y2: py + dy, stroke: "#3a1a14", "stroke-width": 14, "stroke-linecap": "round" }));
        pans.left.setAttribute("transform", "translate(" + (px - dx) + "," + (py - dy) + ")"); pans.right.setAttribute("transform", "translate(" + (px + dx) + "," + (py + dy) + ")");
      }
      setAngle(0);
      function pick(side) {
        if (done) return;
        if (side === R.heavier) {
          done = true; c.snd.ok(); var t0 = performance.now(), to = side === "left" ? -11 : 11;
          (function anim(t) { var k = Math.min(1, (t - t0) / 500); setAngle(to * k); if (k < 1) requestAnimationFrame(anim); else { c.burst(svg, 22); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); } })(t0);
        } else wrongShake(pans[side].firstChild, c, p.hint);
      }
      root.appendChild(h("div", { class: "nask scale-ask", text: p.ask || "Која страна претеже? Додирни је." }));
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Osmosmerka: dodirni prvo i poslednje slovo reči
  GAMES.wordsearch = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], rows = R.grid.length, cols = R.grid[0].length, found = {}, first = null, nf = 0; root.textContent = ""; nextBtn.hidden = true; root.classList.add("ws-scene");
      root.appendChild(roundHead(p, R, r));
      var cs = Math.min(56, 440 / rows, 560 / cols), board = h("div", { class: "ws-grid", style: "grid-template-columns:repeat(" + cols + "," + cs + "px);grid-auto-rows:" + cs + "px;font-size:" + cs * 0.55 + "px" }), cells = [];
      for (var y = 0; y < rows; y++) { cells[y] = []; for (var x = 0; x < cols; x++) (function (y, x) {
        var b = h("button", { class: "ws-cell", text: R.grid[y][x], "aria-label": "слово " + R.grid[y][x] });
        b.onclick = function () { SND.tap(); if (!first) { first = [y, x]; b.classList.add("first"); return; } test(first, [y, x]); cells[first[0]][first[1]].classList.remove("first"); first = null; };
        cells[y][x] = b; board.appendChild(b);
      })(y, x); }
      var side = h("div", { class: "ws-words" }, h("h3", { text: "РЕЧИ" })), wEls = {};
      R.words.forEach(function (w) { var li = h("div", { class: "ws-w", text: w }); wEls[w] = li; side.appendChild(li); });
      root.appendChild(board); root.appendChild(side);
      function test(a, b2) {
        var dy = Math.sign(b2[0] - a[0]), dx = Math.sign(b2[1] - a[1]), len = Math.max(Math.abs(b2[0] - a[0]), Math.abs(b2[1] - a[1])) + 1;
        if (len < 2 || (a[0] !== b2[0] && a[1] !== b2[1] && Math.abs(b2[0] - a[0]) !== Math.abs(b2[1] - a[1]))) { c.snd.no(); c.say(p.hint); return; }
        var s = "", pos = []; for (var i = 0; i < len; i++) { var yy = a[0] + dy * i, xx = a[1] + dx * i; s += R.grid[yy][xx]; pos.push([yy, xx]); }
        var rev = s.split("").reverse().join(""), hit = R.words.filter(function (w) { return !found[w] && (w === s || w === rev); })[0];
        if (!hit) { c.snd.no(); c.say(p.hint); return; }
        found[hit] = true; nf++; c.snd.ok(); pos.forEach(function (q) { cells[q[0]][q[1]].classList.add("found"); }); wEls[hit].classList.add("done"); c.burst(cells[pos[0][0]][pos[0][1]], 10);
        if (nf === R.words.length) doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); else c.say(p.next);
      }
      T.wsCells = function () { return R.words.map(function (w) { var pos = R.pos[w], rc1 = cells[pos[0][0]][pos[0][1]].getBoundingClientRect(), rc2 = cells[pos[1][0]][pos[1][1]].getBoundingClientRect(); return [[rc1.left + rc1.width / 2, rc1.top + rc1.height / 2], [rc2.left + rc2.width / 2, rc2.top + rc2.height / 2]]; }); };
      c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Razlike: dodirni sve razlike na desnoj slici
  GAMES.diff = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], found = [], total = R.boxes.length; root.textContent = ""; nextBtn.hidden = true; root.classList.add("diff-scene");
      root.appendChild(roundHead(p, R, r));
      var cnt = h("div", { class: "df-count" + (R.stack ? " side" : "") }), pair = h("div", { class: "df-pair" + (R.stack ? " stack" : "") }), wraps = [];
      function paint() { cnt.textContent = "Нађено: " + found.length + " од " + total; }
      ["a", "b"].forEach(function (side) {
        var im = img(R[side], { class: "df-img", alt: side === "a" ? "прва слика" : "друга слика" }), w = h("div", { class: "df-wrap" }, im);
        w.addEventListener("click", function (e) {
          var rc = im.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width, y = (e.clientY - rc.top) / rc.height;
          if (x < 0 || y < 0 || x > 1 || y > 1) return;
          var ex = R.expand == null ? 0.04 : R.expand, hitI = -1;
          R.boxes.forEach(function (b, i) { if (x >= b[0] - ex && x <= b[0] + b[2] + ex && y >= b[1] - ex && y <= b[1] + b[3] + ex && hitI < 0) hitI = i; });
          if (hitI < 0) { wrongShake(w, c, p.hint); return; }
          if (found.indexOf(hitI) >= 0) return;
          found.push(hitI); c.snd.ok(); paint();
          var b = R.boxes[hitI];
          wraps.forEach(function (ww) { var iw = ww.im.naturalWidth || 1, ih = ww.im.naturalHeight || 1, d = Math.max(b[2], b[3] * ih / iw) + 0.06; var ring = h("div", { class: "df-ring", style: "left:" + (b[0] + b[2] / 2) * 100 + "%;top:" + (b[1] + b[3] / 2) * 100 + "%;width:" + Math.max(9, d * 100) + "%;aspect-ratio:1" }); ww.im.parentNode.appendChild(ring); });
          if (found.length === total) { c.burst(pair, 26); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
        });
        var holder = h("div", { class: "df-holder" }); w.insertBefore(holder, w.firstChild); holder.appendChild(im);
        wraps.push({ w: w, im: im }); pair.appendChild(w);
      });
      root.appendChild(pair); root.appendChild(cnt); paint();
      T.diffPts = function () { return R.boxes.map(function (b) { var rc = wraps[1].im.getBoundingClientRect(); return [rc.left + (b[0] + b[2] / 2) * rc.width, rc.top + (b[1] + b[3] / 2) * rc.height]; }); };
      c.say(r === 0 ? p.intro || "" : p.again);
    }
    round();
  };

  // Šta je sledeće u nizu
  GAMES.pattern = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], holeEl = null, done = false; root.textContent = ""; nextBtn.hidden = true; root.classList.add("pattern-scene");
      root.appendChild(roundHead(p, R, r));
      var row = h("div", { class: "pt-row" });
      R.row.forEach(function (k) { if (k == null) { holeEl = h("div", { class: "hole", text: "?" }); row.appendChild(holeEl); } else row.appendChild(h("div", { class: "pt-it" }, img(k))); });
      var cards = h("div", { class: "choices-row pt-choices" });
      R.choices.forEach(function (k, i) {
        var b = h("button", { class: "card", "aria-label": N(k) }, img(k), h("div", { class: "nm", text: N(k) }));
        b.onclick = function () {
          if (done) return;
          if (i === R.right) { done = true; c.snd.ok(); b.classList.add("right"); holeEl.textContent = ""; holeEl.className = "hole filled"; holeEl.appendChild(img(k)); c.burst(holeEl, 22); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
          else wrongShake(b, c, p.hint);
        };
        cards.appendChild(b);
      });
      root.appendChild(row); root.appendChild(cards); if (r > 0) c.say(p.again);
    }
    round();
  };

  // Više delova u jednom koraku (npr. kugle pa razlike): parts = [{type, ...podaci igre}, ...]
  GAMES.multi = function (root, p, c, idx) {
    var i = 0, sub = null;
    function run() {
      sub = h("div"); root.appendChild(sub);
      var c2 = Object.create(c);
      c2.finish = function (msg) {
        if (i < p.parts.length - 1) { c.say(msg); SND.win(); c.next("Даље ➜", function () { sub.remove(); i++; run(); }); }
        else c.finish(msg, idx);
      };
      var part = p.parts[i]; GAMES[part.type](sub, part, c2, idx);
    }
    run();
  };

  // Dve iste kugle
  function bauble(sp, size) {
    var s = svgEl("svg", { viewBox: "0 0 100 120", width: size, height: size * 1.2 }), col = sp.c, pat = "";
    if (sp.pat === "stripes") pat = '<rect x="0" y="36" width="100" height="10" fill="#fff"/><rect x="0" y="60" width="100" height="10" fill="#fff"/><rect x="0" y="84" width="100" height="10" fill="#fff"/>';
    if (sp.pat === "dots") pat = [[34, 52], [66, 52], [50, 74], [30, 84], [70, 84]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="6" fill="#fff"/>'; }).join("");
    if (sp.pat === "star") pat = '<polygon transform="translate(50 68) scale(.42) translate(-50 -50)" fill="#fff" points="50,6 61,36 94,38 68,58 77,90 50,72 23,90 32,58 6,38 39,36"/>';
    if (sp.pat === "zigzag") pat = '<polyline points="14,70 30,52 46,70 62,52 78,70 90,56" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>';
    if (sp.pat === "band") pat = '<rect x="0" y="56" width="100" height="22" fill="#fff"/>';
    s.innerHTML = '<defs><clipPath id="bc' + (sp.id || 0) + '"><circle cx="50" cy="68" r="40"/></clipPath></defs><rect x="40" y="6" width="20" height="16" rx="3" fill="' + (sp.cap || "#c2951b") + '" stroke="#3a1a14" stroke-width="4"/><circle cx="50" cy="68" r="40" fill="' + col + '"/><g clip-path="url(#bc' + (sp.id || 0) + ')">' + pat + '</g><circle cx="50" cy="68" r="40" fill="none" stroke="#3a1a14" stroke-width="5"/>';
    return s;
  }
  GAMES.twins = function (root, p, c, idx) {
    var r = 0;
    function round() {
      var R = p.rounds[r], sel = [], done = false; root.textContent = ""; nextBtn.hidden = true; root.classList.add("twins-scene");
      root.appendChild(roundHead(p, R, r));
      var grid = h("div", { class: "tw-grid c" + (R.cols || 4) }), els = [];
      R.items.forEach(function (sp, i) {
        sp.id = r * 100 + i; var b = h("button", { class: "tw-cell", "aria-label": "кугла " + (i + 1) }, bauble(sp, 112));
        b.onclick = function () {
          if (done) return; if (sel.indexOf(i) >= 0) { sel = sel.filter(function (q) { return q !== i; }); b.classList.remove("sel"); return; }
          sel.push(i); b.classList.add("sel"); SND.tap();
          if (sel.length === 2) {
            var A1 = R.items[sel[0]], B1 = R.items[sel[1]];
            if (A1.c === B1.c && A1.pat === B1.pat && (A1.cap || "") === (B1.cap || "")) { done = true; c.snd.ok(); sel.forEach(function (q) { els[q].classList.add("right"); }); c.burst(grid, 24); doneRound(r, p, c, idx, R.fact, function () { r++; round(); }); }
            else { var bad = sel.slice(); sel = []; bad.forEach(function (q) { els[q].classList.remove("sel"); wrongShake(els[q], c, null); }); c.say(p.hint); }
          }
        };
        els.push(b); grid.appendChild(b);
      });
      root.appendChild(grid); if (r > 0) c.say(p.again);
    }
    round();
  };

  /* ---------- finale ---------- */
  function finale() {
    var s = h("div", { class: "finale-scene" });
    if (BADGE) { var shield = badgeSVG(BADGE, S.badge, false); shield.style.cssText = "position:absolute;left:130px;top:84px;width:300px;height:360px"; s.appendChild(shield); }
    else { var cv = img("cover", { alt: STORY.title }); cv.style.cssText = "position:absolute;left:120px;top:70px;height:370px;border-radius:22px;border:5px solid #e3b8a4;box-shadow:0 8px 0 rgba(58,26,20,.15);transform:rotate(-2deg)"; s.appendChild(cv); }
    s.appendChild(h("div", { class: "who", text: S.name || "храбро дете" }));
    if (STORY.magic) s.appendChild(h("div", { class: "magicrow" }, STORY.magic.word.split("").map(function (L) { return h("b", { text: L }); })));
    var stairs = h("div", { class: "stairs" }); s.appendChild(stairs);
    var crown = img(STORY.finaleIcon || "kruna", { class: "crown", alt: "" }); crown.style.left = "1090px"; crown.style.top = "74px";
    if (STORY.finaleBox) { crown.style.maxWidth = STORY.finaleBox[0] + "px"; crown.style.maxHeight = STORY.finaleBox[1] + "px"; crown.style.left = "1120px"; crown.style.top = "64px"; } s.appendChild(crown);
    var steps = STORY.steps.map(function (st, i) {
      var d = h("div", { class: "stair", style: "--c:" + st.color }, st.label, h("span", { class: "box" }));
      var nn = STORY.steps.length, dx = nn <= 6 ? 72 : 360 / (nn - 1), dy = nn <= 6 ? 70 : 350 / (nn - 1); d.style.left = 520 + i * dx + "px"; d.style.top = 520 - i * dy + "px"; stairs.appendChild(d); return d;
    });
    s.appendChild(h("div", { class: "finale-actions" }, h("button", { class: "big-btn", text: "ЗА РОДИТЕЉА ➜", onclick: function () { SND.tap(); go(order.length - 1); } }), h("button", { class: "big-btn alt", text: "ИГРАЈ ПОНОВО", onclick: function () { S.done = S.done.map(function () { return false; }); S.reached = 0; S.badge = newBadge(); S.magic = S.magic.map(function () { return ""; }); go(2); } })));
    scene.appendChild(s);
    say(who(STORY.finaleMsg));
    steps.forEach(function (d, i) {
      setTimeout(function () { d.classList.add("show"); setTimeout(function () { d.querySelector(".box").textContent = "★"; SND.tap(); }, 250); }, 500 + i * 420);
    });
    setTimeout(function () { crown.classList.add("lit"); if (STORY.finaleIconLit) crown.src = A(STORY.finaleIconLit); SND.win(); burst(1145, 140, 40); }, 500 + steps.length * 420 + 300);
  }

  /* ---------- za roditelje ---------- */
  function parentsScene() {
    stage.dataset.theme = "cream"; bar.hidden = true; liskoEl.hidden = true; parentsEl.hidden = false; parentsEl.scrollTop = 0; layout();
    var P = STORY.parents, nx = STORY.next;
    var code = h("div", { class: "code" }, h("div", null, h("div", { class: "c", text: nx.code }), h("div", { class: "d", text: nx.codeText })),
      h("button", { text: "Копирај код", onclick: function (e) {
        var b = e.currentTarget;
        function ok() { b.textContent = "Копирано ✓"; }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(nx.code).then(ok, ok); else ok();
      } }));
    parentsEl.textContent = "";
    parentsEl.appendChild(h("div", { class: "par" },
      h("div", { class: "top" }, img("logo", { alt: "Igra Lab" }), h("button", { class: "link-btn", text: "← назад на причу", onclick: function () { go(order.length - 2); } })),
      h("h1", { text: "ЗА РОДИТЕЉА" }), h("div", { class: "rule" }),
      h("p", { class: "lead", text: P.lead }),
      h("div", { class: "cols" },
        h("div", { class: "box" }, h("h2", { text: "Шта је дете вежбало" }),
          STORY.steps.map(function (st) { return h("div", { class: "skill", style: "--c:" + st.color }, h("i"), h("div", null, h("b", { text: st.label }), h("span", { text: st.skill }), h("small", { text: "У књижици: страна " + st.page + ", „" + st.pageTitle + "“" }))); }),
          P.tips.map(function (t) { return h("div", { class: "tip", text: t }); })),
        h("div", { class: "box next-card" }, h("h2", { text: "Следећа авантура" }),
          img("sledeca", { class: "cv", alt: nx.title }),
          h("h3", { text: nx.title }),
          h("p", { text: nx.bridge }),
          h("p", { text: nx.contents }),
          code,
          h("a", { class: "big-btn", href: nx.url, target: "_blank", rel: "noopener", text: "ПОГЛЕДАЈ У ПРОДАВНИЦИ ➜" }),
          h("div", { class: "series" }, h("span", { text: "Још у серији:" }), nx.series.map(function (t) { return h("span", { class: "chip", text: t }); }))
        )
      )
    ));
  }

  /* ---------- traka: zvuk, ceo ekran, preskoči ---------- */
  var sndBtn = document.getElementById("sndBtn"), fsBtn = document.getElementById("fsBtn");
  sndBtn.onclick = function () { S.muted = !S.muted; sndBtn.setAttribute("aria-label", S.muted ? "Укључи звук" : "Искључи звук"); sndBtn.classList.toggle("off", S.muted); sndBtn.querySelector(".x").style.display = S.muted ? "" : "none"; if (!S.muted) SND.tap(); };
  if (document.fullscreenEnabled) fsBtn.onclick = function () { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(function () {}); };
  else fsBtn.hidden = true;
  skipBtn.onclick = function () {
    var key = order[cur];
    if (typeof key === "number") { S.done[key] = true; S.reached = Math.max(S.reached, key + 1); if (STORY.magic && STORY.steps[key].slot != null) revealLetter(STORY.steps[key]); go(cur + 1); }
  };

  go(0);
})();
