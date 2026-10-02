export function scrollToSection(lenis, id) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
