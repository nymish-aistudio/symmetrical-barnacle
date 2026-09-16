export function setupNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 28);
  window.addEventListener('scroll', update, { passive: true });
  update();
}
