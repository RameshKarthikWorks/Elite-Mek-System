import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { useLocalStorage } from "@/lib/store";
import {
  applyTheme,
  DEFAULT_THEME,
  THEME_PRESETS,
  THEME_FIELDS,
  type ThemeColors,
} from "@/lib/theme";
import {
  applyTypography,
  DEFAULT_TYPOGRAPHY,
  FONT_OPTIONS,
  type Typography,
} from "@/lib/typography";
import { toast } from "sonner";
import { Save, Palette, Type, Building2, Mail, Bell, ShieldCheck, Banknote, Users, RotateCcw, Check } from "lucide-react";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <Label className="text-sm font-medium text-foreground/90 flex-1">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-9 font-mono text-xs uppercase"
          data-testid={`input-color-${label}`}
        />
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-9 w-9 rounded-md border-2 border-border shadow-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: value }}
              aria-label={`Pick ${label}`}
              data-testid={`button-color-${label}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker color={value} onChange={onChange} />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-3 font-mono text-xs uppercase"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function ThemePreview({ theme }: { theme: ThemeColors }) {
  return (
    <div
      className="rounded-xl overflow-hidden border-2 shadow-sm"
      style={{ backgroundColor: theme.background, color: theme.foreground, borderColor: theme.border }}
    >
      <div className="grid grid-cols-[140px_1fr]">
        {/* Mini sidebar */}
        <div
          className="p-3 space-y-1"
          style={{ backgroundColor: theme.sidebar, color: theme.sidebarForeground, borderRight: `1px solid ${theme.sidebarBorder}` }}
        >
          <div className="text-xs font-bold tracking-wider" style={{ color: theme.sidebarPrimary }}>ELITE MEK</div>
          <div className="h-px my-2" style={{ backgroundColor: theme.sidebarBorder }} />
          <div
            className="text-xs px-2 py-1.5 rounded-md font-medium"
            style={{ backgroundColor: theme.sidebarAccent, color: theme.sidebarAccentForeground }}
          >Dashboard</div>
          <div className="text-xs px-2 py-1.5 rounded-md opacity-80">Projects</div>
          <div className="text-xs px-2 py-1.5 rounded-md opacity-80">Inventory</div>
          <div className="text-xs px-2 py-1.5 rounded-md opacity-80">Reports</div>
        </div>
        {/* Mini workspace */}
        <div className="p-4 space-y-3">
          <div className="text-sm font-semibold">Live Preview</div>
          <div
            className="rounded-md p-3 border"
            style={{ backgroundColor: theme.card, color: theme.cardForeground, borderColor: theme.border }}
          >
            <div className="text-xs font-medium mb-2">Sample Card</div>
            <input
              className="w-full h-7 px-2 text-xs rounded border outline-none"
              style={{ borderColor: theme.input, backgroundColor: theme.background, color: theme.foreground }}
              defaultValue="Input field"
            />
            <div className="flex gap-2 mt-2">
              <button
                className="text-xs px-3 py-1.5 rounded-md font-medium"
                style={{ backgroundColor: theme.primary, color: theme.primaryForeground }}
              >Primary</button>
              <button
                className="text-xs px-3 py-1.5 rounded-md font-medium border"
                style={{ backgroundColor: theme.secondary, color: theme.secondaryForeground, borderColor: theme.border }}
              >Secondary</button>
              <button
                className="text-xs px-3 py-1.5 rounded-md font-medium"
                style={{ backgroundColor: theme.destructive, color: theme.destructiveForeground }}
              >Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypographyPreview({ typo }: { typo: Typography }) {
  return (
    <div
      className="rounded-xl border-2 p-6 space-y-3 bg-card"
      style={{ fontFamily: `"${typo.fontFamily}", sans-serif`, letterSpacing: `${typo.letterSpacing}em` }}
    >
      <h1
        style={{
          fontSize: `${typo.baseFontSize * 2 * (typo.headingScale === "Compact" ? 0.9 : typo.headingScale === "Spacious" ? 1.15 : 1)}px`,
          fontWeight: typo.headingWeight,
          lineHeight: 1.2,
        }}
      >Heading One</h1>
      <h2
        style={{
          fontSize: `${typo.baseFontSize * 1.5 * (typo.headingScale === "Compact" ? 0.9 : typo.headingScale === "Spacious" ? 1.15 : 1)}px`,
          fontWeight: typo.headingWeight,
          lineHeight: 1.3,
        }}
      >Heading Two</h2>
      <p style={{ fontSize: `${typo.baseFontSize}px`, color: "hsl(var(--muted-foreground))" }}>
        The quick brown fox jumps over the lazy dog. This is body text rendered at the configured base size and font family.
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <th className="text-left font-semibold" style={{ padding: "var(--table-row-padding, 0.625rem) 0.5rem" }}>Project</th>
            <th className="text-left font-semibold" style={{ padding: "var(--table-row-padding, 0.625rem) 0.5rem" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <td style={{ padding: "var(--table-row-padding, 0.625rem) 0.5rem" }}>Marina Bay HVAC</td>
            <td style={{ padding: "var(--table-row-padding, 0.625rem) 0.5rem" }}>Active</td>
          </tr>
          <tr>
            <td style={{ padding: "var(--table-row-padding, 0.625rem) 0.5rem" }}>Tower B Plumbing</td>
            <td style={{ padding: "var(--table-row-padding, 0.625rem) 0.5rem" }}>On Hold</td>
          </tr>
        </tbody>
      </table>
      <button
        className="px-4 py-2 rounded-md text-white font-medium"
        style={{ backgroundColor: "hsl(var(--primary))", fontSize: `${typo.baseFontSize}px` }}
      >Sample Button</button>
    </div>
  );
}

export default function Settings() {
  const [storedTheme, setStoredTheme] = useLocalStorage<ThemeColors>("elitemek_theme", DEFAULT_THEME);
  const [storedTypo, setStoredTypo] = useLocalStorage<Typography>("elitemek_typography", DEFAULT_TYPOGRAPHY);

  // Local working copy so previews update instantly while editing.
  const [theme, setTheme] = useState<ThemeColors>({ ...DEFAULT_THEME, ...storedTheme });
  const [typo, setTypo] = useState<Typography>({ ...DEFAULT_TYPOGRAPHY, ...storedTypo });

  // Apply theme/typography globally as user edits.
  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);
  useEffect(() => {
    applyTypography(typo);
    setStoredTypo(typo);
  }, [typo]);

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: ThemeColors, name: string) => {
    setTheme(preset);
    toast.success(`Applied "${name}" theme`);
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    toast.success("Theme reset to defaults");
  };
  const resetTypo = () => {
    setTypo(DEFAULT_TYPOGRAPHY);
    toast.success("Typography reset to defaults");
  };

  const groups = ["Sidebar", "Buttons & Inputs", "Workspace"] as const;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" data-testid="text-title-settings">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure your Elite Mek ERP workspace, branding, and preferences.</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="appearance" data-testid="tab-appearance"><Palette className="h-4 w-4 mr-1.5" />Appearance</TabsTrigger>
          <TabsTrigger value="typography" data-testid="tab-typography"><Type className="h-4 w-4 mr-1.5" />Typography</TabsTrigger>
          <TabsTrigger value="company" data-testid="tab-company"><Building2 className="h-4 w-4 mr-1.5" />Company</TabsTrigger>
          <TabsTrigger value="mail" data-testid="tab-mail"><Mail className="h-4 w-4 mr-1.5" />Mail / SMTP</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications"><Bell className="h-4 w-4 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions"><ShieldCheck className="h-4 w-4 mr-1.5" />Permissions</TabsTrigger>
          <TabsTrigger value="finance" data-testid="tab-finance"><Banknote className="h-4 w-4 mr-1.5" />Tax & Currency</TabsTrigger>
          <TabsTrigger value="roles" data-testid="tab-roles"><Users className="h-4 w-4 mr-1.5" />Roles</TabsTrigger>
        </TabsList>

        {/* APPEARANCE */}
        <TabsContent value="appearance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Presets + groups */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Theme Presets</CardTitle>
                    <CardDescription>Click a preset to instantly recolor your entire workspace.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetTheme} data-testid="button-reset-theme">
                    <RotateCcw className="h-4 w-4 mr-1.5" />Reset
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {THEME_PRESETS.map((preset) => {
                      const isActive = JSON.stringify(theme) === JSON.stringify(preset.colors);
                      return (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset.colors, preset.name)}
                          className={`group relative text-left rounded-lg border-2 p-3 transition-all hover:shadow-md ${isActive ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                          data-testid={`preset-${preset.name}`}
                        >
                          {isActive && (
                            <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                          <div className="flex gap-1 mb-2">
                            <span className="h-8 w-8 rounded" style={{ backgroundColor: preset.colors.sidebar }} />
                            <span className="h-8 w-8 rounded" style={{ backgroundColor: preset.colors.primary }} />
                            <span className="h-8 w-8 rounded border" style={{ backgroundColor: preset.colors.background, borderColor: preset.colors.border }} />
                          </div>
                          <div className="text-sm font-semibold">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {groups.map((group) => (
                <Card key={group}>
                  <CardHeader>
                    <CardTitle className="text-base">{group}</CardTitle>
                    <CardDescription>
                      {group === "Sidebar" && "Colors used by the navigation sidebar."}
                      {group === "Buttons & Inputs" && "Primary buttons, input fields, focus rings, and accents — applies globally."}
                      {group === "Workspace" && "Main page background, cards, borders, and text."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y divide-border">
                    {THEME_FIELDS.filter((f) => f.group === group).map((f) => (
                      <ColorField
                        key={f.key}
                        label={f.label}
                        value={theme[f.key]}
                        onChange={(v) => updateColor(f.key, v)}
                      />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Preview sticky */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Live Preview</CardTitle>
                    <CardDescription>Updates instantly as you change colors.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ThemePreview theme={theme} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TYPOGRAPHY */}
        <TabsContent value="typography" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-primary" />Typography</CardTitle>
                    <CardDescription>Font family, size, weight, and density across the entire app.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetTypo} data-testid="button-reset-typo">
                    <RotateCcw className="h-4 w-4 mr-1.5" />Reset
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>App Font Family</Label>
                      <Select value={typo.fontFamily} onValueChange={(v) => setTypo({ ...typo, fontFamily: v })}>
                        <SelectTrigger data-testid="select-font-family"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((f) => (
                            <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Heading Weight</Label>
                      <Select value={typo.headingWeight} onValueChange={(v) => setTypo({ ...typo, headingWeight: v as Typography["headingWeight"] })}>
                        <SelectTrigger data-testid="select-heading-weight"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="400">Regular (400)</SelectItem>
                          <SelectItem value="500">Medium (500)</SelectItem>
                          <SelectItem value="600">Semibold (600)</SelectItem>
                          <SelectItem value="700">Bold (700)</SelectItem>
                          <SelectItem value="800">Extra Bold (800)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Base Font Size</Label>
                      <Badge variant="outline">{typo.baseFontSize}px</Badge>
                    </div>
                    <Slider
                      value={[typo.baseFontSize]}
                      min={12}
                      max={18}
                      step={1}
                      onValueChange={(v) => setTypo({ ...typo, baseFontSize: v[0] })}
                      data-testid="slider-base-font-size"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Letter Spacing</Label>
                      <Badge variant="outline">{typo.letterSpacing.toFixed(3)}em</Badge>
                    </div>
                    <Slider
                      value={[typo.letterSpacing * 1000]}
                      min={-20}
                      max={50}
                      step={5}
                      onValueChange={(v) => setTypo({ ...typo, letterSpacing: v[0] / 1000 })}
                      data-testid="slider-letter-spacing"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Heading Scale</Label>
                      <Select value={typo.headingScale} onValueChange={(v) => setTypo({ ...typo, headingScale: v as Typography["headingScale"] })}>
                        <SelectTrigger data-testid="select-heading-scale"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Compact">Compact</SelectItem>
                          <SelectItem value="Comfortable">Comfortable</SelectItem>
                          <SelectItem value="Spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Table Density</Label>
                      <Select value={typo.tableDensity} onValueChange={(v) => setTypo({ ...typo, tableDensity: v as Typography["tableDensity"] })}>
                        <SelectTrigger data-testid="select-table-density"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Compact">Compact</SelectItem>
                          <SelectItem value="Default">Default</SelectItem>
                          <SelectItem value="Comfortable">Comfortable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="text-sm font-semibold">Report Print</div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Report Font</Label>
                        <Select value={typo.reportFont} onValueChange={(v) => setTypo({ ...typo, reportFont: v })}>
                          <SelectTrigger data-testid="select-report-font"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((f) => (
                              <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Report Size</Label>
                          <Badge variant="outline">{typo.reportFontSize}pt</Badge>
                        </div>
                        <Slider
                          value={[typo.reportFontSize]}
                          min={8}
                          max={16}
                          step={1}
                          onValueChange={(v) => setTypo({ ...typo, reportFontSize: v[0] })}
                          data-testid="slider-report-font-size"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Live Preview</CardTitle>
                    <CardDescription>Reflects your typography choices.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TypographyPreview typo={typo} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* COMPANY */}
        <TabsContent value="company">
          <CompanyForm />
        </TabsContent>

        {/* MAIL */}
        <TabsContent value="mail">
          <MailForm />
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          <NotificationsForm />
        </TabsContent>

        {/* PERMISSIONS */}
        <TabsContent value="permissions">
          <PermissionsMatrix />
        </TabsContent>

        {/* TAX & CURRENCY */}
        <TabsContent value="finance">
          <FinanceForm />
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles">
          <RolesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompanyForm() {
  const [data, setData] = useLocalStorage("elitemek_company", {
    name: "Elite Mek Engineering",
    tagline: "Precision MEP for elite engineering excellence",
    gstin: "29ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    cin: "U74999KA2018PTC123456",
    address: "123 Industrial Park, Block A, Bengaluru 560100",
    phone: "+91 80 2345 6789",
    email: "info@elitemek.com",
    website: "www.elitemek.com",
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
        <CardDescription>Used on invoices, reports, and the report header.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className={`space-y-1.5 ${k === "address" || k === "tagline" ? "sm:col-span-2" : ""}`}>
              <Label className="capitalize text-xs font-medium">{k.replace(/([A-Z])/g, " $1")}</Label>
              {k === "address" || k === "tagline" ? (
                <Textarea value={v as string} onChange={(e) => setData({ ...data, [k]: e.target.value })} rows={2} data-testid={`input-${k}`} />
              ) : (
                <Input value={v as string} onChange={(e) => setData({ ...data, [k]: e.target.value })} data-testid={`input-${k}`} />
              )}
            </div>
          ))}
        </div>
        <Button onClick={() => toast.success("Company details saved")} data-testid="button-save-company">
          <Save className="mr-2 h-4 w-4" />Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}

function MailForm() {
  const [data, setData] = useLocalStorage("elitemek_smtp", {
    host: "smtp.gmail.com",
    port: "587",
    user: "noreply@elitemek.com",
    password: "",
    fromName: "Elite Mek ERP",
    secure: true,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP / Mail Server</CardTitle>
        <CardDescription>Outgoing mail server used for notifications, invoices, and reports.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Host</Label><Input value={data.host} onChange={(e) => setData({ ...data, host: e.target.value })} data-testid="input-smtp-host" /></div>
          <div className="space-y-1.5"><Label>Port</Label><Input value={data.port} onChange={(e) => setData({ ...data, port: e.target.value })} data-testid="input-smtp-port" /></div>
          <div className="space-y-1.5"><Label>Username</Label><Input value={data.user} onChange={(e) => setData({ ...data, user: e.target.value })} data-testid="input-smtp-user" /></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} data-testid="input-smtp-pass" /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>From Name</Label><Input value={data.fromName} onChange={(e) => setData({ ...data, fromName: e.target.value })} /></div>
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label className="text-sm font-medium">Use TLS / SSL</Label>
            <p className="text-xs text-muted-foreground">Strongly recommended for production.</p>
          </div>
          <Switch checked={data.secure} onCheckedChange={(v) => setData({ ...data, secure: v })} />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toast.success("SMTP settings saved")}><Save className="mr-2 h-4 w-4" />Save</Button>
          <Button variant="outline" onClick={() => toast.success("Test email sent")}>Send Test Email</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsForm() {
  const [prefs, setPrefs] = useLocalStorage("elitemek_notifications", {
    paymentDue: true,
    poApproval: true,
    leaveRequest: true,
    inventoryLow: true,
    contractExpiry: true,
    milestoneDue: true,
    dailyDigest: false,
    weeklyDigest: true,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose which alerts you want to receive in-app and via email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 max-w-2xl">
        {Object.entries(prefs).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-md border p-3">
            <Label className="capitalize text-sm font-medium">{k.replace(/([A-Z])/g, " $1")}</Label>
            <Switch checked={v} onCheckedChange={(val) => setPrefs({ ...prefs, [k]: val })} data-testid={`switch-${k}`} />
          </div>
        ))}
        <div className="pt-2">
          <Button onClick={() => toast.success("Notification preferences saved")}><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionsMatrix() {
  const ROLES = ["Super Admin", "Admin", "Project Manager", "Site Engineer", "HR Manager", "Finance Manager", "Store Keeper", "Employee", "Viewer"];
  const MODULES = ["Employees", "Projects", "Customers", "Vendors", "Invoices", "Inventory", "Reports", "Settings"];
  const ACTIONS = ["View", "Create", "Edit", "Delete", "Approve", "Export"];
  const [matrix, setMatrix] = useLocalStorage<Record<string, Record<string, Record<string, boolean>>>>("elitemek_permissions", {});

  const get = (role: string, mod: string, act: string) => matrix?.[role]?.[mod]?.[act] ?? (role === "Super Admin" || (act === "View" && role !== "Viewer" ? false : false));
  const set = (role: string, mod: string, act: string, val: boolean) => {
    const next = { ...(matrix || {}) };
    next[role] = { ...(next[role] || {}) };
    next[role][mod] = { ...(next[role][mod] || {}), [act]: val };
    setMatrix(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <CardDescription>Role × Module × Action. Persists immediately.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-semibold sticky left-0 bg-card">Role</th>
                <th className="text-left py-2 px-2 font-semibold">Module</th>
                {ACTIONS.map((a) => (
                  <th key={a} className="text-center py-2 px-2 font-semibold">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.flatMap((role) =>
                MODULES.map((mod) => (
                  <tr key={role + mod} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-2 font-medium sticky left-0 bg-card whitespace-nowrap">{role}</td>
                    <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">{mod}</td>
                    {ACTIONS.map((a) => (
                      <td key={a} className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={get(role, mod, a)}
                          onChange={(e) => set(role, mod, a, e.target.checked)}
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                          data-testid={`perm-${role}-${mod}-${a}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Button className="mt-4" onClick={() => toast.success("Permissions saved")}><Save className="mr-2 h-4 w-4" />Save Matrix</Button>
      </CardContent>
    </Card>
  );
}

function FinanceForm() {
  const [data, setData] = useLocalStorage("elitemek_finance", {
    currency: "INR",
    currencySymbol: "₹",
    taxName: "GST",
    taxRate: "18",
    financialYearStart: "April",
    invoicePrefix: "INV-",
    poPrefix: "PO-",
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax, Currency & Numbering</CardTitle>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="space-y-1.5">
            <Label className="capitalize text-xs">{k.replace(/([A-Z])/g, " $1")}</Label>
            <Input value={v as string} onChange={(e) => setData({ ...data, [k]: e.target.value })} data-testid={`input-${k}`} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button onClick={() => toast.success("Finance settings saved")}><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RolesList() {
  const ROLES = [
    { name: "Super Admin", desc: "Full system access", users: 1 },
    { name: "Admin", desc: "Operational administration", users: 2 },
    { name: "HR Manager", desc: "Employee, attendance, leave, payroll", users: 1 },
    { name: "Finance Manager", desc: "Invoices, payments, expenses", users: 2 },
    { name: "Project Manager", desc: "Projects, sites, work orders, milestones", users: 4 },
    { name: "Site Engineer", desc: "Site execution & daily reports", users: 12 },
    { name: "Sub Engineer", desc: "Assigned work execution", users: 8 },
    { name: "Supervisor", desc: "Team & shift supervision", users: 6 },
    { name: "Purchase Manager", desc: "Vendors, POs, procurement", users: 1 },
    { name: "Inventory Manager", desc: "Stores & inventory movement", users: 1 },
    { name: "Store Keeper", desc: "Day-to-day stores", users: 3 },
    { name: "Accounts Executive", desc: "Bookkeeping, reconciliations", users: 2 },
    { name: "Payroll Executive", desc: "Salary processing", users: 1 },
    { name: "Employee", desc: "Self-service portal", users: 56 },
    { name: "Viewer", desc: "Read-only", users: 4 },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Roles</CardTitle>
        <CardDescription>Built-in roles available across the ERP.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/30">
              <div>
                <div className="font-semibold text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
              <Badge variant="secondary">{r.users}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
