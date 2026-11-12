// Bassong — every text of the game and the privacy page, in English and Spanish.
// Static text in the HTML is tagged with data-i18n* attributes and filled in by applyStatic();
// the game (app.js) asks for its own messages with tr() and trl().
// Song titles and answers are not translated: they are the original titles.

const STR = {
  en: {
    title: 'Bassong — The daily A to Z song quiz',
    desc: 'A new music wheel every day: 26 letters, 26 five-second song snippets, one listen per lap. Name every song before the clock runs out.',
    og_desc: '26 letters, 26 five-second snippets, one listen per lap. New wheel every day.',
    home: 'Bassong home',
    badge: 'DAILY WHEEL',
    how_btn: '? HOW TO PLAY',
    lang_label: 'Language',
    hud_label: 'Scoreboard',
    time: 'TIME',
    hits: 'HITS',
    secs_left: 'Seconds left',
    game_label: 'Game',
    mode_label: 'Game mode',
    h1: 'Name that tune,<br>A to Z',

    mode_all: 'GENERAL', mode_70s: '70S', mode_80s: '80S', mode_90s: '90S', mode_00s: '00S', mode_10s: '10S', mode_unl: 'UNLIMITED',
    dec_70s: '1970s', dec_80s: '1980s', dec_90s: '1990s', dec_00s: '2000s', dec_10s: '2010s',
    blurb_all: "Today's wheel: one song per letter, hits from every decade.",
    blurb_dec: "Today's wheel with songs from the {dec} only.",
    blurb_unl: 'No wheel: songs keep coming until you make {n} mistakes. How many can you name?',
    start: '▶ PRESS START',
    continue: '▶ CONTINUE',
    view_result: 'VIEW RESULT',
    no_songs: 'NO SONGS YET',
    song_one: '{n} song',
    song_other: '{n} songs',
    your_best: 'Your best: {songs}.',
    played_today: 'Played today: {h} of {total}. New wheel tomorrow.',
    in_progress: 'Run in progress: {s} s left.',

    song_title: 'Song title',
    ph: 'SONG TITLE…',
    enter: 'ENTER',
    pass: 'PASS ▶▶',
    menu_small: '✕ MENU',
    tap: '▶ TAP TO PLAY',
    get_ready: 'GET READY',
    loading: 'LOADING…',
    now_playing: 'NOW PLAYING',
    played: 'PLAYED',
    played_pass: 'PLAYED · PASS TO HEAR IT AGAIN NEXT LAP',
    audio_error: 'AUDIO ERROR',
    ready_label: 'READY',
    already_played: 'ALREADY PLAYED THIS LAP',
    hint_starts: 'TITLE STARTS WITH "{l}"',
    hint_contains: 'TITLE CONTAINS "{l}"',
    time_up: '⏱ TIME UP',
    it_was: '✖ IT WAS',

    end_unl_all: 'YOU NAMED THEM ALL!',
    game_over: 'GAME OVER',
    unl_summary: 'You named {songs}.',
    new_best: 'New personal best!',
    best_short: 'Your best: {n}.',
    wheel_done: 'WHEEL COMPLETE!',
    wheel_fail: 'NOT THIS TIME',
    won_summary: 'All {total} songs named, with {s} s to spare.',
    lost_summary: '{h} of {total} right, {m} wrong, {p} unanswered.',
    next_wheel: 'Next wheel in {time}',
    share: 'SHARE RESULT',
    again: '▶ PLAY AGAIN',
    tracks_btn: 'TRACKLIST',
    menu: 'MENU',
    share_unl: 'Bassong Unlimited 🎵 I named {songs} in a row. Can you beat that?',
    copied: 'COPIED TO CLIPBOARD',
    share_fail: 'COULD NOT SHARE FROM THIS BROWSER',

    how_title: 'How to play',
    how_1: 'Press <strong>START</strong>. You have 240 seconds for the whole wheel.',
    how_2: 'For each letter a song plays for 5 seconds. Its title starts with that letter, or contains it when the hint says so.',
    how_3: 'Type the title and hit Enter. Spelling does not need to be perfect.',
    how_4: 'Not sure? Press <strong>PASS</strong> (or Esc). The letter comes back on the next lap and its 5 seconds play once more.',
    how_5: 'Name all the songs before the clock runs out to complete the wheel.',
    how_wheels: '<strong>Wheels:</strong> GENERAL mixes every decade; 70s to 10s stick to one. Each has a new wheel every day, the same for everybody, and one attempt.',
    how_unl: '<strong>Unlimited:</strong> no wheel. Songs keep coming, 25 seconds each, until you make 3 mistakes. Play it as often as you like.',
    privacy_link: 'Privacy',
    got_it: 'GOT IT',
    tracks_title: "Today's tracklist",
    previews: 'Song previews provided courtesy of iTunes.',
    close: 'CLOSE',

    say_hello: ["Hi, I'm Bassong. Pick a wheel!"],
    say_all: ['Every decade in one wheel.'],
    say_decade: ['Good vintage, that one.', 'Ah, a classic catch.'],
    say_unl: ["Three strikes and you're fish food."],
    say_ready: ['Ready? Dropping the needle…'],
    say_ok: ['Nice catch!', 'Hooked it!', 'Reel good ear.', "That one's a keeper.", 'Fin-tastic.'],
    say_ko: ['That one got away.', 'Off the hook…', 'Holy mackerel, no.', "Something's fishy there."],
    say_pass: ['Throwing it back.', "We'll circle back.", 'Let it swim for now.'],
    say_slow: ['Too slow! I felt that.'],
    say_hurry: ["Hurry, I'm drying out here!"],
    say_tap: ['Tap play, my speakers are shy.'],
    say_win: ["A full wheel! You're off the scale."],
    say_lose: ["Tomorrow's another tide."],
    say_unl_end: '{songs}. Not bad for a land creature.',

    p_title: 'Privacy — Bassong',
    p_h1: 'Privacy',
    p_who_h: 'Who runs this site',
    p_who: 'Javier Verastegui — contact: <a href="mailto:javier.verastegui@uc.cl">javier.verastegui@uc.cl</a>.',
    p_stores_h: 'What the game stores',
    p_stores: "Bassong needs no account. It keeps your progress on today's wheels, your best unlimited run and your settings (sound, volume, mode and language) in your browser's local storage. None of it is sent to a server.",
    p_previews_h: 'Song previews',
    p_previews: "Song snippets and cover art are loaded from Apple's iTunes servers, which receive your IP address as with any web request. Previews are provided courtesy of iTunes.",
    p_fonts_h: 'Fonts',
    p_fonts: 'Fonts are loaded from Google Fonts.',
    p_ads_h: 'Ads and tracking',
    p_ads: 'Bassong shows no ads and uses no analytics or tracking cookies.',
    p_back: '← Back to the game',
  },

  es: {
    title: 'Bassong — El rosco musical diario, de la A a la Z',
    desc: 'Un rosco musical nuevo cada día: 26 letras, 26 fragmentos de canciones de cinco segundos, una escucha por vuelta. Acierta todas antes de que se acabe el tiempo.',
    og_desc: '26 letras, 26 fragmentos de cinco segundos, una escucha por vuelta. Rosco nuevo cada día.',
    home: 'Inicio de Bassong',
    badge: 'ROSCO DIARIO',
    how_btn: '? CÓMO JUGAR',
    lang_label: 'Idioma',
    hud_label: 'Marcador',
    time: 'TIEMPO',
    hits: 'ACIERTOS',
    secs_left: 'Segundos restantes',
    game_label: 'Juego',
    mode_label: 'Modo de juego',
    h1: 'Adivina la canción,<br>de la A a la Z',

    mode_all: 'GENERAL', mode_70s: '70S', mode_80s: '80S', mode_90s: '90S', mode_00s: '00S', mode_10s: '10S', mode_unl: 'ILIMITADO',
    dec_70s: 'los años 70', dec_80s: 'los años 80', dec_90s: 'los años 90', dec_00s: 'los años 2000', dec_10s: 'los años 2010',
    blurb_all: 'El rosco de hoy: una canción por letra, éxitos de todas las décadas.',
    blurb_dec: 'El rosco de hoy solo con canciones de {dec}.',
    blurb_unl: 'Sin rosco: las canciones no paran hasta que cometas {n} errores. ¿Cuántas sabes?',
    start: '▶ EMPEZAR',
    continue: '▶ CONTINUAR',
    view_result: 'VER RESULTADO',
    no_songs: 'AÚN NO HAY CANCIONES',
    song_one: '{n} canción',
    song_other: '{n} canciones',
    your_best: 'Tu mejor marca: {songs}.',
    played_today: 'Jugado hoy: {h} de {total}. Rosco nuevo mañana.',
    in_progress: 'Partida en curso: quedan {s} s.',

    song_title: 'Título de la canción',
    ph: 'TÍTULO DE LA CANCIÓN…',
    enter: 'ENVIAR',
    pass: 'PASAR ▶▶',
    menu_small: '✕ MENÚ',
    tap: '▶ TOCA PARA ESCUCHAR',
    get_ready: 'PREPÁRATE',
    loading: 'CARGANDO…',
    now_playing: 'SONANDO',
    played: 'YA SONÓ',
    played_pass: 'YA SONÓ · PASA Y VOLVERÁ A SONAR',
    audio_error: 'ERROR DE AUDIO',
    ready_label: 'LISTO',
    already_played: 'YA SONÓ ESTA VUELTA',
    hint_starts: 'EL TÍTULO EMPIEZA POR "{l}"',
    hint_contains: 'EL TÍTULO CONTIENE "{l}"',
    time_up: '⏱ SE ACABÓ EL TIEMPO',
    it_was: '✖ ERA',

    end_unl_all: '¡LAS ACERTASTE TODAS!',
    game_over: 'FIN DEL JUEGO',
    unl_summary: 'Acertaste {songs}.',
    new_best: '¡Nuevo récord personal!',
    best_short: 'Tu mejor marca: {n}.',
    wheel_done: '¡ROSCO COMPLETO!',
    wheel_fail: 'ESTA VEZ NO',
    won_summary: 'Las {total} canciones acertadas, con {s} s de sobra.',
    lost_summary: '{h} de {total} correctas, {m} falladas, {p} sin responder.',
    next_wheel: 'Próximo rosco en {time}',
    share: 'COMPARTIR',
    again: '▶ OTRA VEZ',
    tracks_btn: 'CANCIONES',
    menu: 'MENÚ',
    share_unl: 'Bassong Ilimitado 🎵 Acerté {songs} seguidas. ¿Me superas?',
    copied: 'COPIADO AL PORTAPAPELES',
    share_fail: 'NO SE PUDO COMPARTIR DESDE ESTE NAVEGADOR',

    how_title: 'Cómo jugar',
    how_1: 'Pulsa <strong>EMPEZAR</strong>. Tienes 240 segundos para todo el rosco.',
    how_2: 'Por cada letra suena una canción durante 5 segundos. Su título empieza por esa letra, o la contiene cuando la pista lo indica.',
    how_3: 'Escribe el título original (casi siempre en inglés) y pulsa Enter. No hace falta que esté perfecto ni llevar tildes.',
    how_4: '¿No lo sabes? Pulsa <strong>PASAR</strong> (o Esc). La letra vuelve en la siguiente vuelta y sus 5 segundos suenan otra vez.',
    how_5: 'Acierta todas las canciones antes de que se acabe el tiempo para completar el rosco.',
    how_wheels: '<strong>Roscos:</strong> GENERAL mezcla todas las décadas; de los 70 a los 10 se quedan en una. Cada uno tiene un rosco nuevo cada día, igual para todos, y un solo intento.',
    how_unl: '<strong>Ilimitado:</strong> sin rosco. Las canciones no paran, 25 segundos cada una, hasta que cometas 3 errores. Juégalo las veces que quieras.',
    privacy_link: 'Privacidad',
    got_it: 'ENTENDIDO',
    tracks_title: 'Canciones de hoy',
    previews: 'Fragmentos de canciones cortesía de iTunes.',
    close: 'CERRAR',

    say_hello: ['Hola, soy Bassong. ¡Elige un rosco!'],
    say_all: ['Todas las décadas en un solo rosco.'],
    say_decade: ['Qué buena época para pescar.', 'Ah, un clásico.'],
    say_unl: ['Tres fallos y eres comida para peces.'],
    say_ready: ['¿Listo? Bajando la aguja…'],
    say_ok: ['¡Buena pesca!', '¡Picó!', 'Menudo oído tienes.', 'Esa me la quedo.', '¡Pez-tástico!'],
    say_ko: ['Se te escapó.', 'Casi, casi…', '¡Ni de lejos, pez!', 'Eso huele a pescado.'],
    say_pass: ['La devuelvo al agua.', 'Volvemos luego.', 'Que siga nadando.'],
    say_slow: ['¡Muy lento! Eso dolió.'],
    say_hurry: ['¡Rápido, me estoy secando!'],
    say_tap: ['Dale a reproducir, mis altavoces son tímidos.'],
    say_win: ['¡Rosco completo! Qué pez gordo.'],
    say_lose: ['Mañana habrá otra marea.'],
    say_unl_end: '{songs}. No está mal para un animal terrestre.',

    p_title: 'Privacidad — Bassong',
    p_h1: 'Privacidad',
    p_who_h: 'Quién está detrás de este sitio',
    p_who: 'Javier Verastegui — contacto: <a href="mailto:javier.verastegui@uc.cl">javier.verastegui@uc.cl</a>.',
    p_stores_h: 'Qué guarda el juego',
    p_stores: 'Bassong no necesita cuenta. Guarda en el almacenamiento local de tu navegador tu progreso en los roscos de hoy, tu mejor marca en el modo ilimitado y tus ajustes (sonido, volumen, modo e idioma). Nada de eso se envía a ningún servidor.',
    p_previews_h: 'Fragmentos de canciones',
    p_previews: 'Los fragmentos y las carátulas se cargan desde los servidores de iTunes de Apple, que reciben tu dirección IP como en cualquier petición web. Los fragmentos son cortesía de iTunes.',
    p_fonts_h: 'Tipografías',
    p_fonts: 'Las tipografías se cargan desde Google Fonts.',
    p_ads_h: 'Publicidad y seguimiento',
    p_ads: 'Bassong no muestra anuncios ni usa analíticas ni cookies de seguimiento.',
    p_back: '← Volver al juego',
  },
};

