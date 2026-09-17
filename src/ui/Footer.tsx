import { Mark } from './Nav';

export function Footer() {
  return (
    <footer className="foot">
      <span className="foot__brand"><Mark /><span>AiStudio</span></span>
      <span>Registered in DIFC, Dubai. Engineers across Dubai and India, deployed on site across Europe.</span>
      <span className="foot__links">
        <a href="https://www.linkedin.com/company/aistudioae/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="mailto:sharad@aistudio.ae">sharad@aistudio.ae</a>
        <span>© 2026</span>
      </span>
    </footer>
  );
}
