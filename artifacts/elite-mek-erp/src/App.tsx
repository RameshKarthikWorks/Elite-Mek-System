import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/layout/AppShell";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import { ModuleScaffold } from "@/components/ModuleScaffold";
import { useAuthStore } from "@/lib/store/auth";
import { useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { applyTypography } from "@/lib/typography";
import { useLocalStorage } from "@/lib/store";

const queryClient = new QueryClient();

// Placeholder for un-implemented pages
const PlaceholderRoute = ({ title }: { title: string }) => (
  <ModuleScaffold title={title} description={`The ${title} module is currently under construction.`} />
);

function AuthenticatedApp() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        
        {/* Core Modules (Scaffolds for now to meet constraints, will expand fully if possible) */}
        <Route path="/projects"><PlaceholderRoute title="Project Management" /></Route>
        <Route path="/sites"><PlaceholderRoute title="Site Management" /></Route>
        <Route path="/work-orders"><PlaceholderRoute title="Work Order Management" /></Route>
        <Route path="/milestones"><PlaceholderRoute title="Milestone Module" /></Route>
        
        <Route path="/vendors"><PlaceholderRoute title="Vendor / Supplier Management" /></Route>
        <Route path="/purchase-orders"><PlaceholderRoute title="Purchase Order Management" /></Route>
        <Route path="/inventory"><PlaceholderRoute title="Inventory Management" /></Route>
        
        <Route path="/customers"><PlaceholderRoute title="Customer Management" /></Route>
        <Route path="/invoices"><PlaceholderRoute title="Invoice & Billing" /></Route>
        <Route path="/petty-cash"><PlaceholderRoute title="Petty Cash" /></Route>
        
        <Route path="/employees"><PlaceholderRoute title="Employee Management" /></Route>
        <Route path="/attendance"><PlaceholderRoute title="Attendance Management" /></Route>
        <Route path="/leave"><PlaceholderRoute title="Leave Management" /></Route>
        
        <Route path="/reminders"><PlaceholderRoute title="Reminder Module" /></Route>
        <Route path="/reports"><PlaceholderRoute title="Reports" /></Route>
        <Route path="/settings"><PlaceholderRoute title="Settings" /></Route>

        {/* Structured Placeholders */}
        <Route path="/payroll"><PlaceholderRoute title="Payroll Management" /></Route>
        <Route path="/tender"><PlaceholderRoute title="Tender / Estimation Management" /></Route>
        <Route path="/boq"><PlaceholderRoute title="BOQ Management" /></Route>
        <Route path="/inventory-movement"><PlaceholderRoute title="Inventory Movement Tracking" /></Route>
        <Route path="/asset"><PlaceholderRoute title="Asset Management" /></Route>
        <Route path="/expense"><PlaceholderRoute title="Expense Management" /></Route>
        <Route path="/revenue"><PlaceholderRoute title="Revenue Management" /></Route>
        <Route path="/payment-tracking"><PlaceholderRoute title="Payment Tracking" /></Route>
        <Route path="/contract"><PlaceholderRoute title="Contract Management" /></Route>
        <Route path="/approval-workflow"><PlaceholderRoute title="Approval Workflow Management" /></Route>
        <Route path="/document"><PlaceholderRoute title="Document Management" /></Route>
        <Route path="/mail-config"><PlaceholderRoute title="Mail Configuration" /></Route>
        <Route path="/category"><PlaceholderRoute title="Category Management" /></Route>
        
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function Router() {
  const { user } = useAuthStore();
  
  return (
    <Switch>
      <Route path="/login">
        {user ? () => {
           window.location.href = import.meta.env.BASE_URL.replace(/\/$/, "") + "/";
           return null;
        } : <Login />}
      </Route>
      <Route path="*">
        <AuthenticatedApp />
      </Route>
    </Switch>
  );
}

function App() {
  const [theme] = useLocalStorage<any>("elitemek_theme", {});
  const [typography] = useLocalStorage<any>("elitemek_typography", {});

  useEffect(() => {
    applyTheme(theme);
    applyTypography(typography);
  }, [theme, typography]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
