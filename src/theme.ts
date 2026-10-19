// ─── Theme SISBM CORE ─────────────────────────────────────────────────────────
// Thème dynamique sombre / clair piloté par des variables CSS posées sur
// <html data-theme="dark|light">. Le helper `v(name)` produit une référence
// var(--sisbm-*) utilisable dans les styles inline : la bascule de thème ne
// nécessite alors AUCUNE re-propagation dans les 25 fichiers consommateurs.
// Les valeurs des deux palettes sont posées par thème, sans re-propagation
// dans les composants consommateurs.

import { useState, useEffect, useCallback } from "react";

export type ThemeName = "dark" | "light";

/** Valeur de couleur résoluble dans les deux thèmes (var CSS ou couleur fixe). */
export type ThemedColor = string;

/** Référence une variable CSS du thème : `v("navy")` → `var(--sisbm-navy)`. */
export function v(key: string): string {
  return `var(--sisbm-${key})`;
}

/**
 * Applique une opacité à une couleur du thème.
 * - Référence var(--sisbm-*) → color-mix() (suit le thème courant).
 * - Couleur fixe (hex issue des mocks) → suffixe alpha hexadécimal.
 * - Couleur manquante/invalide → `transparent` (garde-fou : une clé de thème
 *   absente ne doit jamais interrompre le rendu de l'application).
 */
export function va(color: string | undefined | null, amount: string): string {
  if (typeof color !== "string" || color.trim() === "") return "transparent";
  const base = color.trim();
  const m = /^var\(--sisbm-([a-zA-Z]+)\)$/.exec(base);
  if (m) return `color-mix(in srgb, var(--sisbm-${m[1]}) ${amount}, transparent)`;
  const pct = parseFloat(amount) / 100;
  if (!Number.isNaN(pct)) {
    const full = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(base);
    if (full) {
      let h = full[1];
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      const alpha = Math.round(pct * 255).toString(16).padStart(2, "0");
      return `#${h}${alpha}`;
    }
  }
  return base;
}

// ─── Valeurs sombres ─────────────────────────────────────────────────────────
type VarMap = Record<string, string>;


const DARK_VARS: VarMap = {
  navy: "#FFFFFF",
  navyMid: "#FFFFFF",
  navyLight: "#DCEAF7",
  primary: "#286EA8",
  primaryLight: "#4B91C8",
  green: "#059669",
  red: "#DC2626",
  orange: "#D97706",
  gray: "#64748B",
  text: "#1A2332",
  textMuted: "#6B7A90",
  textDim: "#334155",
  border: "#D4E3F0",
  borderSoft: "rgba(232,240,247,0.9)",
  cardBg: "#FFFFFF",
  bg: "#F0F4F8",
  white: "#FFFFFF",
  hover: "rgba(40,110,168,0.08)",
  soft: "#EAF4FD",
  switchOff: "#CBD5E1",
  shadow: "rgba(15,23,42,0.16)",
  sideBg: "#0E508D",
  sideBgAlt: "#0A4479",
  sideBorder: "#245F91",
  sideText: "#F8FAFC",
  sideTextMuted: "#E2F0FF",
  sideAccent: "#8CC8FF",
  sideGreen: "#10B981",
};

// ─── Valeurs claires ─────────────────────────────────────────────────────────
const LIGHT_VARS: VarMap = {
  navy: "#FFFFFF",
  navyMid: "#FFFFFF",
  navyLight: "#DCEAF7",
  primary: "#286EA8",
  primaryLight: "#4B91C8",
  green: "#059669",
  red: "#DC2626",
  orange: "#D97706",
  gray: "#64748B",
  text: "#1A2332",
  textMuted: "#6B7A90",
  textDim: "#334155",
  border: "#D4E3F0",
  // Équivalent demandé de `border-slate-100/80` en mode clair.
  borderSoft: "rgba(232,240,247,0.9)",
  cardBg: "#FFFFFF",
  bg: "#F0F4F8",
  white: "#FFFFFF",
  hover: "rgba(40,110,168,0.08)",
  soft: "#EAF4FD",
  switchOff: "#CBD5E1",
  shadow: "rgba(15,23,42,0.16)",
  sideBg: "#F0F7FD",
  sideBgAlt: "#E4F0FA",
  sideBorder: "#C7DBEC",
  sideText: "#18324A",
  sideTextMuted: "#58718A",
  sideAccent: "#347FB8",
  sideGreen: "#047857",
};

