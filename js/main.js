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

function loadHero() {
  const src = mobileMq.matches
    ? 'assets/hero-folders-mobile.svg'
    : 'assets/hero-folders.svg';

  fetch(src)
    .then((r) => r.text())
    .then((text) => {
      const svg = new DOMParser()
        .parseFromString(text, 'image/svg+xml')
        .documentElement;
      svg.classList.add('hero-folders');
      if (heroPlayed) svg.classList.add('no-anim'); /* breakpoint swap: don't replay intro */
      stage.replaceChildren(svg);
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
