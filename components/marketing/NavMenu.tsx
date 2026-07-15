'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="nav-menu" ref={rootRef}>
      <button
        className="nav-menu-trigger"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div className="nav-menu-panel" role="menu">
          <Link href="#how-it-works" role="menuitem" className="nav-menu-item" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/login" role="menuitem" className="nav-menu-item" onClick={() => setOpen(false)}>
            Login
          </Link>
          <Link href="/signup" role="menuitem" className="nav-menu-item nav-menu-cta" onClick={() => setOpen(false)}>
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
