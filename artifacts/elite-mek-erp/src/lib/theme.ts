// Elite Mek ERP — global theme system.
// All colors stored as HEX in localStorage and applied to CSS variables (which expect "H S% L%").

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  destructive: string;
  destructiveForeground: string;
};

// Default = white-based with a deep navy sidebar + industrial blue accent.
// Strong color in sidebar and primary buttons; clean white workspace.
export const DEFAULT_THEME: ThemeColors = {
  background: "#ffffff",
  foreground: "#0f172a",
  card: "#ffffff",
  cardForeground: "#0f172a",
  primary: "#2563eb",
  primaryForeground: "#ffffff",
  secondary: "#f1f5f9",
  secondaryForeground: "#0f172a",
  accent: "#eff6ff",
  accentForeground: "#1d4ed8",
  muted: "#f8fafc",
  mutedForeground: "#64748b",
  border: "#e2e8f0",
  input: "#e2e8f0",
  ring: "#2563eb",
  sidebar: "#0f172a",
  sidebarForeground: "#e2e8f0",
  sidebarAccent: "#1e293b",
  sidebarAccentForeground: "#ffffff",
  sidebarBorder: "#1e293b",
  sidebarPrimary: "#3b82f6",
  sidebarPrimaryForeground: "#ffffff",
  destructive: "#dc2626",
  destructiveForeground: "#ffffff",
};

export const THEME_PRESETS: { name: string; description: string; colors: ThemeColors }[] = [
  {
    name: "Elite Default",
    description: "White workspace, deep navy sidebar",
    colors: DEFAULT_THEME,
  },
  {
    name: "Pure White",
    description: "Light sidebar, blue accents",
    colors: {
      ...DEFAULT_THEME,
      sidebar: "#f8fafc",
      sidebarForeground: "#0f172a",
      sidebarAccent: "#e2e8f0",
      sidebarAccentForeground: "#0f172a",
      sidebarBorder: "#e2e8f0",
      sidebarPrimary: "#2563eb",
    },
  },
  {
    name: "Steel Blue",
    description: "Cool industrial blue",
    colors: {
      ...DEFAULT_THEME,
      primary: "#0284c7",
      ring: "#0284c7",
      accent: "#e0f2fe",
      accentForeground: "#0369a1",
      sidebar: "#0c4a6e",
      sidebarAccent: "#075985",
      sidebarBorder: "#075985",
      sidebarPrimary: "#38bdf8",
    },
  },
  {
    name: "Forest",
    description: "Engineering green",
    colors: {
      ...DEFAULT_THEME,
      primary: "#16a34a",
      ring: "#16a34a",
      accent: "#dcfce7",
      accentForeground: "#15803d",
      sidebar: "#14532d",
      sidebarAccent: "#166534",
      sidebarBorder: "#166534",
      sidebarPrimary: "#4ade80",
    },
  },
  {
    name: "Copper",
    description: "Warm metallic accent",
    colors: {
      ...DEFAULT_THEME,
      primary: "#ea580c",
      ring: "#ea580c",
      accent: "#ffedd5",
      accentForeground: "#c2410c",
      sidebar: "#431407",
      sidebarAccent: "#7c2d12",
      sidebarBorder: "#7c2d12",
      sidebarPrimary: "#fb923c",
    },
  },
  {
    name: "Royal Purple",
    description: "Premium violet",
    colors: {
      ...DEFAULT_THEME,
      primary: "#7c3aed",
      ring: "#7c3aed",
      accent: "#ede9fe",
      accentForeground: "#6d28d9",
      sidebar: "#2e1065",
      sidebarAccent: "#4c1d95",
      sidebarBorder: "#4c1d95",
      sidebarPrimary: "#a78bfa",
    },
  },
  {
    name: "Midnight",
    description: "Dark workspace",
    colors: {
      ...DEFAULT_THEME,
      background: "#0f172a",
      foreground: "#f1f5f9",
      card: "#1e293b",
      cardForeground: "#f1f5f9",
      secondary: "#1e293b",
      secondaryForeground: "#f1f5f9",
      muted: "#1e293b",
      mutedForeground: "#94a3b8",
      accent: "#1e293b",
      accentForeground: "#60a5fa",
      border: "#334155",
      input: "#334155",
      sidebar: "#020617",
      sidebarBorder: "#1e293b",
    },
  },
];

// Convert "#rrggbb" -> "h s% l%" string used by Tailwind shadcn vars.
export function hexToHslString(hex: string): string {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned.length === 3
    ? cleaned.split("").map((c) => c + c).join("")
    : cleaned, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

const VAR_MAP: Record<keyof ThemeColors, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
};

export function applyTheme(theme: Partial<ThemeColors>) {
  const merged: ThemeColors = { ...DEFAULT_THEME, ...theme };
  const root = document.documentElement;
  (Object.keys(VAR_MAP) as (keyof ThemeColors)[]).forEach((key) => {
    const hex = merged[key];
    if (hex && typeof hex === "string" && hex.startsWith("#")) {
      root.style.setProperty(VAR_MAP[key], hexToHslString(hex));
    }
  });
  // Also expose card-foreground link (needed by some shadcn surfaces)
  root.style.setProperty("--popover", hexToHslString(merged.card));
  root.style.setProperty("--popover-foreground", hexToHslString(merged.cardForeground));
  root.style.setProperty("--sidebar-ring", hexToHslString(merged.sidebarPrimary));
}

// Theme color picker field metadata
export const THEME_FIELDS: { key: keyof ThemeColors; label: string; group: "Workspace" | "Sidebar" | "Buttons & Inputs" }[] = [
  { key: "background", label: "Page Background", group: "Workspace" },
  { key: "foreground", label: "Text Color", group: "Workspace" },
  { key: "card", label: "Card Background", group: "Workspace" },
  { key: "muted", label: "Muted Background", group: "Workspace" },
  { key: "border", label: "Border", group: "Workspace" },

  { key: "sidebar", label: "Sidebar Background", group: "Sidebar" },
  { key: "sidebarForeground", label: "Sidebar Text", group: "Sidebar" },
  { key: "sidebarAccent", label: "Sidebar Active Item", group: "Sidebar" },
  { key: "sidebarAccentForeground", label: "Sidebar Active Text", group: "Sidebar" },
  { key: "sidebarPrimary", label: "Sidebar Highlight", group: "Sidebar" },
  { key: "sidebarBorder", label: "Sidebar Border", group: "Sidebar" },

  { key: "primary", label: "Primary Button", group: "Buttons & Inputs" },
  { key: "primaryForeground", label: "Primary Button Text", group: "Buttons & Inputs" },
  { key: "secondary", label: "Secondary Button", group: "Buttons & Inputs" },
  { key: "accent", label: "Accent / Hover", group: "Buttons & Inputs" },
  { key: "accentForeground", label: "Accent Text", group: "Buttons & Inputs" },
  { key: "input", label: "Input Border", group: "Buttons & Inputs" },
  { key: "ring", label: "Input Focus Ring", group: "Buttons & Inputs" },
  { key: "destructive", label: "Destructive / Delete", group: "Buttons & Inputs" },
];
