/**
 * Punto de entrada de Jorges: monta la home en orden de documento, carga datos
 * de la API y crea las animaciones (en orden, tras fuentes e imágenes de pins).
 */
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "./styles/fonts.css";
import "./styles/main.css";

import { initSmoothScroll, requestRefresh, ScrollTrigger, waitForLayoutAssets } from "./motion/core";
import { initReveals } from "./motion/reveals";
import type { Component } from "./lib/dom";
import { createHeader } from "./components/header";
import { createToast } from "./components/toast";
import { createHero } from "./sections/hero";
import { createClubBand } from "./sections/club";
import { createMenu } from "./sections/menu";
import { createSlices } from "./sections/slices";
import { createIngredients } from "./sections/ingredients";
import { createOven } from "./sections/oven";
import { createBoard } from "./sections/board";
import { createBuilder } from "./sections/builder";
import { createSeasonal } from "./sections/seasonal";
import { createEvents } from "./sections/events";
import { createFooter } from "./sections/footer";
import { createCartDrawer } from "./components/cartDrawer";
import { loadIngredients, loadMenu } from "./state/store";

const app = document.getElementById("app");
if (!app) throw new Error("Falta #app");

const header = createHeader();
const sections: Component[] = [
  createHero(),
  createClubBand(),
  createMenu(),
  createSlices(),
  createIngredients(),
  createOven(),
  createBoard(),
  createBuilder(),
  createSeasonal(),
  createEvents(),
];
const footer = createFooter();
const overlays: Component[] = [createToast(), createCartDrawer()];

const main = document.createElement("main");
main.id = "contenido";
main.append(...sections.map((s) => s.el));
app.append(header.el, main, footer.el);
for (const c of overlays) document.body.append(c.el);
for (const c of [header, ...sections, footer, ...overlays]) c.portals?.forEach((p) => document.body.append(p));

void loadMenu();
void loadIngredients();

async function startMotion(): Promise<void> {
  await waitForLayoutAssets(main);
  initSmoothScroll();
  // Orden de documento: importante para el cálculo de los espaciadores de los pins.
  header.animate?.();
  sections.forEach((s) => s.animate?.());
  footer.animate?.();
  initReveals();
  ScrollTrigger.refresh();
  window.addEventListener("load", () => requestRefresh(0), { once: true });
}
void startMotion();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    [header, ...sections, footer, ...overlays].forEach((c) => c.destroy());
    ScrollTrigger.getAll().forEach((t) => t.kill());
  });
}
