export type Typography = {
  fontFamily: string;
  baseFontSize: number;
  headingScale: "Compact" | "Comfortable" | "Spacious";
  headingWeight: "400" | "500" | "600" | "700" | "800";
  letterSpacing: number; // em
  tableDensity: "Compact" | "Default" | "Comfortable";
  reportFont: string;
  reportFontSize: number;
};

export const DEFAULT_TYPOGRAPHY: Typography = {
  fontFamily: "Inter",
  baseFontSize: 14,
  headingScale: "Comfortable",
  headingWeight: "600",
  letterSpacing: 0,
  tableDensity: "Default",
  reportFont: "Inter",
  reportFontSize: 12,
};

export const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Manrope",
  "IBM Plex Sans",
  "Source Sans 3",
  "Poppins",
  "Space Grotesk",
];

const HEADING_SCALES: Record<Typography["headingScale"], number> = {
  Compact: 0.9,
  Comfortable: 1,
  Spacious: 1.15,
};

const TABLE_DENSITIES: Record<Typography["tableDensity"], string> = {
  Compact: "0.375rem",
  Default: "0.625rem",
  Comfortable: "0.875rem",
};

export function applyTypography(typography: Partial<Typography>) {
  const merged: Typography = { ...DEFAULT_TYPOGRAPHY, ...typography };
  const root = document.documentElement;

  root.style.fontSize = `${merged.baseFontSize}px`;
  root.style.setProperty("--app-font-sans", `"${merged.fontFamily}", sans-serif`);
  root.style.setProperty("--tracking-normal", `${merged.letterSpacing}em`);
  root.style.setProperty("--heading-scale", String(HEADING_SCALES[merged.headingScale]));
  root.style.setProperty("--heading-weight", merged.headingWeight);
  root.style.setProperty("--table-row-padding", TABLE_DENSITIES[merged.tableDensity]);
  root.style.setProperty("--report-font", `"${merged.reportFont}", sans-serif`);
  root.style.setProperty("--report-font-size", `${merged.reportFontSize}pt`);

  document.body.style.fontFamily = `"${merged.fontFamily}", sans-serif`;
  document.body.style.letterSpacing = `${merged.letterSpacing}em`;
}
