import { createRoot } from 'react-dom/client';
import App from './App';

if (import.meta.env.DEV) {
  window.addEventListener('error', (e) => {
    const lines = String(e.error?.stack || e.message).split('\n').slice(0, 7);
    lines.forEach((l, i) => console.warn(`[trace ${i}] ${l.trim().slice(0, 220)}`));
  });
}

createRoot(document.getElementById('root')!).render(<App />);
