/**
 * Iconos Lucide (6. Iconografía) importados uno a uno para tree-shaking,
 * más iconos propios (logo, sello del club, redes) en la misma rejilla.
 */
import {
  ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Flame, Leaf, MapPin,
  Menu, Minus, Pause, Play, Plus, RotateCw, ShoppingBag, Star, User, X,
  createElement, type IconNode,
} from "lucide";

const registry = {
  "arrow-right": ArrowRight, check: Check, "chevron-down": ChevronDown, "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight, "circle-alert": CircleAlert, "circle-check": CircleCheck, flame: Flame, leaf: Leaf,
  "map-pin": MapPin, menu: Menu, minus: Minus, pause: Pause, play: Play, plus: Plus, "rotate-cw": RotateCw,
  "shopping-bag": ShoppingBag, star: Star, user: User, x: X,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof registry;

/** SVG decorativo (aria-hidden). El texto accesible lo pone el control que lo contiene. */
export function icon(name: IconName, size = 20, strokeWidth?: number): SVGElement {
  const sw = strokeWidth ?? (size >= 32 ? 1.5 : size >= 24 ? 1.75 : 2);
  const svg = createElement(registry[name], { width: size, height: size, "stroke-width": sw, "aria-hidden": "true", focusable: "false" });
  return svg;
}

/**
 * Logotipo Jorges (pack de concepto, public/assets/jorges/logo-jorges-*.svg)
 * recoloreado a los tokens verificados: el símbolo usa --logo-mark (tomate-400
 * sobre carbón, tomate-600 sobre crema) y el wordmark currentColor (crema u
 * carbón según el header). viewBox recortado al contenido.
 */
export const LOGO_SVG = `<svg class="logo__svg" viewBox="14 30 884 158" aria-hidden="true" focusable="false"><g fill="none" style="stroke:var(--logo-mark)" stroke-width="7"><circle cx="91" cy="109" r="73"/><path d="M48 157 108 54 147 157" stroke-linecap="round" stroke-linejoin="round"/></g><path d="M79 109a5 5 0 1 0 10 0 5 5 0 1 0-10 0m30 16a5 5 0 1 0 10 0 5 5 0 1 0-10 0m2-39a5 5 0 1 0 10 0 5 5 0 1 0-10 0" style="fill:var(--logo-mark)"/><g fill="currentColor"><path d="M250 668H265C318 668 338 664 347 653C354 643 354 640 354 578V245C354 173 347 135 327 105C302 69 255 46 202 46C140 46 84 81 84 120C84 131 92 139 103 139C106 139 110 138 115 137C124 135 130 134 139 134C192 134 231 174 231 228C231 287 188 330 128 330C55 330 4 269 4 182C4 60 96 -15 245 -15C328 -15 395 5 446 46C509 96 534 161 534 280V578C534 641 534 643 541 653C550 664 570 668 624 668H639V722H250Z" transform="translate(193.00 154) scale(0.145 -0.145)"/><path d="M417 737C320 737 238 709 173 652C89 580 39 467 39 350C39 138 195 -15 412 -15C515 -15 593 9 660 63C747 131 794 234 794 351C794 467 744 581 660 652C593 710 515 737 417 737ZM418 685C472 685 514 659 543 608C576 548 594 458 594 350C594 147 532 37 418 37C360 37 318 62 290 114C257 176 239 263 239 369C239 477 256 557 290 614C319 663 359 685 418 685Z" transform="translate(295.96 154) scale(0.145 -0.145)"/><path d="M304 347H360C439 346 470 317 473 237L476 198C482 123 485 105 495 78C519 16 569 -15 647 -15C755 -15 817 45 817 152V164H763C762 101 747 69 717 69C706 69 694 75 688 83C682 92 681 99 676 131C676 136 674 145 672 159L665 197C650 287 612 332 525 361C578 371 604 378 629 390C690 421 725 476 725 541C725 601 696 652 644 686C606 710 539 722 447 722H20V668H35C89 668 108 664 117 654C124 643 124 640 124 578V145C124 83 124 79 117 69C108 58 88 55 35 54H20V0H420V54H394C341 55 320 58 311 69C304 79 304 83 304 145ZM304 402V604C303 659 311 667 375 668H399C493 668 534 627 534 535C534 434 492 402 359 402Z" transform="translate(425.75 154) scale(0.145 -0.145)"/><path d="M719 733H675L616 683C546 723 498 737 425 737C310 737 212 696 137 616C70 544 39 460 39 350C39 133 181 -15 388 -15C449 -15 510 0 555 26C580 41 596 54 626 84L675 -14H728V191C728 254 728 258 735 267C746 278 761 281 817 282V336H462V282H473C562 281 563 280 564 206V191C564 98 505 37 416 37C355 37 305 69 280 123C253 181 239 262 239 356C239 462 259 550 296 610C325 657 378 685 437 685C555 685 642 598 675 446H728Z" transform="translate(552.92 154) scale(0.145 -0.145)"/><path d="M687 722H16V668H31C84 668 104 664 113 653C120 643 120 640 120 578V144C120 82 120 79 113 69C104 58 84 54 31 54H16V0H695L707 269H654C616 124 541 55 420 54H390C317 52 299 66 300 125V346H317C396 346 444 296 455 204H509V543H455C444 451 396 401 317 401H300V582C298 652 312 667 386 668H414C539 665 599 611 641 462H693Z" transform="translate(682.70 154) scale(0.145 -0.145)"/><path d="M588 729H543L491 683C433 721 381 737 312 737C157 737 52 647 52 514C52 392 142 305 299 276L361 264C426 252 445 247 469 234C497 219 513 190 513 154C513 83 456 37 369 37C256 37 157 126 102 276H51L57 -7H102L164 52C225 6 288 -15 369 -15C525 -15 633 82 633 223C633 350 558 421 385 459L337 470C260 485 260 485 235 494C189 510 167 539 167 581C167 642 223 685 302 685C406 685 488 613 548 470H601Z" transform="translate(801.76 154) scale(0.145 -0.145)"/></g></svg>`;

/** Sello del Club Jorges (provisional), en currentColor. */
export const CLUB_SEAL_SVG = `<svg class="club-band__seal" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
<path d="M24 3l4.2 3.1 5.2-.4 1.9 4.9 4.6 2.4-.8 5.1 2.9 4.4-2.9 4.4.8 5.1-4.6 2.4-1.9 4.9-5.2-.4L24 45l-4.2-3.1-5.2.4-1.9-4.9-4.6-2.4.8-5.1L6 25.5l2.9-4.4-.8-5.1 4.6-2.4 1.9-4.9 5.2.4z"/>
<path d="M24 34 L16 17 A20 20 0 0 1 32 17Z"/><circle cx="22.5" cy="22" r="1.4"/><circle cx="26" cy="26" r="1.2"/>
</svg>`;

/** Iconos de redes (rellenos, simplificados) para el footer. */
export const SOCIAL_SVGS: Record<"instagram" | "facebook" | "tiktok", string> = {
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.5 3c.4 2.3 1.9 3.8 4 4v3.4c-1.5 0-2.9-.4-4-1.2v6.3a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.5a2.4 2.4 0 1 0 1.5 2.2V3h3.4z"/></svg>`,
};
