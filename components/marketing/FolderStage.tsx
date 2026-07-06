'use client';

import { useEffect, useRef } from 'react';

export function FolderStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const heroPlayedRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // guarded above; alias keeps the non-null narrowing inside the nested closures
    const stageEl: HTMLDivElement = stage;

    const mobileMq = window.matchMedia('(max-width: 767px)');

    function buildLayeredHero(svg: SVGSVGElement) {
      const viewBox = svg.getAttribute('viewBox') || '0 0 376 256';
      const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
      const defs = svg.querySelector('defs');

      const wrap = document.createElement('div');
      wrap.className = 'hero-folders';

      svg.querySelectorAll<SVGGElement>('.fan').forEach((group, index) => {
        const layer = svg.cloneNode(false) as SVGSVGElement;
        layer.setAttribute('preserveAspectRatio', 'xMidYMin slice');
        const variant = [...group.classList].filter((className) => className !== 'fan').join(' ');
        layer.setAttribute('class', `fan-layer ${variant}`);
        if (defs) layer.appendChild(defs.cloneNode(true));
        layer.appendChild(group);

        const suffix = `-L${index}`;
        const ids = [...layer.querySelectorAll<SVGElement>('[id]')].map((element) => element.id);
        let markup = new XMLSerializer().serializeToString(layer);
        for (const id of ids) {
          markup = markup.split(`url(#${id})`).join(`url(#${id}${suffix})`);
          markup = markup.split(`"#${id}"`).join(`"#${id}${suffix}"`);
          markup = markup.split(`id="${id}"`).join(`id="${id}${suffix}"`);
        }
        const fixed = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement;
        wrap.appendChild(fixed);
      });

      stageEl.replaceChildren(wrap);

      requestAnimationFrame(() => {
        wrap.querySelectorAll<SVGSVGElement>('.fan-layer').forEach((layer) => {
          const fan = layer.querySelector<SVGGElement>('.fan');
          if (!fan) return;
          const box = fan.getBBox();
          const cx = ((box.x + box.width / 2) / vbW) * 100;
          const cy = ((box.y + box.height / 2) / vbH) * 100;
          layer.style.transformOrigin = `${cx}% ${cy}%`;
        });
      });

      return wrap;
    }

    async function loadHero() {
      const mobile = mobileMq.matches;
      const src = mobile ? '/assets/hero-folders-mobile.svg' : '/assets/hero-folders.svg';

      try {
        const response = await fetch(src);
        const text = await response.text();
        const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement as unknown as SVGSVGElement;

        let root: SVGSVGElement | HTMLDivElement;
        if (mobile) {
          root = buildLayeredHero(svg);
        } else {
          svg.classList.add('hero-folders');
          svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
          stageEl.replaceChildren(svg);
          root = svg;
        }

        if (heroPlayedRef.current) root.classList.add('no-anim');
        heroPlayedRef.current = true;
      } catch {
        const img = document.createElement('img');
        img.className = 'hero-folders';
        img.src = src;
        img.alt = '';
        stageEl.replaceChildren(img);
      }
    }

    loadHero();
    mobileMq.addEventListener('change', loadHero);

    return () => mobileMq.removeEventListener('change', loadHero);
  }, []);

  return (
    <div className="stage" ref={stageRef} aria-hidden="true">
      <noscript>
        <img className="hero-folders" src="/assets/hero-folders.svg" alt="" />
      </noscript>
    </div>
  );
}
