'use client';

import { useEffect, useRef } from 'react';
import { FolderStage } from './FolderStage';
import { NavMenu } from './NavMenu';
import { WaitlistForm, WaitlistFormHandle } from './WaitlistForm';

export function MarketingHero() {
  const waitlistRef = useRef<WaitlistFormHandle>(null);

  useEffect(() => {
    const typeEl = document.getElementById('typeWord');
    if (!typeEl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = ['wishlist.', 'link.', 'surprise.'];
    const typeMs = 85;
    const deleteMs = 50;
    const holdMs = 2000;
    const gapMs = 400;
    let wordIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const erase = () => {
      const current = typeEl.textContent || '';
      if (current.length > 0) {
        typeEl.textContent = current.slice(0, -1);
        timeout = setTimeout(erase, deleteMs);
      } else {
        wordIndex = (wordIndex + 1) % words.length;
        timeout = setTimeout(type, gapMs);
      }
    };

    const type = () => {
      const target = words[wordIndex];
      const current = typeEl.textContent || '';
      if (current.length < target.length) {
        typeEl.textContent = target.slice(0, current.length + 1);
        timeout = setTimeout(type, typeMs);
      } else {
        timeout = setTimeout(erase, holdMs);
      }
    };

    timeout = setTimeout(erase, holdMs + 600);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="page">
      <nav className="nav">
        <div className="logo">WishPop</div>
        <NavMenu />
      </nav>

      <section className="hero">
        <h1 aria-label="One wishlist. Zero duplicate gifts.">
          One{' '}
          <span className="gray">
            <span id="typeWord">wishlist.</span>
            <span className="caret" />
          </span>
          <br />
          Zero <span className="gray">duplicate gifts.</span>
        </h1>
        <p className="sub">
          Create a wishlist, share one link, and let your friends quietly reserve gifts — without spoiling the surprise for you.
        </p>

        <WaitlistForm ref={waitlistRef} />
      </section>

      <FolderStage />
    </div>
  );
}
