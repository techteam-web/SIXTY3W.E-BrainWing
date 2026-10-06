import { useRef, useState } from 'react';
import { gsap, useGSAP, E } from '../gsap/Gsapconfig';
import { Portal } from './Primitives';
import { CloseIcon } from './Icons';
import { VISITOR } from '../data/content';
import { normalisePhone, validName, saveVisitor, skipVisitor } from '../app/visitor';
import { useEventListener } from '../hooks/useEventListener';

// The name-and-number card that opens over the cover when a visitor presses ENTER.
//
// It is an arch-topped card over the landing, not a screen of its own: the visitor
// never loses sight of the tower they came in on, and SKIP is right there — a sales tool
// that holds the presentation hostage to a form is a sales tool nobody opens twice.
// See src/app/visitor.js for where the details go (this device, nowhere else).

export function VisitorCard({ onDone, onClose }) {
  const root = useRef(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(true);
  const [tried, setTried] = useState(false);

  const nameOk = validName(name);
  const phoneOk = normalisePhone(phone) !== null;

  useGSAP(
    () => {
      gsap.fromTo('[data-visitor-veil]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: E.out });
      gsap.fromTo(
        '[data-visitor-card]',
        { autoAlpha: 0, y: 28, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: E.out, delay: 0.05 },
      );
    },
    { scope: root },
  );

  const { contextSafe } = useGSAP({ scope: root });
  const leave = contextSafe((then) => {
    gsap.to('[data-visitor-card]', { autoAlpha: 0, y: 16, duration: 0.3, ease: E.in });
    gsap.to('[data-visitor-veil]', { autoAlpha: 0, duration: 0.35, ease: E.in, onComplete: then });
  });

  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      leave(onClose);
    }
  });

  const submit = (e) => {
    e.preventDefault();
    setTried(true);
    if (!nameOk || !phoneOk) return;
    saveVisitor({ name, phone, consent });
    leave(onDone);
  };

  const skip = () => {
    skipVisitor();
    leave(onDone);
  };

  return (
    <div ref={root} className="absolute inset-0 z-40 grid place-items-center p-[var(--screen-margin)]">
      <div
        data-visitor-veil
        aria-hidden="true"
        className="absolute inset-0 bg-w-void/55 backdrop-blur-[6px] max-md:backdrop-blur-none max-md:bg-w-void/75"
        onClick={() => leave(onClose)}
      />

      <form
        data-visitor-card
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-title"
        onSubmit={submit}
        noValidate
        className="relative flex w-[min(30rem,100%)] flex-col gap-[clamp(0.9rem,2.2vh,1.4rem)] border border-w-gold/40 px-[clamp(1.4rem,2.6vw,2.6rem)] pb-[clamp(1.4rem,3vh,2.2rem)] pt-[clamp(2.6rem,5vh,3.6rem)]"
        style={{
          // The arch crown at the mark's ratio of the card's width.
          borderTopLeftRadius: 'min(9.5rem, 31.558vw)',
          borderTopRightRadius: 'min(9.5rem, 31.558vw)',
          background:
            'linear-gradient(170deg, rgb(12 59 57 / 0.97) 0%, rgb(7 41 40 / 0.97) 60%, rgb(4 26 25 / 0.98) 100%)',
          boxShadow: '0 40px 90px -30px rgb(2 12 11 / 0.9), inset 0 1px 0 rgb(240 234 224 / 0.06)',
        }}
      >
        <button
          type="button"
          onClick={() => leave(onClose)}
          aria-label="Close"
          className="absolute right-[1em] top-[1em] grid h-[2.2em] w-[2.2em] place-items-center rounded-full text-w-cream/60 transition-colors hover:text-w-cream"
        >
          <CloseIcon size="1.2em" />
        </button>

        <header className="flex flex-col items-center gap-[0.5em] text-center">
          <span className="eyebrow text-w-gold">{VISITOR.eyebrow}</span>
          <h2
            id="visitor-title"
            className="text-title font-light uppercase tracking-[0.1em] text-w-cream"
          >
            {VISITOR.title}
          </h2>
          <p className="max-w-[34ch] text-caption leading-[1.55] text-w-cream/65">{VISITOR.lede}</p>
        </header>

        <Field
          label={VISITOR.name}
          error={tried && !nameOk ? 'Please enter your name.' : null}
        >
          <input
            type="text"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent py-[0.55em] text-body text-w-cream outline-none placeholder:text-w-cream/30"
            placeholder="Your name"
          />
        </Field>

        <Field
          label={VISITOR.phone}
          error={tried && !phoneOk ? 'Please enter a 10-digit mobile number.' : null}
        >
          <span className="flex items-center gap-[0.6em]">
            <span className="text-body text-w-gold/80">+91</span>
            <input
              type="tel"
              name="phone"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={16}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent py-[0.55em] text-body tabular-nums text-w-cream outline-none placeholder:text-w-cream/30"
              placeholder="98765 43210"
            />
          </span>
        </Field>

        <label className="flex cursor-pointer items-start gap-[0.7em] text-micro leading-[1.5] text-w-cream/55">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-[0.2em] h-[1.1em] w-[1.1em] shrink-0 accent-[#c8a16b]"
          />
          {VISITOR.consent}
        </label>

        <div className="flex flex-wrap items-center justify-between gap-[1em] pt-[0.3em]">
          <button
            type="button"
            onClick={skip}
            className="eyebrow text-w-cream/55 underline decoration-w-gold/40 underline-offset-[0.5em] transition-colors hover:text-w-cream"
          >
            {VISITOR.skip}
          </button>
          <Portal type="submit" onClick={undefined}>
            {VISITOR.submit}
          </Portal>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-[0.2em]">
      <span className="text-micro uppercase tracking-[0.22em] text-w-gold/85">{label}</span>
      <span
        className={`block border-b transition-colors focus-within:border-w-gold ${
          error ? 'border-[#e08a7a]' : 'border-w-cream/25'
        }`}
      >
        {children}
      </span>
      <span aria-live="polite" className="min-h-[1.2em] text-micro text-[#f0a898]">
        {error}
      </span>
    </label>
  );
}
