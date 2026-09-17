import { CALENDLY } from '../story';

export function Mark() {
  return (
    <svg viewBox="0 0 72 120" aria-hidden="true" focusable="false">
      <path d="M46 6 L62 6 L26 114 L10 114 Z" />
      <circle cx="60" cy="52" r="8.5" />
      <path d="M48 68 L64 68 L50 114 L34 114 Z" />
    </svg>
  );
}

export function Nav({ sound, onSound }: { sound: boolean; onSound: () => void }) {
  return (
    <header className="nav">
      <a className="mark" href="#surface" aria-label="AiStudio, back to the surface"><Mark /><span>AiStudio</span></a>
      <div className="nav__right">
        <button className={`sound sign ${sound ? 'is-on' : ''}`} onClick={onSound} aria-pressed={sound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'}>
          <span>{sound ? 'Sound on' : 'Sound off'}</span>
          <span className="sound__bars" aria-hidden="true"><i /><i /><i /><i /></span>
        </button>
        <a className="plate" href={CALENDLY} target="_blank" rel="noopener">Book a conversation</a>
      </div>
    </header>
  );
}
