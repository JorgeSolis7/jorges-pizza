/** Sección 10 · Footer (8.15): carbón, borde rasgado con parallax leve (J14). */
import { gsap } from "../motion/core";
import { mq } from "../motion/tokens";
import { fromHTML, qs, type Component } from "../lib/dom";
import { SOCIAL_SVGS } from "../lib/icons";
import { tear } from "../components/tear";

export function createFooter(): Component {
  const year = new Date().getFullYear();
  const el = fromHTML<HTMLElement>(`
<footer class="site-footer" id="locales" data-theme="dark">
  <div class="container footer-grid">
    <nav class="footer-col" aria-label="Pedidos">
      <ul class="footer-big">
        <li><a href="#menu">Pedir</a></li><li><a href="#arma-tu-pizza">Arma tu pizza</a></li>
        <li><a href="#locales">Locales</a></li><li><a href="#club">Club Jorges</a></li><li><a href="mailto:talento@jorges.pe">Trabaja con nosotros</a></li>
      </ul>
    </nav>
    <nav class="footer-col footer-col--small" aria-label="Información">
      <ul class="footer-small">
        <li><a href="#ingredientes">Nosotros</a></li><li><a href="#ingredientes">Ingredientes</a></li><li><a href="#menu">Alérgenos</a></li>
        <li><a href="#locales">Preguntas frecuentes</a></li><li><a href="mailto:hola@jorges.pe">Contacto</a></li>
      </ul>
      <p style="margin-top:24px;color:var(--color-masa-300)">Av. La Mar 1234, Miraflores, Lima<br/>Lun a dom · 12:00 a 23:00</p>
    </nav>
    <div class="footer-col footer-col--club">
      <p class="t-eyebrow">Club Jorges</p>
      <h2 class="t-h3" style="margin-top:8px">Tu 5.ª pizza va por nuestra cuenta</h2>
      <p>Suma una porción por cada pedido y recibe novedades de temporada antes que nadie.</p>
      <a class="btn btn-outline" href="#club" style="margin-top:20px">Unirme</a>
    </div>
  </div>
  <div class="container socials">
    <a class="social" href="https://instagram.com" aria-label="Instagram de Jorges"><span>${SOCIAL_SVGS.instagram}</span></a>
    <a class="social" href="https://facebook.com" aria-label="Facebook de Jorges"><span>${SOCIAL_SVGS.facebook}</span></a>
    <a class="social" href="https://tiktok.com" aria-label="TikTok de Jorges"><span>${SOCIAL_SVGS.tiktok}</span></a>
  </div>
  <div class="legal"><div class="container legal__inner">
    <span>© ${year} Jorges</span><a href="#locales">Términos</a><a href="#locales">Privacidad</a><a href="#locales">Cookies</a>
  </div></div>
</footer>`);
  el.prepend(tear("top", 2));

  const mm = gsap.matchMedia();
  const animate = (): void => {
    mm.add(mq.motion, () => {
      // Sube 16 px (de 16 → 0) para no abrir una rendija entre el borde y el footer.
      gsap.fromTo(qs(el, ".tear"), { y: 16 }, { y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
    });
  };
  return { el, animate, destroy: () => { mm.revert(); el.remove(); } };
}
