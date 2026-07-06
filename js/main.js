const form = document.getElementById('waitlistForm');
const email = document.getElementById('email');

document.getElementById('navCta').addEventListener('click', () => {
  email.scrollIntoView({ behavior: 'smooth', block: 'center' });
  email.focus({ preventScroll: true });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = email.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (!valid) {
    email.classList.remove('shake');
    void email.offsetWidth; /* restart animation */
    email.classList.add('shake');
    email.focus();
    return;
  }

  email.value = '';
  email.blur();
  openModal();
  confettiRain();
});

/* --- success modal --- */

const modal = document.getElementById('successModal');
const modalOk = document.getElementById('modalOk');
let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.hidden = false;
  requestAnimationFrame(() => modalOk.focus());
}

function closeModal() {
  modal.hidden = true;
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

modalOk.addEventListener('click', closeModal);
modal.querySelector('[data-close]').addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (modal.hidden) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab') {
    e.preventDefault(); /* the Okay button is the only focusable element */
    modalOk.focus();
  }
});

/* --- confetti: canvas rain from the top in the folder colors --- */

function confettiRain() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);

  const COLORS = ['#3BC98A', '#F5A83B', '#2F7BF6', '#6D3BEF', '#F05A5A'];
  const COUNT = Math.min(160, Math.max(80, Math.floor(W / 7)));
  const pieces = [];
  for (let i = 0; i < COUNT; i++) {
    pieces.push({
      x: Math.random() * W,
      /* staggered above the viewport so the rain arrives in waves */
      y: -20 - Math.random() * H * 0.9,
      w: 6 + Math.random() * 5,
      h: 10 + Math.random() * 9,
      color: COLORS[i % COLORS.length],
      vy: 120 + Math.random() * 130,
      vx: (Math.random() - 0.5) * 14, /* faint constant drift, no zig-zag */
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 8,
      flipFreq: 2 + Math.random() * 3,
    });
  }

  let start = null;
  let last = null;
  const RAIN_MS = 4500; /* fade the tail off after this */

  function frame(t) {
    if (start === null) { start = t; last = t; }
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    const secs = (t - start) / 1000;

    ctx.clearRect(0, 0, W, H);
    canvas.style.opacity = t - start > RAIN_MS ? '0' : '1';

    let alive = false;
    for (const p of pieces) {
      p.vy += 30 * dt; /* gentle gravity */
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      p.rot += p.rotSpeed * dt;
      if (p.y > H + 30) continue;
      alive = true;
      if (p.y < -25) continue;

      const flip = Math.cos(secs * p.flipFreq * Math.PI * 2 + p.phase); /* 3D tumble */
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.max(Math.abs(flip), 0.15));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive && t - start < RAIN_MS + 1500) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}

/* Headline typewriter: the gray word cycles through relatable words,
   deleting and retyping letter by letter. Skipped for reduced motion. */
const WORDS = ['wishlist.', 'link.', 'surprise.'];
const typeEl = document.getElementById('typeWord');

if (typeEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const TYPE_MS = 85;
  const DELETE_MS = 50;
  const HOLD_MS = 2000;
  const GAP_MS = 400;
  let wordIndex = 0;

  const erase = () => {
    const current = typeEl.textContent;
    if (current.length > 0) {
      typeEl.textContent = current.slice(0, -1);
      setTimeout(erase, DELETE_MS);
    } else {
      wordIndex = (wordIndex + 1) % WORDS.length;
      setTimeout(type, GAP_MS);
    }
  };

  const type = () => {
    const target = WORDS[wordIndex];
    const current = typeEl.textContent;
    if (current.length < target.length) {
      typeEl.textContent = target.slice(0, current.length + 1);
      setTimeout(type, TYPE_MS);
    } else {
      setTimeout(erase, HOLD_MS);
    }
  };

  setTimeout(erase, HOLD_MS + 600);
}

/* Inline the folder illustration so its groups can run the fan-out
   opening animation (CSS keys off the .fan classes inside the SVG).
   Phones get a dedicated small composition: scaling the 1230px desktop
   artwork down with CSS meant re-rasterizing all its blur filters at
   full size every animation frame — the source of mobile jank. */
const stage = document.getElementById('stage');
const mobileMq = window.matchMedia('(max-width: 767px)');
let heroPlayed = false;

/* Mobile: split the composition into one <svg> per folder. Animating
   groups inside a single SVG forces a full repaint (filters included)
   every frame — desktops cope, phones drop frames. Separate sibling
   SVGs become independently GPU-composited layers, so the fan-out
   animates cached bitmaps instead of re-rasterizing artwork. */
function buildLayeredHero(svg) {
  const viewBox = svg.getAttribute('viewBox');
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
  const defs = svg.querySelector('defs');

  const wrap = document.createElement('div');
  wrap.className = 'hero-folders';

  svg.querySelectorAll('.fan').forEach((group, i) => {
    /* clone the real root (all original attrs incl. width/height) —
       synthetic bare <svg> roots rendered filter effects as raw black */
    const layer = svg.cloneNode(false);
    layer.setAttribute('preserveAspectRatio', 'xMidYMin slice');
    const variant = [...group.classList].filter((c) => c !== 'fan').join(' ');
    layer.setAttribute('class', `fan-layer ${variant}`);
    if (defs) layer.appendChild(defs.cloneNode(true));
    layer.appendChild(group);

    /* the cloned defs duplicate ids across layers, and url(#...) refs
       resolve document-wide to the first copy — namespace ids per layer
       so every filter/clip/gradient resolves inside its own layer */
    const suffix = `-L${i}`;
    const ids = [...layer.querySelectorAll('[id]')].map((el) => el.id);
    let markup = new XMLSerializer().serializeToString(layer);
    for (const id of ids) {
      markup = markup.split(`url(#${id})`).join(`url(#${id}${suffix})`);
      markup = markup.split(`"#${id}"`).join(`"#${id}${suffix}"`);
      markup = markup.split(`id="${id}"`).join(`id="${id}${suffix}"`);
    }
    const fixed = new DOMParser()
      .parseFromString(markup, 'image/svg+xml')
      .documentElement;
    wrap.appendChild(fixed);
  });

  stage.replaceChildren(wrap);

  /* rotate each layer around its own folder's center, not the canvas center */
  requestAnimationFrame(() => {
    wrap.querySelectorAll('.fan-layer').forEach((layer) => {
      const b = layer.querySelector('.fan').getBBox();
      const cx = ((b.x + b.width / 2) / vbW) * 100;
      const cy = ((b.y + b.height / 2) / vbH) * 100;
      layer.style.transformOrigin = `${cx}% ${cy}%`;
    });
  });

  return wrap;
}

function loadHero() {
  const mobile = mobileMq.matches;
  const src = mobile
    ? 'assets/hero-folders-mobile.svg'
    : 'assets/hero-folders.svg';

  fetch(src)
    .then((r) => r.text())
    .then((text) => {
      const svg = new DOMParser()
        .parseFromString(text, 'image/svg+xml')
        .documentElement;

      let root;
      if (mobile) {
        root = buildLayeredHero(svg);
      } else {
        svg.classList.add('hero-folders');
        svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
        stage.replaceChildren(svg);
        root = svg;
      }
      if (heroPlayed) root.classList.add('no-anim'); /* breakpoint swap: don't replay intro */
      heroPlayed = true;
    })
    .catch(() => {
      const img = document.createElement('img');
      img.className = 'hero-folders';
      img.src = src;
      img.alt = '';
      stage.replaceChildren(img);
    });
}

loadHero();
mobileMq.addEventListener('change', loadHero);
