import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useCrudStore, SEED_PROJECTS, SEED_INVOICES, SEED_INVENTORY, 
  SEED_EMPLOYEES, SEED_ATTENDANCE, SEED_PAYROLL, SEED_EXPENSES, 
  SEED_ASSETS, SEED_REVENUE, SEED_PAYMENTS, SEED_INVENTORY_MOVEMENTS,
  SEED_APPROVALS
} from "@/lib/store/data";
import { useAuditLog } from "@/lib/audit";
import { ReportHeader } from "@/components/ReportHeader";
import { Printer, Download, FileSpreadsheet, FileText, ChevronRight, BarChart3, Users, IndianRupee, Package, ShoppingCart, CheckCircle, Shield } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from "recharts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "projects", name: "Project Reports", icon: BarChart3, reports: ["Project Status Summary", "Project Budget vs Actual", "Milestone Completion"] },
  { id: "hr", name: "HR Reports", icon: Users, reports: ["Employee Directory", "Attendance Summary", "Leave Balance Report", "Payroll Summary"] },
  { id: "finance", name: "Financial Reports", icon: IndianRupee, reports: ["Invoice Aging", "Revenue vs Expense", "Payment Received Report"] },
  { id: "inventory", name: "Inventory Reports", icon: Package, reports: ["Stock Level Report", "Inventory Movement Log", "Asset Register"] },
  { id: "procurement", name: "Procurement Reports", icon: ShoppingCart, reports: ["PO Status Report", "Vendor Performance", "Expense by Category"] },
  { id: "approval", name: "Approval Reports", icon: CheckCircle, reports: ["Pending Approvals", "Approval TAT Summary"] },
  { id: "audit", name: "Audit Reports", icon: Shield, reports: ["System Audit Log", "Login History"] }
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Reports() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [activeReport, setActiveReport] = useState(CATEGORIES[0].reports[0]);
  
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");
  const { data: invoices } = useCrudStore("invoices", SEED_INVOICES, "Invoices");
  const { data: inventory } = useCrudStore("inventory", SEED_INVENTORY, "Inventory");
  const { data: employees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");
  const { data: attendance } = useCrudStore("attendance", SEED_ATTENDANCE, "Attendance");
  const { data: payroll } = useCrudStore("payroll", SEED_PAYROLL, "Payroll");
  const { data: expenses } = useCrudStore("expenses", SEED_EXPENSES, "Expenses");
  const { data: assets } = useCrudStore("assets", SEED_ASSETS, "Assets");
  const { logs } = useAuditLog();

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handlePrint = () => window.print();

  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const header = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExport = (type: "excel" | "csv") => {
    let exportData: any[] = [];
    if (activeReport === "Project Status Summary") {
      exportData = projects.map(p => ({ ID: p.id, Name: p.name, Status: p.status, Progress: p.progress, Value: p.value }));
    } else if (activeReport === "Inventory Stock Levels") {
      exportData = inventory.map(i => ({ ID: i.id, Name: i.name, Category: i.category, Quantity: i.quantity, ReorderLevel: i.reorderLevel }));
    } else {
      exportData = [{ note: "Export not implemented for this report yet." }];
    }
    
    if (type === "excel") exportToExcel(exportData, activeReport.replace(/\\s+/g, '_'));
    else exportToCSV(exportData, activeReport.replace(/\\s+/g, '_'));
  };

  const renderReportContent = () => {
    // We render based on activeReport
    switch (activeReport) {
      case "Project Status Summary": {
        const activeCount = projects.filter(p => p.status === "Active").length;
        const completedCount = projects.filter(p => p.status === "Completed").length;
        const onHoldCount = projects.filter(p => p.status === "On Hold").length;
        
        const statusData = [
          { name: "Active", value: activeCount },
          { name: "Completed", value: completedCount },
          { name: "On Hold", value: onHoldCount },
          { name: "Planning", value: projects.length - activeCount - completedCount - onHoldCount }
        ].filter(d => d.value > 0);

        return (
          <div className="space-y-6">
            <ReportHeader title="Project Status Summary" subtitle="Overview of all projects" dateRange={new Date().toLocaleDateString()} />
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="print:hidden">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4 print:block mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground">Total Projects</span><span className="text-2xl font-bold">{projects.length}</span></CardContent></Card>
                  <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground">Active</span><span className="text-2xl font-bold text-primary">{activeCount}</span></CardContent></Card>
                  <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground">Completed</span><span className="text-2xl font-bold text-emerald-500">{completedCount}</span></CardContent></Card>
                  <Card><CardContent className="p-4 flex flex-col"><span className="text-sm text-muted-foreground">On Hold</span><span className="text-2xl font-bold text-amber-500">{onHoldCount}</span></CardContent></Card>
                </div>
                <div className="h-[300px] border rounded-lg p-4 bg-card">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {statusData.map((entry, index) => <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="print:block mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.id}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.manager}</TableCell>
                        <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                        <TableCell>{p.progress}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="chart" className="print:block mt-4">
                 <div className="h-[400px] border rounded-lg p-4 bg-card">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projects} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                      <RechartsTooltip />
                      <Bar dataKey="progress" fill="hsl(var(--primary))" name="Progress %" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );
      }
      
      case "Stock Level Report": {
        return (
          <div className="space-y-6">
            <ReportHeader title="Stock Level Report" subtitle="Current inventory vs minimum thresholds" dateRange={new Date().toLocaleDateString()} />
            <Tabs defaultValue="detailed" className="w-full">
              <TabsList className="print:hidden">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>
              <TabsContent value="detailed" className="print:block mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Min Level</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map(i => {
                      const isLow = i.quantity <= i.reorderLevel;
                      return (
                        <TableRow key={i.id} className={isLow ? "bg-destructive/5" : ""}>
                          <TableCell className="font-medium">{i.name}</TableCell>
                          <TableCell>{i.category}</TableCell>
                          <TableCell className="text-right">{i.quantity} {i.unit}</TableCell>
                          <TableCell className="text-right">{i.reorderLevel} {i.unit}</TableCell>
                          <TableCell>
                            <Badge variant={isLow ? "destructive" : "outline"} className={!isLow ? "text-emerald-500 border-emerald-200" : ""}>
                              {isLow ? "Low Stock" : "OK"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="chart" className="print:block mt-4">
                 <div className="h-[400px] border rounded-lg p-4 bg-card">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventory} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                      <RechartsTooltip />
                      <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Current Stock" />
                      <Bar dataKey="reorderLevel" fill="hsl(var(--destructive))" name="Min Level" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ReportHeader title={activeReport} subtitle="Data not yet available" />
            <p className="text-muted-foreground mt-8">Generate records in the module first to view this report.</p>
          </div>
        );
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #report-print-area, #report-print-area * { visibility: visible; }
          #report-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
      <div className="flex flex-col h-[calc(100vh-3.5rem)] print:h-auto">
        <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 print:p-0">
          <div className="print:hidden mb-4">
            <PageHeader title="Report Center" subtitle="Unified reporting and analytics engine" />
          </div>

          <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
            {/* Left Rail */}
            <Card className="w-full md:w-[260px] shrink-0 flex flex-col h-full overflow-y-auto print:hidden">
              <div className="p-4 space-y-4">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActiveCat = activeCategory === cat.id;
                  return (
                    <div key={cat.id} className="space-y-1">
                      <button
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActiveCat ? "bg-muted text-foreground" : "hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {cat.name}
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isActiveCat ? "rotate-90" : ""}`} />
                      </button>
                      
                      {isActiveCat && (
                        <div className="pl-6 pr-2 py-1 space-y-1">
                          {cat.reports.map(report => (
                            <button
                              key={report}
                              onClick={() => setActiveReport(report)}
                              className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                                activeReport === report 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {report}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Main Panel */}
            <Card className="flex-1 flex flex-col min-w-0 overflow-hidden print:border-none print:shadow-none bg-card" id="report-print-area">
              <div className="p-4 border-b bg-muted/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 print:hidden">
                <div>
                  <h2 className="font-semibold text-lg">{activeReport}</h2>
                  <p className="text-sm text-muted-foreground">{CATEGORIES.find(c => c.id === activeCategory)?.name} / {activeReport}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleExport("csv")} data-testid="export-csv">
                    <FileText className="w-4 h-4 mr-2" />CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("excel")} data-testid="export-excel">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} data-testid="export-print">
                    <Printer className="w-4 h-4 mr-2" />Print/PDF
                  </Button>
                </div>
              </div>

              <div className="p-4 border-b bg-card shrink-0 print:hidden flex flex-wrap gap-4 items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Date Range:</span>
                  <Input type="date" className="h-8 w-auto text-xs" />
                  <span>to</span>
                  <Input type="date" className="h-8 w-auto text-xs" />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible bg-white">
                {renderReportContent()}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
