'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export type WaitlistFormHandle = {
  focusEmail: () => void;
};

export const WaitlistForm = forwardRef<WaitlistFormHandle>(function WaitlistForm(_, ref) {
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    focusEmail() {
      emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      emailRef.current?.focus({ preventScroll: true });
    },
  }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!valid) {
      const input = emailRef.current;
      input?.classList.remove('shake');
      void input?.offsetWidth;
      input?.classList.add('shake');
      input?.focus();
      setState('error');
      setMessage('Enter a valid email address.');
      return;
    }

    setState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          source: 'landing_page',
          referrer: document.referrer || null,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Could not join waitlist.');
      }

      if (typeof window !== 'undefined' && typeof window.va === 'function') {
        window.va('event', { name: 'waitlist_joined' });
      }

      setEmail('');
      emailRef.current?.blur();
      setState('success');
      setMessage('You are on the list 🎉');
      setModalOpen(true);
      confettiRain();
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not join waitlist.');
    }
  }

  return (
    <>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <input
          ref={emailRef}
          type="email"
          placeholder="Enter email address"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={state === 'loading'}
        />
        <button className="btn submit" type="submit" disabled={state === 'loading'}>
          {state === 'loading' ? 'Joining...' : 'Join wait list'}
        </button>
      </form>

      {message ? <p className={`form-message ${state}`}>{message}</p> : null}

      {modalOpen ? (
        <div className="modal">
          <button className="modal-backdrop" aria-label="Close" type="button" onClick={() => setModalOpen(false)} />
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalBody">
            <img className="modal-icon" src="/assets/logo-mark.svg" alt="" />
            <h2 id="modalTitle">Your spot is reserved. 🎁</h2>
            <p id="modalBody">You're on the WishPop waitlist. We'll email you as soon as early access opens. No spoilers, we promise.</p>
            <button className="btn modal-ok" type="button" onClick={() => setModalOpen(false)}>Okay!</button>
          </div>
        </div>
      ) : null}
    </>
  );
});

function confettiRain() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  const context = canvas.getContext('2d');
  if (!context) return;
  // guarded above; typed alias keeps the non-null narrowing inside the frame loop
  const ctx: CanvasRenderingContext2D = context;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);

  const colors = ['#3BC98A', '#F5A83B', '#2F7BF6', '#6D3BEF', '#F05A5A'];
  const count = Math.min(160, Math.max(80, Math.floor(width / 7)));
  const pieces = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.9,
    w: 6 + Math.random() * 5,
    h: 10 + Math.random() * 9,
    color: colors[index % colors.length],
    vy: 120 + Math.random() * 130,
    vx: (Math.random() - 0.5) * 14,
    phase: Math.random() * Math.PI * 2,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 8,
    flipFreq: 2 + Math.random() * 3,
  }));

  let start: number | null = null;
  let last: number | null = null;
  const rainMs = 4500;

  function frame(timestamp: number) {
    if (start === null) {
      start = timestamp;
      last = timestamp;
    }
    const dt = Math.min((timestamp - (last || timestamp)) / 1000, 0.05);
    last = timestamp;
    const seconds = (timestamp - start) / 1000;

    ctx.clearRect(0, 0, width, height);
    canvas.style.opacity = timestamp - start > rainMs ? '0' : '1';

    let alive = false;
    for (const piece of pieces) {
      piece.vy += 30 * dt;
      piece.y += piece.vy * dt;
      piece.x += piece.vx * dt;
      piece.rot += piece.rotSpeed * dt;
      if (piece.y > height + 30) continue;
      alive = true;
      if (piece.y < -25) continue;

      const flip = Math.cos(seconds * piece.flipFreq * Math.PI * 2 + piece.phase);
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rot);
      ctx.scale(1, Math.max(Math.abs(flip), 0.15));
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
    }

    if (alive && timestamp - start < rainMs + 1500) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}

declare global {
  interface Window {
    va?: (type: string, event?: { name: string; data?: Record<string, unknown> }) => void;
  }
}
