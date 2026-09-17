import { CALENDLY } from '../story';

/** The mark from the brand file, recoloured for the dark ground. */
export function Mark({ className = '' }: { className?: string }) {
  return <img className={`mark__img ${className}`} src="/logo-white.png" alt="" width={24} height={40} decoding="async" />;
}

export function Nav() {
  return (
    <header className="nav">
      <a className="mark" href="#surface" aria-label="AiStudio, back to the surface"><Mark /><span>AiStudio</span></a>
      <div className="nav__right">
        <a className="plate plate--ghost" href="#start">Start</a>
        <a className="plate" href={CALENDLY} target="_blank" rel="noopener"><span>Book a conversation</span></a>
      </div>
    </header>
  );
}
