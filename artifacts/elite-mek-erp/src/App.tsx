import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/layout/AppShell";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import Projects from "@/pages/projects/Projects";
import Sites from "@/pages/sites/Sites";
import WorkOrders from "@/pages/work-orders/WorkOrders";
import Milestones from "@/pages/milestones/Milestones";
import Vendors from "@/pages/vendors/Vendors";
import PurchaseOrders from "@/pages/purchase-orders/PurchaseOrders";
import Inventory from "@/pages/inventory/Inventory";
import Customers from "@/pages/customers/Customers";
import Invoices from "@/pages/invoices/Invoices";
import PettyCash from "@/pages/petty-cash/PettyCash";
import Employees from "@/pages/employees/Employees";
import Attendance from "@/pages/attendance/Attendance";
import Leave from "@/pages/leave/Leave";
import Reminders from "@/pages/reminders/Reminders";
import Reports from "@/pages/reports/Reports";
import Settings from "@/pages/settings/Settings";
import AuditLogs from "@/pages/audit/AuditLogs";
import Payroll from "@/pages/payroll/Payroll";
import Tender from "@/pages/tender/Tender";
import BOQ from "@/pages/boq/BOQ";
import InventoryMovement from "@/pages/inventory-movement/InventoryMovement";
import Asset from "@/pages/asset/Asset";
import Expense from "@/pages/expense/Expense";
import Revenue from "@/pages/revenue/Revenue";
import PaymentTracking from "@/pages/payment-tracking/PaymentTracking";
import Contract from "@/pages/contract/Contract";
import ApprovalWorkflow from "@/pages/approval-workflow/ApprovalWorkflow";
import DocumentManagement from "@/pages/document/DocumentManagement";
import Category from "@/pages/category/Category";
import { ModuleScaffold } from "@/components/ModuleScaffold";
import { useAuthStore } from "@/lib/store/auth";
import { useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { applyTypography } from "@/lib/typography";
import { useLocalStorage } from "@/lib/store";

const queryClient = new QueryClient();

const PlaceholderRoute = ({ title, plannedFeatures }: { title: string; plannedFeatures?: string[] }) => (
  <ModuleScaffold title={title} description={`The ${title} module scaffold — full implementation coming soon.`} plannedFeatures={plannedFeatures} />
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

        {/* Fully implemented modules */}
        <Route path="/projects" component={Projects} />
        <Route path="/sites" component={Sites} />
        <Route path="/work-orders" component={WorkOrders} />
        <Route path="/milestones" component={Milestones} />
        <Route path="/vendors" component={Vendors} />
        <Route path="/purchase-orders" component={PurchaseOrders} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/customers" component={Customers} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/petty-cash" component={PettyCash} />
        <Route path="/employees" component={Employees} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/leave" component={Leave} />
        <Route path="/reminders" component={Reminders} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/audit-logs" component={AuditLogs} />
        
        <Route path="/payroll" component={Payroll} />
        <Route path="/tender" component={Tender} />
        <Route path="/boq" component={BOQ} />
        <Route path="/inventory-movement" component={InventoryMovement} />
        <Route path="/asset" component={Asset} />
        <Route path="/expense" component={Expense} />
        <Route path="/revenue" component={Revenue} />
        <Route path="/payment-tracking" component={PaymentTracking} />
        <Route path="/contract" component={Contract} />
        <Route path="/approval-workflow" component={ApprovalWorkflow} />
        <Route path="/document" component={DocumentManagement} />
        <Route path="/category" component={Category} />

        {/* Scaffolded placeholders */}
        <Route path="/mail-config">
          <PlaceholderRoute title="Mail Configuration" plannedFeatures={[
            "SMTP server setup", "Email templates editor", "Trigger rules",
            "Send-test diagnostic", "Mail delivery logs"
          ]} />
        </Route>

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
