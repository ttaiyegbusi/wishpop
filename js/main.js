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

  form.innerHTML = '<p class="success">You’re on the list \u{1F389}</p>';
});

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