let LANG = 'en';

// Saved choice first, then the browser's language; anything that is not Spanish gets English.
function detectLang() {
  try {
    const saved = localStorage.getItem('ab_lang');
    if (saved && STR[saved]) return saved;
  } catch { /* storage unavailable */ }
  const nav = (typeof navigator !== 'undefined' && (navigator.language || '')) || '';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

// A text by key, with {name} placeholders filled from vars. Falls back to English, then to the key.
function tr(key, vars) {
  let s = STR[LANG] && STR[LANG][key];
  if (s === undefined) s = STR.en[key];
  if (s === undefined) return key;
  return vars ? String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
}

// A list of texts by key (the mascot's lines).
function trl(key) {
  const list = (STR[LANG] && STR[LANG][key]) || STR.en[key];
  return Array.isArray(list) ? list : [];
}

// Fills in everything the HTML tagged for translation.
function applyStatic() {
  if (typeof document === 'undefined') return;
  if (document.documentElement) document.documentElement.lang = LANG;
  const each = (selector, fn) => document.querySelectorAll(selector).forEach(fn);
  each('[data-i18n]', (el) => { el.textContent = tr(el.dataset.i18n); });
  each('[data-i18n-html]', (el) => { el.innerHTML = tr(el.dataset.i18nHtml); });
  each('[data-i18n-ph]', (el) => { el.placeholder = tr(el.dataset.i18nPh); });
  each('[data-i18n-label]', (el) => { el.setAttribute('aria-label', tr(el.dataset.i18nLabel)); });
  each('[data-i18n-content]', (el) => { el.setAttribute('content', tr(el.dataset.i18nContent)); });
  each('[data-lang]', (el) => { el.classList.toggle('on', el.dataset.lang === LANG); });
}

// Switches language. Only a choice made with the button is remembered.
function setLang(lang, remember) {
  LANG = STR[lang] ? lang : 'en';
  if (remember) { try { localStorage.setItem('ab_lang', LANG); } catch { /* ignore */ } }
  applyStatic();
}
