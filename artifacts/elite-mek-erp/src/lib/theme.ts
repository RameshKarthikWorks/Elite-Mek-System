export const DEFAULT_THEME = {
  background: "0 0% 100%",
  foreground: "222.2 84% 4.9%",
  primary: "221.2 83.2% 53.3%",
  sidebar: "210 40% 96.1%",
  sidebarForeground: "222.2 84% 4.9%",
  sidebarAccent: "214.3 31.8% 91.4%",
  card: "0 0% 100%",
};

export function applyTheme(theme: Partial<typeof DEFAULT_THEME>) {
  const root = document.documentElement;
  
  if (theme.background) root.style.setProperty("--background", theme.background);
  if (theme.foreground) root.style.setProperty("--foreground", theme.foreground);
  if (theme.primary) root.style.setProperty("--primary", theme.primary);
  if (theme.sidebar) root.style.setProperty("--sidebar", theme.sidebar);
  if (theme.sidebarForeground) root.style.setProperty("--sidebar-foreground", theme.sidebarForeground);
  if (theme.sidebarAccent) root.style.setProperty("--sidebar-accent", theme.sidebarAccent);
  if (theme.card) root.style.setProperty("--card", theme.card);
}
