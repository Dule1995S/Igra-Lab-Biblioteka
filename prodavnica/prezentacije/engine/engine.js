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

  var S = { name: "", done: STORY.steps.map(function () { return false; }), reached: 0, muted: false,
    shield: { color: STORY.shieldColors[0], slots: [null, null, null, null, null] } };

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
  function who(txt) { return S.name ? txt.replace("{ime}", S.name) : txt.replace(/[,!]?\s*\{ime\}/g, ""); }
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
    bubble.textContent = who(text);
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
  }
  function nextAction(label, cb) {
    nextBtn.hidden = false; nextBtn.textContent = label;
    nextBtn.onclick = function () { nextBtn.hidden = true; SND.tap(); cb(); };
  }
  function renderPills(cur) {
    pillsEl.textContent = "";
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
      nextAction("Даље ➜", function () { go(2 + idx + 1); });
    }
  };

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
    if (theme === "day" || theme === "dragon" || theme === "tourney") {
      [[120, 120], [620, 150], [1010, 100]].forEach(function (p) { var c = h("div", { class: "cloud" }); c.style.left = p[0] + "px"; c.style.top = p[1] + "px"; scene.appendChild(c); });
    }
  }

  function titleScene() {
    var s = h("div", { class: "title-scene" },
      img("logo", { class: "logo", alt: "Igra Lab" }),
      h("div", { class: "left" },
        h("h1", { text: STORY.title }),
        h("div", { class: "sub", text: STORY.subtitle }),
        h("div", { class: "chips" }, STORY.chips.map(function (c) { return h("span", { class: "chip", text: c }); })),
        h("button", { class: "big-btn go", text: "ПОЧНИ ПРИЧУ", onclick: function () { SND.tap(); go(1); } })),
      img("cover", { class: "cover", alt: STORY.title })
    );
    scene.appendChild(s);
  }

  function nameScene() {
    say("Ја сам Лиско. Помози ми да стигнем до круне! А како се ти зовеш?");
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
            else c.finish(R.fact + " " + p.bonus, idx);
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
        var k = R[side];
        var b = h("button", { class: "card", "aria-label": N(k) }, img(k), h("div", { class: "nm", text: N(k) }));
        b.onclick = function () {
          if (R.bigger === side) {
            c.snd.ok(); b.classList.add("right");
            Array.prototype.forEach.call(cards.children, function (x) { x.disabled = true; if (x !== b) x.classList.add("dim"); });
            c.burst(b, 22);
            if (r < p.rounds.length - 1) { c.say(R.fact); c.next("Даље ➜", function () { r++; round(); }); }
            else c.finish(R.fact + " " + p.bonus, idx);
          } else { c.snd.no(); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); c.say(p.hint); }
        };
        cards.appendChild(b);
      });
      root.appendChild(h("div", { class: "stage-title" }, h("div", { class: "title-pill", text: p.title }),
        h("div", { class: "rounddots" }, p.rounds.map(function (_, i) { return h("b", { class: i <= r ? "on" : "" }); }))));
      root.appendChild(cards);
      if (r > 0) c.say(p.again);
    }
    round();
  };

  // Senka: povuci buktinju bliže i dalje od štita
  GAMES.shadow = function (root, p, c, idx) {
    var Ox = 760, Wx = 960, Cy = 340, SH = 150, LMIN = 130, LMAX = 640, WALL_TOP = 90;
    var shW = SH * 243 / 300;
    root.classList.add("shadow-scene");
    var wall = h("div", { class: "wall" }); root.appendChild(wall);
    root.appendChild(h("div", { class: "floor" }));
    var rays = svgEl("svg", { viewBox: "0 0 1280 720" });
    var rayA = svgEl("line", { stroke: "#ffd86b", "stroke-width": 4, "stroke-dasharray": "10 8", "stroke-linecap": "round" });
    var rayB = svgEl("line", { stroke: "#ffd86b", "stroke-width": 4, "stroke-dasharray": "10 8", "stroke-linecap": "round" });
    rays.appendChild(rayA); rays.appendChild(rayB); root.appendChild(rays);
    var post = h("div", { class: "post" }); post.style.cssText = "left:" + (Ox - 5) + "px;top:" + (Cy + SH / 2 - 8) + "px;height:" + (590 - (Cy + SH / 2) + 8) + "px"; root.appendChild(post);
    var shield = img("stit", { class: "shield", alt: "штит" }); shield.style.left = Ox - shW / 2 + "px"; root.appendChild(shield);
    var wallclip = h("div", { class: "wallclip" }); root.appendChild(wallclip);
    var shade = img("stit", { class: "shade", alt: "" }); wallclip.appendChild(shade);
    var glow = h("div", { class: "glow" }); root.appendChild(glow);
    var torch = img("buktinja", { class: "torch", alt: "буктиња", tabindex: "0", role: "slider", "aria-label": "Буктиња: повуци лево или десно", "aria-valuemin": LMIN, "aria-valuemax": LMAX });
    torch.style.top = Cy - 33 + "px"; root.appendChild(torch);
    var hint = h("div", { class: "drag-hint", text: "◀ вуци буктињу ▶" }); hint.style.left = "100px"; hint.style.top = "470px"; root.appendChild(hint);
    var tw = 150 * 121 / 300;
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
      var end = svgEl("g"); end.innerHTML = '<circle r="32" fill="#ffd23f" stroke="#3a1a14" stroke-width="5"/><text y="11" text-anchor="middle" font-size="34" fill="#3a1a14">★</text>';
      end.setAttribute("transform", "translate(" + pts[n - 1].x + "," + pts[n - 1].y + ")");
      var head = svgEl("g"); head.innerHTML = ART.dragon; head.firstChild.setAttribute("width", 84); head.firstChild.setAttribute("height", 84); head.firstChild.setAttribute("x", -42); head.firstChild.setAttribute("y", -62);
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
        else c.finish(R.done + " " + p.bonus, idx);
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
            else c.finish(R.fact + " " + p.bonus, idx);
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

  // Štit: boja + tačno pet znakova (nema pogrešnog odgovora)
  var SLOTS = [[88, 98], [212, 98], [150, 176], [100, 256], [200, 256]];
  function shieldSVG(state, interactive, onSlot) {
    var svg = svgEl("svg", { viewBox: "0 0 300 360", class: "shield-svg" });
    var path = svgEl("path", { d: "M20 30 H280 V170 C280 262 222 322 150 348 C78 322 20 262 20 170 Z", fill: state.color, stroke: "#3a1a14", "stroke-width": 9, "stroke-linejoin": "round" });
    svg.appendChild(path);
    svg.appendChild(svgEl("path", { d: "M34 44 H266 V170 C266 250 214 306 150 331 C86 306 34 250 34 170 Z", fill: "none", stroke: "rgba(255,255,255,.55)", "stroke-width": 4 }));
    SLOTS.forEach(function (pt, i) {
      var k = state.slots[i], g = svgEl("g", { transform: "translate(" + pt[0] + "," + pt[1] + ")" });
      if (k) {
        g.appendChild(svgEl("circle", { r: 40, fill: "#fff", stroke: "#3a1a14", "stroke-width": 4 }));
        if (k === "star") { var st = svgEl("g"); st.innerHTML = ART.star; g.appendChild(st); }
        else { var im = svgEl("image", { href: A(k), x: -30, y: -30, width: 60, height: 60, preserveAspectRatio: "xMidYMid meet" }); g.appendChild(im); }
      } else if (interactive) {
        g.appendChild(svgEl("circle", { r: 36, fill: "rgba(255,255,255,.18)", stroke: "rgba(255,255,255,.7)", "stroke-width": 4, "stroke-dasharray": "8 7" }));
      }
      if (interactive && onSlot) { g.setAttribute("class", "slot-hit"); g.addEventListener("click", function () { onSlot(i); }); }
      svg.appendChild(g);
    });
    return svg;
  }
  GAMES.shield = function (root, p, c, idx) {
    root.classList.add("shield-scene");
    var sh = S.shield, finished = false, shieldEl, dots = h("div", { class: "dots" });
    function count() { return sh.slots.filter(Boolean).length; }
    function redraw() {
      var n = shieldSVG(sh, true, function (i) { if (sh.slots[i]) { sh.slots[i] = null; SND.tap(); redraw(); c.say(p.removed); } });
      if (shieldEl) root.replaceChild(n, shieldEl); else root.appendChild(n);
      shieldEl = n;
      dots.textContent = ""; sh.slots.forEach(function (s, i) { dots.appendChild(h("b", { class: s ? "on" : "", text: s ? "✓" : String(i + 1) })); });
    }
    root.appendChild(dots);
    var sw = h("div", { class: "swatches" });
    STORY.shieldColors.forEach(function (col) {
      var b = h("button", { class: "swatch", style: "--c:" + col, "aria-label": "боја штита", "aria-pressed": col === sh.color ? "true" : "false" });
      b.onclick = function () { sh.color = col; SND.tap(); Array.prototype.forEach.call(sw.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); redraw(); };
      sw.appendChild(b);
    });
    var tray = h("div", { class: "tray" });
    p.emblems.forEach(function (k) {
      var inner;
      if (k === "star") { inner = svgEl("svg", { viewBox: "-40 -40 80 80", width: 70, height: 70 }); inner.innerHTML = ART.star; } else inner = img(k);
      var b = h("button", { class: "card", "aria-label": k === "star" ? "звезда" : N(k) }, inner);
      b.onclick = function () {
        var free = sh.slots.indexOf(null);
        if (free < 0) { c.snd.no(); c.say(p.full); return; }
        sh.slots[free] = k; SND.tap(); redraw();
        if (count() === 5 && !finished) { finished = true; c.burst(shieldEl, 30); c.finish(p.doneMsg, idx); }
        else if (count() < 5) c.say(p.left.replace("{n}", String(5 - count())));
      };
      tray.appendChild(b);
    });
    root.appendChild(h("div", { class: "panel" }, h("h3", { text: "1. БОЈА ШТИТА" }), sw, h("h3", { text: "2. ПЕТ ЗНАКОВА" }), tray));
    redraw();
  };

  /* ---------- finale ---------- */
  function finale() {
    var s = h("div", { class: "finale-scene" });
    var shield = shieldSVG(S.shield, false); shield.style.cssText = "position:absolute;left:130px;top:84px;width:300px;height:360px"; s.appendChild(shield);
    s.appendChild(h("div", { class: "who", text: S.name || "храбро дете" }));
    var stairs = h("div", { class: "stairs" }); s.appendChild(stairs);
    var crown = img("kruna", { class: "crown", alt: "круна" }); crown.style.left = "1090px"; crown.style.top = "74px"; s.appendChild(crown);
    var steps = STORY.steps.map(function (st, i) {
      var d = h("div", { class: "stair", style: "--c:" + st.color }, st.label, h("span", { class: "box" }));
      d.style.left = 520 + i * 72 + "px"; d.style.top = 520 - i * 70 + "px"; stairs.appendChild(d); return d;
    });
    s.appendChild(h("div", { class: "finale-actions" }, h("button", { class: "big-btn", text: "ЗА РОДИТЕЉА ➜", onclick: function () { SND.tap(); go(order.length - 1); } }), h("button", { class: "big-btn alt", text: "ИГРАЈ ПОНОВО", onclick: function () { S.done = S.done.map(function () { return false; }); S.reached = 0; S.shield = { color: STORY.shieldColors[0], slots: [null, null, null, null, null] }; go(2); } })));
    scene.appendChild(s);
    say(who(STORY.finaleMsg));
    steps.forEach(function (d, i) {
      setTimeout(function () { d.classList.add("show"); setTimeout(function () { d.querySelector(".box").textContent = "★"; SND.tap(); }, 250); }, 500 + i * 420);
    });
    setTimeout(function () { crown.classList.add("lit"); SND.win(); burst(1145, 140, 40); }, 500 + steps.length * 420 + 300);
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
    if (typeof key === "number") { S.done[key] = true; S.reached = Math.max(S.reached, key + 1); go(cur + 1); }
  };

  go(0);
})();
