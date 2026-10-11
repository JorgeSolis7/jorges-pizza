/** Borde de papel rasgado (J14, 7.6): SVG inline, fill=currentColor, 3 variantes. */
const PATHS = [
  "M0 48 L0 22 L38 30 L80 14 L122 26 L170 10 L214 24 L262 16 L300 30 L352 12 L398 24 L446 8 L494 22 L540 14 L590 28 L636 12 L684 26 L730 16 L780 30 L826 10 L872 24 L920 14 L966 28 L1012 12 L1060 22 L1108 10 L1154 26 L1200 16 L1200 48Z",
  "M0 48 L0 18 L46 28 L92 12 L140 24 L186 8 L236 22 L282 14 L330 28 L376 10 L426 26 L470 16 L520 30 L566 12 L612 24 L660 8 L708 22 L754 14 L804 28 L850 12 L898 26 L944 10 L994 24 L1040 14 L1088 28 L1134 12 L1200 24 L1200 48Z",
  "M0 48 L0 26 L42 12 L90 24 L134 10 L184 28 L228 14 L278 22 L322 8 L372 26 L418 12 L466 24 L514 10 L560 28 L608 16 L656 26 L702 10 L750 22 L798 12 L846 28 L892 14 L940 24 L988 8 L1034 22 L1082 14 L1130 28 L1200 14 L1200 48Z",
];

export function tear(position: "top" | "bottom", variant = 0): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = `tear tear--${position}`;
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `<svg viewBox="0 0 1200 48" preserveAspectRatio="none" focusable="false"><path fill="currentColor" d="${PATHS[variant % PATHS.length]}"/></svg>`;
  return wrap;
}
