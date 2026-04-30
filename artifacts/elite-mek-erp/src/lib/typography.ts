export const DEFAULT_TYPOGRAPHY = {
  fontFamily: "Inter",
  baseFontSize: 14,
  headingScale: "Comfortable",
  fontWeight: "600",
  letterSpacing: "0em",
  tableDensity: "Default",
  reportFont: "Inter",
  reportFontSize: 12
};

export function applyTypography(typography: Partial<typeof DEFAULT_TYPOGRAPHY>) {
  const root = document.documentElement;
  
  if (typography.baseFontSize) {
    root.style.fontSize = `${typography.baseFontSize}px`;
  }
  
  if (typography.fontFamily) {
    root.style.setProperty("--app-font-sans", `"${typography.fontFamily}", sans-serif`);
  }
  
  if (typography.letterSpacing) {
    root.style.setProperty("--tracking-normal", typography.letterSpacing);
  }
}
