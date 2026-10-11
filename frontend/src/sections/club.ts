/** Sección 2 · Banda Club Jorges (8.11): pausa visual entre dos efectos fuertes; solo revelado. */
import { fromHTML, type Component } from "../lib/dom";
import { CLUB_SEAL_SVG } from "../lib/icons";

export function createClubBand(): Component {
  const el = fromHTML<HTMLElement>(`
<section class="club-band" id="club" aria-label="Club Jorges">
  <div class="container club-band__inner" data-reveal>
    ${CLUB_SEAL_SVG}
    <p class="font-display t-h4 club-band__title">Únete a Club Jorges. Tu 5.ª pizza va por nuestra cuenta</p>
    <a class="btn btn-queso btn--sm" href="#club">Unirme</a>
    <p class="club-band__alt">o <a href="#club">ingresa</a></p>
  </div>
</section>`);
  return { el, destroy: () => el.remove() };
}
