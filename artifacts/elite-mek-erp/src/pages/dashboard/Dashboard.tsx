import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useCrudStore, SEED_PROJECTS, SEED_INVENTORY, SEED_EMPLOYEES, 
  SEED_EXPENSES, SEED_ASSETS, SEED_APPROVALS, SEED_ATTENDANCE
} from "@/lib/store/data";
import { HardHat, Users, ClipboardList, AlertTriangle, CheckCircle2, IndianRupee, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Legend } from "recharts";
import { useAuditLog } from "@/lib/audit";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth";

const REVENUE_DATA = [
  { name: 'Jan', revenue: 4000, expenses: 2400, net: 1600 },
  { name: 'Feb', revenue: 3000, expenses: 1398, net: 1602 },
  { name: 'Mar', revenue: 2000, expenses: 9800, net: -7800 },
  { name: 'Apr', revenue: 2780, expenses: 3908, net: -1128 },
  { name: 'May', revenue: 1890, expenses: 4800, net: -2910 },
  { name: 'Jun', revenue: 2390, expenses: 3800, net: -1410 },
];

const PROJECT_STATUS_DATA = [
  { name: 'Active', value: 400, color: 'hsl(var(--primary))' },
  { name: 'Planning', value: 300, color: 'hsl(var(--chart-2))' },
  { name: 'Completed', value: 300, color: 'hsl(var(--chart-3))' },
  { name: 'On Hold', value: 200, color: 'hsl(var(--chart-4))' },
];

const ATTENDANCE_DATA = [
  { name: 'Mon', present: 45, absent: 5 },
  { name: 'Tue', present: 42, absent: 8 },
  { name: 'Wed', present: 46, absent: 4 },
  { name: 'Thu', present: 48, absent: 2 },
  { name: 'Fri', present: 43, absent: 7 },
  { name: 'Sat', present: 30, absent: 20 },
  { name: 'Sun', present: 5, absent: 45 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { list: getProjects } = useCrudStore("projects", SEED_PROJECTS, "Projects");
  const { list: getInventory } = useCrudStore("inventory", SEED_INVENTORY, "Inventory");
  const { list: getEmployees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");
  const { list: getExpenses } = useCrudStore("expenses", SEED_EXPENSES, "Expenses");
  const { list: getAssets } = useCrudStore("assets", SEED_ASSETS, "Assets");
  const { list: getApprovals } = useCrudStore("approvals", SEED_APPROVALS, "Approvals");
  
  const { logs } = useAuditLog();
  const { user, isFirstLogin, clearFirstLogin } = useAuthStore();
  
  const projects = getProjects();
  const inventory = getInventory();
  const employees = getEmployees();
  const expenses = getExpenses();
  const assets = getAssets();
  const approvals = getApprovals();
  
  const activeProjects = projects.filter(p => p.status === "Active").length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel).length;
  const totalValue = projects.reduce((sum, p) => sum + p.value, 0);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Expense by Category
  const expenseByCategory = Object.entries(expenses.reduce((acc, curr) => {
    acc[curr.expenseType] = (acc[curr.expenseType] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  // Asset Status Distribution
  const assetStatusDist = Object.entries(assets.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  // Approval Pipeline
  const approvalPipeline = Object.entries(approvals.reduce((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = { module: curr.module, Pending: 0, Approved: 0, Rejected: 0 };
    if (curr.status === "Pending" || curr.status === "Approved" || curr.status === "Rejected") {
      acc[curr.module][curr.status]++;
    }
    return acc;
  }, {} as Record<string, any>)).map(([, value]) => value);

  // Inventory Low Stock Chart Data
  const lowStockChartData = inventory.filter(i => i.quantity <= i.reorderLevel * 1.2).map(i => ({
    name: i.name,
    quantity: i.quantity,
    reorderLevel: i.reorderLevel,
    isBreached: i.quantity < i.reorderLevel
  }));

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-blue-100 text-blue-600";
      case "UPDATE": return "bg-amber-100 text-amber-600";
      case "DELETE": return "bg-red-100 text-red-600";
      case "LOGIN": return "bg-emerald-100 text-emerald-600";
      case "APPROVE": return "bg-violet-100 text-violet-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Dialog open={isFirstLogin} onOpenChange={(open) => !open && clearFirstLogin()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome back, {user?.name}</DialogTitle>
            <DialogDescription>
              Here's a quick overview of what happened since your last login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <div className="space-y-2">
              {logs.slice(0, 3).map(log => (
                <div key={log.id} className="flex flex-col text-sm border-b pb-2">
                  <span className="font-medium text-foreground">{log.action} - {log.module}</span>
                  <span className="text-muted-foreground text-xs">{log.details}</span>
                  <span className="text-muted-foreground/60 text-[10px] mt-1">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Project Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Across all sites</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={REVENUE_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Expenses" />
                  <Line type="monotone" dataKey="net" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Net Profit" dot={{r: 4}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>Distribution of expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Last 7 days attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ATTENDANCE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="hsl(var(--primary))" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="hsl(var(--destructive))" strokeWidth={2} name="Absent" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Status</CardTitle>
            <CardDescription>Current state of assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetStatusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetStatusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Pipeline</CardTitle>
            <CardDescription>Status across modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={approvalPipeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="module" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                  <Legend />
                  <Bar dataKey="Approved" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="Pending" stackId="a" fill="hsl(var(--chart-4))" />
                  <Bar dataKey="Rejected" stackId="a" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Low Stock</CardTitle>
            <CardDescription>Items near or below reorder level</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lowStockChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <RechartsTooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                  <Legend />
                  <Bar dataKey="quantity" name="Current Stock">
                    {lowStockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isBreached ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                  <Bar dataKey="reorderLevel" fill="hsl(var(--muted-foreground))" name="Min Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-[300px] overflow-y-auto pr-2">
              {logs.slice(0, 8).map((log) => {
                const initials = log.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={log.id} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-medium text-xs ${getActionColor(log.action)}`}>
                      {initials}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{log.details}</span>
                      <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()} by {log.userName} in {log.module}</span>
                    </div>
                  </div>
                );
              })}
              {logs.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
