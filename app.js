// AlphaBeat — A to Z song quiz: daily wheels (general and by decade) plus an unlimited mode.
(() => {
  'use strict';

  const TIME = 240;          // seconds for a whole wheel
  const SONG_TIME = 25;      // seconds per song in unlimited
  const LIVES = 3;           // mistakes allowed in unlimited
  const SNIPPET = 5;         // seconds of each song
  const LAUNCH = Date.UTC(2026, 10, 12); // wheel #1
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0, 1046.5];
  const DECADES = { '70s': '1970s', '80s': '1980s', '90s': '1990s', '00s': '2000s', '10s': '2010s' };
  const MODES = [
    { id: 'all', label: 'GENERAL', blurb: 'Today\'s wheel: one song per letter, hits from every decade.' },
    ...Object.keys(DECADES).map((d) => ({ id: d, label: d.toUpperCase(), blurb: `Today's wheel with songs from the ${DECADES[d]} only.` })),
    { id: 'unl', label: 'UNLIMITED', blurb: `No wheel: songs keep coming until you make ${LIVES} mistakes. How many can you name?` },
  ];

  const $ = (id) => document.getElementById(id);
  const wheel = $('wheel');
  const panels = { start: $('p-start'), play: $('p-play'), end: $('p-end') };
  const input = $('answer');
  const tiles = [];
  const modeButtons = [];
  const player = new Audio();
  let warm = null;           // preloads the next snippet

  let mode = 'all';
  let game = null;
  let runId = 0;             // changes whenever a run starts or is left, so late timers can tell
  let clock = null;
  let nextTimer = null;
  let ctx = null;
  let sfx = load('ab_sfx') !== '0';
  let vol = load('ab_vol') === null ? 0.7 : Math.min(1, Math.max(0, Number(load('ab_vol')) / 100 || 0));
  let fade = 1;              // fade-out factor at the end of a snippet
  let loading = false;       // clock is paused while a snippet buffers
  let playToken = 0;
  let snippetTimer = null;

  // ---------- helpers ----------
  const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function load(k) { try { return localStorage.getItem(k); } catch { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
  const pad = (n, w = 6) => String(n).padStart(w, '0');
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  function today() {
    const d = new Date();
    const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return { key: `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`, no: Math.round((utc - LAUNCH) / 864e5) + 1 };
  }

  // Lower-case, no accents, no punctuation: "Don't Stop Believin'" -> "dontstopbelievin"
  function normalize(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ').replace(/[^a-z0-9]/g, '');
  }

  function distance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  }

  // Exact match, or a small typo on longer titles.
  function isCorrect(text, accepted) {
    const t = normalize(text);
    if (!t) return false;
    return accepted.some((a) => {
      const n = normalize(a);
      if (t === n) return true;
      const slack = n.length >= 9 ? 2 : n.length >= 5 ? 1 : 0;
      return slack > 0 && distance(t, n) <= slack;
    });
  }

  function pixelArt(rows, fill) {
    let rects = '';
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" fill="${fill}">${rects}</svg>`;
  }
  const NOTE = ['..######', '..######', '..#....#', '..#....#', '..#....#', '.##...##', '###..###', '##...##.'];

  // Pixel-art vinyl record, painted pixel by pixel on a small canvas and scaled up unsmoothed.
  // Grooves run right to the edge; the letters sit directly on the vinyl.
  function drawDisc(el) {
    const N = 260, c = (N - 1) / 2, R = N / 2 - 0.5;
    const cv = document.createElement('canvas');
    if (!cv.getContext) return;
    cv.width = cv.height = N;
    const g = cv.getContext('2d');
    const VINYL = ['#0b0914', '#14111f', '#1e1a33', '#2d2850', '#463f7a', '#6a62ad'];
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const dx = x - c, dy = y - c;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r > R) continue;
        const ang = Math.atan2(dy, dx);
        let col;
        if (r > R - 1.5) col = '#000';
        else if (r > R * 0.2) {
          const ring = Math.floor(r);
          let level = ring % 23 === 0 ? 0 : 1 + ((ring * 7) % 5 < 2 ? 1 : 0);          // grooves and silent bands
          const s = Math.pow(Math.abs(Math.cos(ang * 3 - 0.4)), 14);                    // six reflections
          level += Math.floor(s * 3.2 + ((x + y) % 2 ? 0.3 : 0.7));
          col = VINYL[Math.min(level, VINYL.length - 1)];
        } else if (r > R * 0.19) col = '#000';
        else col = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 16) % 2 && r > R * 0.16 ? '#ff3fa4' : '#ffe45c';
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
    el.style.backgroundImage = 'url(' + cv.toDataURL() + ')';
  }

  // ---------- pixel-art sprites, all painted on tiny canvases ----------
  const DISCO = ['#ff3fa4', '#ff8a3d', '#ffe45c', '#3dff7a', '#29e7ff', '#a66bff'];
  const DISCO_DARK = ['#5a1038', '#5c2c0d', '#5e5216', '#0f5a28', '#0b4f5a', '#35207a'];

  function sprite(n, paint) {
    const cv = document.createElement('canvas');
    if (!cv.getContext) return '';
    cv.width = cv.height = n;
    const g = cv.getContext('2d');
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const col = paint(x, y);
        if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
      }
    }
    return 'url(' + cv.toDataURL() + ')';
  }

  // A 15-pixel ball: black outline, coloured rim, fill, and a small highlight top-left.
  function orb(fill, rim, shine) {
    return sprite(15, (x, y) => {
      const dx = x - 7, dy = y - 7, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 7.4) return null;
      if (d > 6.3) return '#000';
      if (d > 5.2) return rim;
      if (d > 3.7 && dx < 0 && dy < -1 && dx > -5) return shine;
      return fill;
    });
  }
  const IDLE_ORBS = DISCO.map((hue, i) => orb(DISCO_DARK[i], hue, hue));

  function setupStage() {
    const root = document.documentElement;
    if (!root) return;
    root.style.setProperty('--orb-now', orb('#ffffff', '#ffe45c', '#ffe45c'));
    root.style.setProperty('--orb-ok', orb('#3dff7a', '#0f5a28', '#e3ffd9'));
    root.style.setProperty('--orb-ko', orb('#ff4265', '#5a0a1c', '#ffc2cc'));
    root.style.setProperty('--orb-passed', orb('#1a0b3a', '#5b46a0', '#5b46a0'));
  }

  // Backdrop: a wall of equaliser blocks that sways slowly, and livens up while a song plays.
  let live = false;
  function startBackdrop(cv) {
    if (!cv || !cv.getContext) return;
    const g = cv.getContext('2d');
    const CELL = 28, GAP = 6;
    let last = -1000, energy = 0.5;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; last = -1000; };
    window.addEventListener('resize', resize);
    resize();
    const draw = (ts) => {
      if (ts - last > 80) {                       // about 12 frames a second is plenty for blocks
        last = ts;
        energy += ((live ? 1 : 0.5) - energy) * 0.12;
        const w = cv.width, hgt = cv.height, t = ts / 1000;
        const cols = Math.ceil(w / CELL) + 1, rows = Math.ceil(hgt / CELL);
        g.clearRect(0, 0, w, hgt);
        for (let i = 0; i < cols; i++) {
          const wave = (Math.sin(t * 0.9 + i * 0.55) + Math.sin(t * 0.53 + i * 1.3) + Math.sin(t * 1.7 + i * 0.21)) / 3;
          const level = Math.max(1, Math.round(rows * (0.1 + 0.22 * energy + 0.2 * energy * wave)));
          for (let r = 0; r < level; r++) {
            const cap = r === level - 1;
            g.globalAlpha = cap ? 0.6 : 1;
            g.fillStyle = cap ? DISCO[i % DISCO.length] : r > level - 4 ? '#2c1663' : '#1b0c42';
            g.fillRect(i * CELL, hgt - (r + 1) * CELL + GAP, CELL - GAP, CELL - GAP);
          }
        }
        g.globalAlpha = 1;
      }
      if (!calm) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  // ---------- chiptune sound effects ----------
  function beep(freq, dur = 0.12, type = 'square', when = 0) {
    if (!sfx || !ctx) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(Math.max(0.0001, 0.1 * vol), t);
    gain.gain.setValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  const sfxHit = (n) => { const f = SCALE[(Math.max(n, 1) - 1) % SCALE.length]; beep(f, 0.08); beep(f * 1.5, 0.08, 'square', 0.08); beep(f * 2, 0.16, 'square', 0.16); };
  const sfxMiss = () => { beep(196, 0.12, 'sawtooth'); beep(147, 0.12, 'sawtooth', 0.12); beep(98, 0.3, 'sawtooth', 0.24); };
  const sfxPass = () => beep(660, 0.05);
  const sfxEnd = () => [392, 523.3, 659.3, 784, 1046.5].forEach((f, i) => beep(f, 0.12, 'square', i * 0.12));

  function paintSfx() {
    const b = $('btn-sfx');
    b.textContent = sfx ? 'SFX ON' : 'SFX OFF';
    b.setAttribute('aria-pressed', String(sfx));
  }

  // ---------- picking songs ----------
  const day = today();

  // Songs that can stand for a letter in a mode. "Starts with" songs win; "contains" ones fill the gaps.
  function poolFor(m, letter) {
    const all = (SONGS[letter] || []).filter((s) => m === 'all' || s.dec === m);
    const starts = all.filter((s) => !s.contains);
    return starts.length ? starts : all;
  }

  // Today's wheel for a mode: the same for everybody, changing every day.
  function pickWheel(m) {
    const out = [];
    ALPHABET.forEach((l) => {
      const list = poolFor(m, l);
      if (!list.length) return; // no song for this letter in this mode: the wheel is one letter shorter
      out.push({ l, ...list[(day.no + out.length * 7) % list.length], state: 'pending', heard: false, passed: false });
    });
    return out;
  }

  // Unlimited: the whole catalogue, shuffled afresh every run.
  function pickUnlimited() {
    const seen = new Set();
    const out = [];
    for (const l of Object.keys(SONGS)) {
      for (const s of SONGS[l]) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        out.push({ l, ...s, state: 'pending', heard: false, passed: false });
      }
    }
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function newGame(m) {
    const unl = m === 'unl';
    return {
      mode: m, unl, items: unl ? pickUnlimited() : pickWheel(m), idx: 0, time: unl ? SONG_TIME : TIME,
      hits: 0, misses: 0, lives: LIVES, locked: false, done: false, fresh: true,
    };
  }

  // A wheel keeps today's progress (one attempt a day); unlimited always starts over.
  function loadGame(m) {
    const g = newGame(m);
    if (g.unl) return g;
    try {
      const s = JSON.parse(load('ab_run_' + m) || 'null');
      if (s && s.key === day.key && s.items.length === g.items.length) {
        s.items.forEach(([state, heard, passed], i) => Object.assign(g.items[i], { state, heard: !!heard, passed: !!passed }));
        Object.assign(g, { idx: s.idx, time: s.time, done: s.done, fresh: false });
        g.hits = g.items.filter((it) => it.state === 'ok').length;
        g.misses = g.items.filter((it) => it.state === 'ko').length;
      }
    } catch { /* corrupt save: start fresh */ }
    return g;
  }

  function saveGame() {
    const g = game;
    if (!g || g.unl) return;
    store('ab_run_' + g.mode, JSON.stringify({
      key: day.key, idx: g.idx, time: g.time, done: g.done,
      items: g.items.map((it) => [it.state, it.heard ? 1 : 0, it.passed ? 1 : 0]),
    }));
  }

  // Preview links can change over time; refresh the ones in play with a lookup call.
  let lookups = 0;
  function refreshPreviews() {
    const items = game.items;
    for (let from = 0; from < items.length; from += 150) {
      const cb = '__abLookup' + (lookups++);
      const tag = document.createElement('script');
      window[cb] = (data) => {
        (data.results || []).forEach((r) => {
          const it = items.find((x) => x.id === r.trackId);
          if (it && r.previewUrl) it.preview = r.previewUrl;
        });
        delete window[cb];
        tag.remove();
      };
      tag.src = `https://itunes.apple.com/lookup?id=${items.slice(from, from + 150).map((it) => it.id).join(',')}&callback=${cb}`;
      tag.onerror = () => tag.remove();
      document.head.appendChild(tag);
    }
  }

  // ---------- the record ----------
  // Puts the wheel's letters on the record. Unlimited has no letters: the record just spins.
  function buildWheel() {
    tiles.forEach((t) => t.remove());
    tiles.length = 0;
    const letters = game.unl ? [] : game.items.map((it) => it.l);
    letters.forEach((l, i) => {
      const el = document.createElement('span');
      const ang = (2 * Math.PI * i) / letters.length;
      el.className = 'tile';
      el.style.setProperty('--a', IDLE_ORBS[i % DISCO.length]);
      el.style.setProperty('--ca', DISCO[i % DISCO.length]);
      el.style.setProperty('--i', String(i));
      el.style.setProperty('--near', String(Math.min(i, letters.length - i)));
      el.style.left = `${50 + 44.6 * Math.sin(ang)}%`;
      el.style.top = `${50 - 44.6 * Math.cos(ang)}%`;
      const face = document.createElement('span');
      face.className = 'orb';
      face.textContent = l;
      el.appendChild(face);
      wheel.appendChild(el);
      tiles.push(el);
    });
    turn = 0;
    turnIdx = 0;
    wheel.style.setProperty('--rot', '0deg');
    wheel.classList.remove('lap');
    wheel.classList.toggle('free', game.unl);
    if (wheel.dataset) delete wheel.dataset.end;
  }

  // Turn the record so letter i sits under the needle. It always turns the same way,
  // so going from Z back to A keeps rolling forward instead of rewinding.
  let turn = 0, turnIdx = 0;
  function turnTo(i) {
    const n = tiles.length;
    if (!n) return;
    turn -= ((((i - turnIdx) % n) + n) % n) * (360 / n);
    turnIdx = i;
    wheel.style.setProperty('--rot', turn + 'deg');
  }

  // The record waits below the screen and rises when a run starts.
  function raiseRecord(withIntro) {
    if (!document.body) return;
    document.body.classList.add('started');
    if (!withIntro) return;
    wheel.classList.add('intro');
    setTimeout(() => wheel.classList.remove('intro'), 2200);
  }

  // ---------- animation helpers ----------
  // Restart a one-shot CSS animation, declared in the stylesheet as [data-fx="name"].
  function fx(el, name) {
    if (!el || !el.dataset) return;
    delete el.dataset.fx;
    void el.offsetWidth; // reflow, so the same animation can run twice in a row
    el.dataset.fx = name;
  }

  // Pixel confetti thrown up from the letter under the needle.
  function burst(colors, count, spread) {
    const layer = $('fx');
    if (calm || !layer) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');
      if (!p.animate) return;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const dist = 70 + Math.random() * 150;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
      p.style.background = colors[i % colors.length];
      layer.appendChild(p);
      p.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx * 1.2}px, ${dy + 110}px)`, opacity: 0 },
      ], { duration: 650 + Math.random() * 350, easing: 'steps(10)' }).onfinish = () => p.remove();
    }
  }

  // ---------- rendering ----------
  function show(name) {
    for (const [k, el] of Object.entries(panels)) el.hidden = k !== name;
  }

  function paintHud(g) {
    const t = $('time');
    t.textContent = g.time;
    t.classList.toggle('low', !g.done && !g.fresh && g.time <= (g.unl ? 5 : 20));
    $('hits').textContent = g.hits;
    $('misses').textContent = g.unl ? g.lives : g.misses; // unlimited shows lives left instead of misses
    $('hud').classList.toggle('unl', g.unl);
  }

  function paint() {
    const g = game;
    if (!g) return;
    if (!g.unl) {
      if (g.idx !== turnIdx) turnTo(g.idx);
      g.items.forEach((it, i) => {
        let c = 'tile';
        if (it.state === 'ok') c += ' ok';
        else if (it.state === 'ko') c += ' ko';
        else if (it.passed) c += ' passed';
        if (!g.done && !panels.play.hidden && i === g.idx) c += ' now';
        tiles[i].className = c;
      });
    }
    paintHud(g);
  }

  function setBar(blocks) {
    [...$('snippet-bar').children].forEach((el, i) => el.classList.toggle('on', i < blocks));
  }

  // ---------- snippet playback (5 seconds, once per visit) ----------
  function stopSnippet(label) {
    playToken++;
    clearInterval(snippetTimer);
    player.pause();
    loading = false;
    $('eq').classList.remove('on');
    live = false;
    setBar(0);
    if (label) $('snippet-label').textContent = label;
  }

  function playSnippet() {
    const it = game.items[game.idx];
    const token = ++playToken;
    clearInterval(snippetTimer);
    loading = true;
    it.heard = true;
    saveGame();
    $('btn-play').hidden = true;
    $('snippet-label').textContent = 'LOADING…';
    setBar(10);

    const failed = (label) => {
      if (token !== playToken) return;
      it.heard = false; // it never played, so it does not count as the listen
      saveGame();
      stopSnippet(label);
      loading = true;   // keep the clock paused until the player taps
      $('btn-play').hidden = false;
    };

    player.onplaying = () => {
      if (token !== playToken) return;
      loading = false;
      $('snippet-label').textContent = 'NOW PLAYING';
      $('eq').classList.add('on');
      live = true;
      clearInterval(snippetTimer);
      snippetTimer = setInterval(() => {
        if (token !== playToken) return;
        const left = SNIPPET - player.currentTime;
        setBar(Math.ceil(left * 2));
        fade = left < 0.4 ? Math.max(0, left / 0.4) : 1;
        player.volume = vol * fade;
        if (left <= 0 || player.ended) stopSnippet(game.unl ? 'PLAYED' : 'PLAYED · PASS TO HEAR IT AGAIN NEXT LAP');
      }, 80);
    };
    player.onerror = () => failed('AUDIO ERROR');
    player.src = it.preview;
    player.muted = false;
    fade = 1;
    player.volume = vol;
    const p = player.play();
    if (p && p.catch) p.catch((e) => { if (e && e.name !== 'AbortError') failed('READY'); });
  }

  function preloadNext() {
    const g = game;
    const n = g.items.length;
    for (let step = 1; step < n; step++) {
      if (g.unl && g.idx + step >= n) return;
      const it = g.items[(g.idx + step) % n];
      if (it.state === 'pending' && !it.heard) {
        warm = new Audio();
        warm.preload = 'auto';
        warm.src = it.preview;
        return;
      }
    }
  }

  // Browsers only let audio start from a click. The first song starts a few seconds after
  // START, so the player is "unlocked" during the click with a silent clip.
  const SILENCE = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA==';
  function unlockAudio() {
    try {
      player.onplaying = null;
      player.onerror = null;
      player.muted = true;
      player.src = SILENCE;
      const token = playToken;
      const p = player.play();
      // Only stop the silent clip. If a real song has started since (the token moved on),
      // this late callback must leave it alone.
      const done = () => { if (token === playToken) { player.pause(); player.muted = false; } };
      if (p && p.then) p.then(done, () => { if (token === playToken) player.muted = false; }); else done();
    } catch { player.muted = false; }
  }

  // ---------- menu ----------
  function selectMode(m) {
    if (!MODES.some((x) => x.id === m)) m = 'all';
    mode = m;
    store('ab_mode', m);
    modeButtons.forEach((b) => {
      b.el.classList.toggle('on', b.id === m);
      b.el.setAttribute('aria-pressed', String(b.id === m));
    });
    $('mode-blurb').textContent = MODES.find((x) => x.id === m).blurb;

    const g = loadGame(m);
    const btn = $('btn-start'), note = $('start-note');
    paintHud(g);
    btn.disabled = !g.items.length;
    note.textContent = '';
    if (!g.items.length) {
      btn.textContent = 'NO SONGS YET';
    } else if (g.unl) {
      const best = Number(load('ab_best_unl') || 0);
      btn.textContent = '▶ PRESS START';
      if (best) note.textContent = `Your best: ${plural(best, 'song')}.`;
    } else if (g.done) {
      btn.textContent = 'VIEW RESULT';
      note.textContent = `Played today: ${g.hits} of ${g.items.length}. New wheel tomorrow.`;
    } else if (!g.fresh) {
      btn.textContent = '▶ CONTINUE';
      note.textContent = `Run in progress: ${g.time} s left.`;
    } else {
      btn.textContent = '▶ PRESS START';
    }
  }

  // The main menu button: start, continue, or look at today's finished wheel.
  function go() {
    const g = loadGame(mode);
    if (!g.items.length) return;
    runId++;
    game = g;
    buildWheel();
    refreshPreviews();
    if (g.done) { raiseRecord(false); showEnd(); } else start();
  }

  function toMenu() {
    runId++;
    clearInterval(clock);
    clearInterval(nextTimer);
    stopSnippet('');
    game = null;
    wheel.classList.remove('free');
    if (document.body) document.body.classList.remove('started');
    show('start');
    selectMode(mode);
  }

  // ---------- game flow ----------
  function start() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const run = runId;
    game.fresh = false;
    raiseRecord(true);
    show('play');
    unlockAudio();
    clearInterval(clock);
    clock = setInterval(tick, 1000);

    // Grace time: the record rises and the letters land while a 3-2-1 counts down.
    // The clock and the first song only start after it.
    lock(true);
    loading = true;
    $('btn-play').hidden = true;
    $('btn-pass').hidden = game.unl;
    $('hint').textContent = 'GET READY';
    fx($('hint'), 'in');
    $('feedback').textContent = '';
    setBar(0);
    paint();
    const first = game.items[game.idx];
    if (first.state === 'pending' && !first.heard) { warm = new Audio(); warm.preload = 'auto'; warm.src = first.preview; }
    const count = (n) => {
      if (run !== runId) return; // the player went back to the menu
      if (n === 0) {
        if ($('snippet-label').dataset) delete $('snippet-label').dataset.fx; // back to the normal label style
        loading = false;
        if (game.items[game.idx].state !== 'pending') advance(); else showLetter();
        return;
      }
      $('snippet-label').textContent = String(n);
      fx($('snippet-label'), 'count');
      beep(n === 1 ? 660 : 440, 0.09);
      setTimeout(() => count(n - 1), 850);
    };
    count(3);
  }

  function showLetter() {
    const it = game.items[game.idx];
    if (game.unl) game.time = SONG_TIME; // unlimited: a fresh clock for every song
    $('hint').textContent = `TITLE ${it.contains ? 'CONTAINS' : 'STARTS WITH'} "${it.l}"`;
    fx($('hint'), 'in');
    fx($('needle'), 'tap');
    $('feedback').textContent = '';
    $('feedback').className = 'feedback';
    $('btn-play').hidden = true;
    input.value = '';
    lock(false);
    paint();
    if (it.heard) stopSnippet('ALREADY PLAYED THIS LAP');
    else { playSnippet(); preloadNext(); }
    input.focus({ preventScroll: true });
  }

  function tick() {
    if (!game || game.done || game.locked || loading) return;
    game.time--;
    if (game.time <= (game.unl ? 5 : 10) && game.time > 0) beep(988, 0.04);
    if (game.time <= 0) {
      game.time = 0;
      if (game.unl) judge(null); else finish(); // unlimited: running out of time on a song costs a life
      return;
    }
    paint();
    saveGame();
  }

  function lock(on) {
    game.locked = on;
    input.disabled = on;
    $('btn-pass').disabled = on;
    $('form').querySelector('[type=submit]').disabled = on;
  }

  // Wheel: next pending letter, wrapping around; none left means the wheel is complete.
  // Unlimited: simply the next song.
  function advance() {
    if (!game || game.done) return;
    const n = game.items.length;
    if (game.unl) {
      if (game.idx + 1 >= n) { finish(); return; } // named the whole catalogue
      game.idx++;
      showLetter();
      return;
    }
    for (let step = 1; step <= n; step++) {
      const i = (game.idx + step) % n;
      if (game.items[i].state === 'pending') {
        game.idx = i;
        saveGame();
        showLetter();
        return;
      }
    }
    finish();
  }

  function answer() {
    if (!game || game.done || game.locked) return;
    const text = input.value.trim();
    if (text) judge(text);
  }

  // Marks the current song right or wrong. text === null means the song's time ran out.
  function judge(text) {
    const it = game.items[game.idx];
    const fb = $('feedback');
    const run = runId;
    let wait;
    lock(true);
    stopSnippet('');
    $('btn-play').hidden = true;
    it.heard = true;
    if (text !== null && isCorrect(text, [it.title, ...(it.alt || [])])) {
      it.state = 'ok';
      game.hits++;
      fb.textContent = `✔ ${it.title} — ${it.artist}`;
      fb.className = 'feedback ok';
      sfxHit(game.hits);
      fx(tiles[game.idx], 'ok');
      fx($('hits'), 'bump');
      setTimeout(() => { if (run === runId) burst(['#3dff7a', '#ffe45c', '#ffffff', '#29e7ff'], 18, 2.2); }, 330); // as the flip lands
      wait = 1100;
    } else {
      it.state = 'ko';
      game.misses++;
      if (game.unl) game.lives--;
      fb.textContent = `${text === null ? '⏱ TIME UP' : '✖ IT WAS'}: ${it.title} — ${it.artist}`;
      fb.className = 'feedback ko';
      sfxMiss();
      fx(tiles[game.idx], 'ko');
      fx($('misses'), 'bump');
      fx($('panel'), 'shake');
      wait = 2300;
    }
    fx(fb, 'in');
    paint();
    saveGame();
    const over = game.unl && game.lives <= 0;
    setTimeout(() => { if (run === runId) (over ? finish : advance)(); }, wait);
  }

  function pass() {
    if (!game || game.unl || game.done || game.locked) return;
    const it = game.items[game.idx];
    if (!it.heard) return; // nothing to pass yet: the snippet has not played
    stopSnippet('');
    it.passed = true;
    it.heard = false; // a passed letter plays its snippet again when it comes back round
    sfxPass();
    fx(tiles[game.idx], 'pass');
    advance();
  }

  function finish() {
    clearInterval(clock);
    const g = game;
    stopSnippet('');
    g.done = true;
    g.locked = true;
    saveGame();
    if (g.unl) {
      const best = Number(load('ab_best_unl') || 0);
      g.best = Math.max(best, g.hits);
      g.newBest = g.hits > best;
      if (g.newBest) store('ab_best_unl', String(g.hits));
    }
    sfxEnd();
    showEnd();
  }

  function showEnd() {
    const g = game;
    raiseRecord(false);
    show('end');
    paint();
    const total = g.items.length;
    const won = g.unl ? g.hits === total : g.hits === total;
    $('shared').textContent = '';
    $('btn-again').hidden = !g.unl;
    clearInterval(nextTimer);

    if (g.unl) {
      $('end-title').textContent = won ? 'YOU NAMED THEM ALL!' : 'GAME OVER';
      $('end-summary').textContent = `You named ${plural(g.hits, 'song')}.` +
        (g.newBest ? ' New personal best!' : g.best ? ` Your best: ${g.best}.` : '');
      $('next').textContent = '';
      wheel.classList.remove('free');
      if (g.newBest || won) for (let k = 0; k < 4; k++) setTimeout(() => burst(DISCO, 22, 3), k * 450);
    } else {
      const pending = total - g.hits - g.misses;
      $('end-title').textContent = won ? 'WHEEL COMPLETE!' : 'NOT THIS TIME';
      $('end-summary').textContent = won
        ? `All ${total} songs named, with ${g.time} s to spare.`
        : `${g.hits} of ${total} right, ${g.misses} wrong, ${pending} unanswered.`;

      // The record takes a slow full lap so every letter's result passes under the needle.
      wheel.classList.add('lap');
      turn -= 360;
      wheel.style.setProperty('--rot', turn + 'deg');
      if (wheel.dataset) wheel.dataset.end = won ? 'win' : 'lose';
      if (won) for (let k = 0; k < 6; k++) setTimeout(() => burst(DISCO, 22, 3), k * 450);

      const countdown = () => {
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const s = Math.max(0, Math.floor((next - now) / 1000));
        $('next').textContent = `Next wheel in ${pad(Math.floor(s / 3600), 2)}:${pad(Math.floor(s / 60) % 60, 2)}:${pad(s % 60, 2)}`;
        if (s === 0) location.reload();
      };
      countdown();
      nextTimer = setInterval(countdown, 1000);
    }

    // Tracklist pop-up: the whole wheel, or every song met in an unlimited run.
    const list = $('tracklist');
    list.textContent = '';
    g.items.filter((it) => !g.unl || it.state !== 'pending').forEach((it, i) => {
      const li = document.createElement('li');
      li.style.setProperty('--i', String(Math.min(i, 30)));
      li.className = it.state === 'ok' ? 'ok' : it.state === 'ko' ? 'ko' : '';
      const l = document.createElement('span'); l.className = 'l'; l.textContent = it.l;
      const img = document.createElement('img'); img.src = it.art; img.alt = ''; img.loading = 'lazy';
      const t = document.createElement('div'); t.className = 't';
      const b = document.createElement('b'); b.textContent = it.title;
      const s = document.createElement('span'); s.textContent = it.artist + ' ';
      t.append(b, s);
      if (it.url) {
        const a = document.createElement('a');
        a.href = it.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '♪ Apple Music';
        t.append(a);
      }
      li.append(l, img, t);
      list.appendChild(li);
    });
  }

  async function share() {
    const g = game;
    const link = location.href.split('?')[0];
    let text;
    if (g.unl) {
      text = `AlphaBeat Unlimited 🎵 I named ${plural(g.hits, 'song')} in a row. Can you beat that?\n${link}`;
    } else {
      const squares = g.items.map((it) => (it.state === 'ok' ? '🟩' : it.state === 'ko' ? '🟥' : '⬜')).join('');
      const label = MODES.find((x) => x.id === g.mode).label;
      text = `AlphaBeat ${label} #${day.no} 🎵 ${g.hits}/${g.items.length}${g.hits === g.items.length ? ' ✅' : ''}\n${squares}\n${link}`;
    }
    const note = $('shared');
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        note.textContent = 'COPIED TO CLIPBOARD';
        note.className = 'feedback ok';
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return; // share sheet dismissed
      note.textContent = 'COULD NOT SHARE FROM THIS BROWSER';
      note.className = 'feedback ko';
    }
  }

  // ---------- wiring ----------
  MODES.forEach((m) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mode';
    el.textContent = m.label;
    el.addEventListener('click', () => { beep(520, 0.04); selectMode(m.id); });
    $('modes').appendChild(el);
    modeButtons.push({ id: m.id, el });
  });

  $('btn-start').addEventListener('click', go);
  $('btn-again').addEventListener('click', go);
  $('btn-menu').addEventListener('click', toMenu);
  $('btn-quit').addEventListener('click', toMenu);
  $('btn-pass').addEventListener('click', pass);
  $('btn-play').addEventListener('click', playSnippet);
  $('btn-share').addEventListener('click', share);
  // pop-ups: how to play, and the tracklist once a run is over
  [['btn-how', 'dlg-how'], ['btn-tracks', 'dlg-tracks']].forEach(([btn, dlg]) => {
    $(btn).addEventListener('click', () => $(dlg).showModal());
    $(dlg).addEventListener('click', (e) => { if (e.target === $(dlg)) $(dlg).close(); }); // click outside closes
  });
  $('form').addEventListener('submit', (e) => { e.preventDefault(); answer(); });
  input.addEventListener('input', () => fx(input, 'type'));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || panels.play.hidden) return;
    if (document.querySelector('dialog[open]')) return; // Esc closes the pop-up instead
    e.preventDefault();
    pass();
  });
  $('btn-sfx').addEventListener('click', () => {
    sfx = !sfx;
    store('ab_sfx', sfx ? '1' : '0');
    paintSfx();
  });

  $('vol').value = Math.round(vol * 100);
  $('vol').addEventListener('input', (e) => {
    vol = Number(e.target.value) / 100;
    player.volume = vol * fade;
    store('ab_vol', String(Math.round(vol * 100)));
  });
  $('vol').addEventListener('change', () => beep(660, 0.06));

  // ?reset wipes today's attempts and the unlimited best (handy while testing).
  if (/[?&]reset\b/.test(location.search)) {
    try {
      MODES.forEach((m) => localStorage.removeItem('ab_run_' + m.id));
      localStorage.removeItem('ab_best_unl');
    } catch { /* ignore */ }
  }

  $('logo-art').innerHTML = pixelArt(NOTE, '#ffe600');
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = 'data:image/svg+xml,' + encodeURIComponent(pixelArt(NOTE, '#ff2e88'));
  document.head.appendChild(icon);

  drawDisc($('disc'));
  startBackdrop($('bg'));
  setupStage();
  $('year').textContent = new Date().getFullYear();
  $('day-no').textContent = `#${day.no}`;
  paintSfx();
  show('start');
  selectMode(load('ab_mode') || 'all');

  window.__alphabeat = { normalize, isCorrect, selectMode, peek: () => game && game.items[game.idx] };
})();
