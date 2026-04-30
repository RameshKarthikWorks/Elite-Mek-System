import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrudStore, SEED_PROJECTS, SEED_INVENTORY, SEED_EMPLOYEES } from "@/lib/store/data";
import { HardHat, Users, ClipboardList, AlertTriangle, CheckCircle2, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useAuditLog } from "@/lib/audit";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth";

const REVENUE_DATA = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
];

const PROJECT_STATUS_DATA = [
  { name: 'Active', value: 400, color: 'hsl(var(--primary))' },
  { name: 'Planning', value: 300, color: 'hsl(var(--chart-2))' },
  { name: 'Completed', value: 300, color: 'hsl(var(--chart-3))' },
  { name: 'On Hold', value: 200, color: 'hsl(var(--chart-4))' },
];

export default function Dashboard() {
  const { list: getProjects } = useCrudStore("projects", SEED_PROJECTS, "Projects");
  const { list: getInventory } = useCrudStore("inventory", SEED_INVENTORY, "Inventory");
  const { list: getEmployees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");
  const { logs } = useAuditLog();
  const { user, isFirstLogin, clearFirstLogin } = useAuthStore();
  
  const projects = getProjects();
  const inventory = getInventory();
  const employees = getEmployees();
  
  const activeProjects = projects.filter(p => p.status === "Active").length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel).length;
  const totalValue = projects.reduce((sum, p) => sum + p.value, 0);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of all current projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROJECT_STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PROJECT_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-wrap text-sm">
              {PROJECT_STATUS_DATA.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top Projects Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${project.progress}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{log.details}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()} by {log.userName}</span>
                  </div>
                </div>
              ))}
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