export const themeVars: Record<ThemeName, VarMap> = {
  dark: DARK_VARS,
  light: LIGHT_VARS,
};

/**
 * Objet de compatibilité historique : `C.navy` → `var(--sisbm-navy)`, etc.
 * Les anciennes concaténations alpha (`C.primary + "22"`) doivent être
 * remplacées par `va(C.primary, "13%")` qui suit le thème courant.
 */
type ThemeRef = Record<string, string>;
export const C: ThemeRef = {
  navy: v("navy"),
  navyMid: v("navyMid"),
  navyLight: v("navyLight"),
  primary: v("primary"),
  primaryLight: v("primaryLight"),
  green: v("green"),
  red: v("red"),
  orange: v("orange"),
  gray: v("gray"),
  text: v("text"),
  textMuted: v("textMuted"),
  textDim: v("textDim"),
  border: v("border"),
  borderSoft: v("borderSoft"),
  cardBg: v("cardBg"),
  bg: v("bg"),
  white: v("white"),
  hover: v("hover"),
  soft: v("soft"),
  switchOff: v("switchOff"),
  shadow: v("shadow"),
  // Chrome latéral adapté à chaque thème
  sideBg: v("sideBg"),
  sideBgAlt: v("sideBgAlt"),
  sideBorder: v("sideBorder"),
  sideText: v("sideText"),
  sideTextMuted: v("sideTextMuted"),
  sideAccent: v("sideAccent"),
  sideGreen: v("sideGreen"),
};

const STORAGE_KEY = "sisbm-theme";

/** Applique un thème : variables CSS + attribut data-theme sur <html>. */
export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = themeVars[theme];
  Object.keys(vars).forEach((k) => {
    root.style.setProperty(`--sisbm-${k}`, vars[k]);
  });
  root.dataset.theme = theme;
}

function readStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "dark";
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    return val === "light" ? "light" : "dark";
  } catch (error) {
    console.warn("[SISBM CORE] Impossible de lire le thème mémorisé :", error);
    return "dark";
  }
}

/** Hook thème : bascule sombre/clair avec persistance localStorage. */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = readStoredTheme();
    // Synchronise les variables avant le premier rendu, même si le script
    // HTML a déjà posé data-theme sans avoir appliqué la palette complète.
    applyTheme(stored);
    return stored;
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn("[SISBM CORE] Impossible de mémoriser le thème :", error);
    }
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const nextTheme: ThemeName = event.newValue === "light" ? "light" : "dark";
      applyTheme(nextTheme);
      setTheme(nextTheme);
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme };
}

// ─── Hiérarchie des formules ──────────────────────────────────────────────────
export const tierOrder: Record<string, number> = { standard: 0, gold: 1, premium: 2 };

// ─── Statuts véhicules ────────────────────────────────────────────────────────
// Couleurs via variables de thème : vives sur fond sombre, assombries sur fond
// clair pour garantir le contraste du texte des pastilles.
export const statusConfig: Record<string, { color: string; label: string; dot: string }> = {
  moving: { color: C.green, label: "En déplacement", dot: "●" },
  alert: { color: C.orange, label: "En alerte", dot: "●" },
  stopped: { color: C.red, label: "À l'arrêt", dot: "●" },
  offline: { color: C.gray, label: "Hors ligne", dot: "●" },
}

// ─── Niveaux d'alerte ─────────────────────────────────────────────────────────
// Fonds = teinte translucide de la couleur de niveau : le composite fonctionne
// aussi bien sur une carte sombre que sur une carte blanche, et le texte suit
// automatiquement le thème (pas de fond clair sous un texte clair en sombre).
export const alertLevelConfig: Record<string, { bg: string; border: string; badge: string; badgeBg: string; badgeBorder: string; label: string }> = {
  critical: { bg: va(C.red, "14%"), border: C.red, badge: C.red, badgeBg: va(C.red, "14%"), badgeBorder: va(C.red, "40%"), label: "CRITIQUE" },
  major: { bg: va(C.orange, "14%"), border: C.orange, badge: C.orange, badgeBg: va(C.orange, "14%"), badgeBorder: va(C.orange, "40%"), label: "MAJEUR" },
  medium: { bg: va(C.gray, "14%"), border: C.gray, badge: C.gray, badgeBg: va(C.gray, "14%"), badgeBorder: va(C.gray, "40%"), label: "MOYEN" },
}
