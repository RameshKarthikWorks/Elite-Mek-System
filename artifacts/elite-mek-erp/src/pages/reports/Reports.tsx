import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCrudStore, SEED_PROJECTS, SEED_INVOICES, SEED_INVENTORY } from "@/lib/store/data";
import { ReportHeader } from "@/components/ReportHeader";
import { Printer, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CATEGORIES = [
  "Project Status Summary",
  "Invoice Aging",
  "Inventory Stock Levels",
  "Employee Attendance",
  "Financial Summary",
  "Payroll Report",
  "Audit Log Summary"
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("Project Status Summary");
  
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");
  const { data: invoices } = useCrudStore("invoices", SEED_INVOICES, "Invoices");
  const { data: inventory } = useCrudStore("inventory", SEED_INVENTORY, "Inventory");

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `${filename}.xlsx`);
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case "Project Status Summary":
        return (
          <div className="space-y-4">
            <ReportHeader title="Project Status Summary" subtitle="Overview of all active and planned projects" dateRange={new Date().toLocaleDateString()} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Name</TableHead>
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
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.progress}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="hidden print:block mt-8 text-sm text-muted-foreground text-center">
              End of Report
            </div>
          </div>
        );
      case "Invoice Aging":
        return (
          <div className="space-y-4">
            <ReportHeader title="Invoice Aging Report" subtitle="Outstanding and paid invoices overview" dateRange={new Date().toLocaleDateString()} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>{i.id}</TableCell>
                    <TableCell>{i.customerId}</TableCell>
                    <TableCell>{i.date}</TableCell>
                    <TableCell>{i.status}</TableCell>
                    <TableCell className="text-right">{formatCurrency(i.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case "Inventory Stock Levels":
        return (
          <div className="space-y-4">
            <ReportHeader title="Inventory Stock Levels" subtitle="Current stock and reorder levels" dateRange={new Date().toLocaleDateString()} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(i => {
                  const isLow = i.quantity <= i.reorderLevel;
                  return (
                    <TableRow key={i.id} className={isLow ? "bg-destructive/5" : ""}>
                      <TableCell>{i.id}</TableCell>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell>{i.category}</TableCell>
                      <TableCell className="text-right">{i.quantity} {i.unit}</TableCell>
                      <TableCell className="text-right">{i.reorderLevel}</TableCell>
                      <TableCell>{isLow ? "Low Stock" : "In Stock"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground">Select a report from the left to view data.</p>
            <p className="text-sm mt-2 font-medium">Available samples: Project Status, Invoice Aging, Inventory Stock Levels</p>
          </div>
        );
    }
  };

  const handleExportExcel = () => {
    switch (selectedReport) {
      case "Project Status Summary":
        exportToExcel(projects, "Project_Status_Report");
        break;
      case "Invoice Aging":
        exportToExcel(invoices, "Invoice_Aging_Report");
        break;
      case "Inventory Stock Levels":
        exportToExcel(inventory, "Inventory_Stock_Report");
        break;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] print:h-auto">
      <div className="flex-1 flex flex-col p-4 md:p-8 pt-6 print:p-0">
        <div className="print:hidden">
          <PageHeader 
            title="Report Center" 
            subtitle="Unified reporting and analytics engine"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
          {/* Left Rail */}
          <Card className="w-full md:w-64 shrink-0 flex flex-col h-fit print:hidden">
            <CardContent className="p-4 space-y-1">
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 px-2 uppercase tracking-wider">Categories</h3>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedReport(cat)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedReport === cat 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main Panel */}
          <Card className="flex-1 flex flex-col min-w-0 overflow-hidden print:border-none print:shadow-none bg-card">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Tabs defaultValue="summary" className="w-fit">
                  <TabsList className="h-9">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print / PDF
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible bg-white">
              {renderReportContent()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
