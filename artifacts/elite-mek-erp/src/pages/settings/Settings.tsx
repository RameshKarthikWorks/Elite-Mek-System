import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/lib/store";
import { applyTheme, DEFAULT_THEME } from "@/lib/theme";
import { applyTypography, DEFAULT_TYPOGRAPHY } from "@/lib/typography";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Check, Save } from "lucide-react";

// Convert HSL string "h s% l%" to Hex for the color picker
// A naive approach for the sake of the mockup, in a real app use a library like 'color-convert'
function hslStringToHex(hslString: string) {
  // Simplified: just return a default hex if parsing fails
  return "#0f172a"; 
}

const THEME_PRESETS = [
  { name: "Elite White", colors: DEFAULT_THEME },
  { name: "Midnight", colors: { ...DEFAULT_THEME, background: "222.2 84% 4.9%", foreground: "210 40% 98%", card: "222.2 84% 4.9%", sidebar: "222.2 84% 4.9%" } },
  { name: "Steel Blue", colors: { ...DEFAULT_THEME, primary: "210 100% 50%", sidebar: "210 20% 96%" } },
  { name: "Forest", colors: { ...DEFAULT_THEME, primary: "142 71% 45%", sidebar: "142 20% 96%" } },
  { name: "Copper", colors: { ...DEFAULT_THEME, primary: "24 100% 50%", sidebar: "24 20% 96%" } },
];

export default function Settings() {
  const [theme, setTheme] = useLocalStorage<any>("elitemek_theme", DEFAULT_THEME);
  const [typography, setTypography] = useLocalStorage<any>("elitemek_typography", DEFAULT_TYPOGRAPHY);

  const handleThemeChange = (key: string, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const applyPreset = (presetTheme: any) => {
    setTheme(presetTheme);
    applyTheme(presetTheme);
    toast.success("Theme preset applied");
  };

  const handleTypographyChange = (key: string, value: any) => {
    const newTypo = { ...typography, [key]: value };
    setTypography(newTypo);
    applyTypography(newTypo);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="mail">Mail / SMTP</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input defaultValue="Elite Mek Engineering" />
              </div>
              <div className="space-y-2">
                <Label>GSTIN / Tax ID</Label>
                <Input defaultValue="29ABCDE1234F1Z5" />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue="123 Industrial Park, Block A" />
              </div>
              <Button onClick={() => toast.success("Settings saved")}><Save className="mr-2 h-4 w-4"/> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Theme Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_PRESETS.map((preset) => (
                      <Button 
                        key={preset.name} 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyPreset(preset.colors)}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Custom Colors (HSL format)</Label>
                  {Object.keys(DEFAULT_THEME).map((key) => (
                    <div key={key} className="grid grid-cols-3 items-center gap-4">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Input 
                        value={theme[key] || ""} 
                        onChange={(e) => handleThemeChange(key, e.target.value)}
                        className="col-span-2 font-mono text-xs"
                      />
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => applyPreset(DEFAULT_THEME)}>Reset to Defaults</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-background text-foreground space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">Logo</div>
                    <div>
                      <h3 className="font-bold text-lg">Elite Mek ERP</h3>
                      <p className="text-muted-foreground text-sm">Dashboard view</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 flex flex-col gap-2 bg-sidebar p-2 rounded border border-sidebar-border">
                      <div className="bg-sidebar-accent text-sidebar-accent-foreground px-2 py-1 rounded text-sm font-medium">Active Item</div>
                      <div className="text-sidebar-foreground px-2 py-1 text-sm">Inactive Item</div>
                    </div>
                    <div className="col-span-3 space-y-4">
                      <Card className="bg-card text-card-foreground border-card-border shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Sample Card</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm mb-4">This is how your content will look with the current color palette applied.</p>
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Primary Action</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Typography Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={typography.fontFamily} onValueChange={(val) => handleTypographyChange("fontFamily", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Base Font Size: {typography.baseFontSize}px</Label>
                  <Slider 
                    value={[typography.baseFontSize]} 
                    min={12} max={18} step={1}
                    onValueChange={(vals) => handleTypographyChange("baseFontSize", vals[0])} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Heading Scale</Label>
                  <Select value={typography.headingScale} onValueChange={(val) => handleTypographyChange("headingScale", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Compact">Compact</SelectItem>
                      <SelectItem value="Comfortable">Comfortable</SelectItem>
                      <SelectItem value="Spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Table Density</Label>
                  <Select value={typography.tableDensity} onValueChange={(val) => handleTypographyChange("tableDensity", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Compact">Compact</SelectItem>
                      <SelectItem value="Default">Default</SelectItem>
                      <SelectItem value="Comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typography Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 space-y-4">
                  <h1 className="text-4xl font-bold">Heading 1</h1>
                  <h2 className="text-3xl font-semibold">Heading 2</h2>
                  <h3 className="text-2xl font-medium">Heading 3</h3>
                  <p className="text-base">
                    This is standard body text. The quick brown fox jumps over the lazy dog. 
                    Engineering requires precision and clarity.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This is muted small text used for secondary information.
                  </p>
                  
                  <div className="mt-6 border rounded overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 font-medium">ID</th>
                          <th className="px-4 py-2 font-medium">Project</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-4 py-3">PRJ-001</td>
                          <td className="px-4 py-3">Marina Bay HVAC</td>
                          <td className="px-4 py-3">Active</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">PRJ-002</td>
                          <td className="px-4 py-3">Downtown Elec</td>
                          <td className="px-4 py-3">Planning</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Manage access control for different roles across modules.</p>
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Module</th>
                      <th className="px-4 py-3 font-medium text-center">View</th>
                      <th className="px-4 py-3 font-medium text-center">Create</th>
                      <th className="px-4 py-3 font-medium text-center">Edit</th>
                      <th className="px-4 py-3 font-medium text-center">Delete</th>
                      <th className="px-4 py-3 font-medium text-center">Approve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {["Projects", "Employees", "Invoices", "Inventory"].map((mod) => (
                      <tr key={mod} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{mod}</td>
                        <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded border-input" /></td>
                        <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded border-input" /></td>
                        <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded border-input" /></td>
                        <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-input" /></td>
                        <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-input" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Button onClick={() => toast.success("Permissions updated")}>Save Permissions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mail Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input defaultValue="smtp.elitemek.com" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input defaultValue="587" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input defaultValue="alerts@elitemek.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" defaultValue="••••••••" />
                </div>
              </div>
              <Button onClick={() => toast.success("Mail settings saved")}><Save className="mr-2 h-4 w-4"/> Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
