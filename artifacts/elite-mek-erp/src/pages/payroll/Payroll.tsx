import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Download, Plus, Search, Filter, Printer } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useCrudStore, SEED_PAYROLL, SEED_EMPLOYEES } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { ReportHeader } from "@/components/ReportHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const formSchema = z.object({
  month: z.string().min(1, "Month is required"),
  employeeId: z.string().min(1, "Employee is required"),
  basicSalary: z.coerce.number().min(0),
  hra: z.coerce.number().min(0),
  transport: z.coerce.number().min(0),
  medical: z.coerce.number().min(0),
  pf: z.coerce.number().min(0),
  esi: z.coerce.number().min(0),
  advance: z.coerce.number().min(0),
  otHours: z.coerce.number().min(0),
  otRate: z.coerce.number().min(0),
  status: z.enum(["Draft", "Processed", "Approved", "Paid"]),
});

export default function Payroll() {
  const { data: payroll, create, update, remove } = useCrudStore("payroll", SEED_PAYROLL, "Payroll");
  const { data: employees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: format(new Date(), "yyyy-MM"),
      employeeId: "",
      basicSalary: 0,
      hra: 0,
      transport: 0,
      medical: 0,
      pf: 0,
      esi: 0,
      advance: 0,
      otHours: 0,
      otRate: 0,
      status: "Draft",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const otAmount = values.otHours * values.otRate;
    const gross = values.basicSalary + values.hra + values.transport + values.medical;
    const netSalary = gross - (values.pf + values.esi + values.advance) + otAmount;
    
    const record = {
      ...values,
      otAmount,
      gross,
      netSalary,
    };

    if (editingId) {
      update(editingId, record);
      toast.success("Payroll record updated");
    } else {
      create(record);
      toast.success("Payroll record created");
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const handleGeneratePayroll = () => {
    toast.success("Generated draft payroll for current month");
  };

  const filteredData = useMemo(() => {
    return payroll.filter((p) => {
      const emp = employees.find((e) => e.id === p.employeeId);
      const matchesSearch = emp?.name.toLowerCase().includes(search.toLowerCase());
      const matchesMonth = monthFilter === "All" || p.month === monthFilter;
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [payroll, employees, search, monthFilter, statusFilter]);

  const chartData = useMemo(() => {
    return filteredData
      .slice(0, 8)
      .map(p => ({
        name: employees.find(e => e.id === p.employeeId)?.name || "Unknown",
        netSalary: p.netSalary
      }));
  }, [filteredData, employees]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Payroll Management"
          subtitle="Manage employee salaries and payslips"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGeneratePayroll}>
                Generate Payroll
              </Button>
              <Button onClick={() => window.print()} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" /> New Record</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit" : "New"} Payroll Record</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="month" render={({ field }) => (
                          <FormItem><FormLabel>Month (YYYY-MM)</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="employeeId" render={({ field }) => (
                          <FormItem><FormLabel>Employee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="basicSalary" render={({ field }) => (
                          <FormItem><FormLabel>Basic Salary</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="hra" render={({ field }) => (
                          <FormItem><FormLabel>HRA</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="transport" render={({ field }) => (
                          <FormItem><FormLabel>Transport</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="medical" render={({ field }) => (
                          <FormItem><FormLabel>Medical</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pf" render={({ field }) => (
                          <FormItem><FormLabel>PF Deduction</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="esi" render={({ field }) => (
                          <FormItem><FormLabel>ESI Deduction</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="advance" render={({ field }) => (
                          <FormItem><FormLabel>Advance Deduction</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="otHours" render={({ field }) => (
                          <FormItem><FormLabel>OT Hours</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="otRate" render={({ field }) => (
                          <FormItem><FormLabel>OT Rate</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="status" render={({ field }) => (
                          <FormItem><FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Processed">Processed</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          <FormMessage /></FormItem>
                        )} />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Record</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Net Salary by Employee</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="netSalary" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Processed">Processed</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden print:block">
        <ReportHeader title="Payroll Report" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right print:hidden">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><span className="text-muted-foreground text-sm">No records found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.month}</TableCell>
                  <TableCell>{employees.find(e => e.id === record.employeeId)?.name}</TableCell>
                  <TableCell>{formatCurrency(record.gross)}</TableCell>
                  <TableCell className="text-red-600">-{formatCurrency(record.pf + record.esi + record.advance)}</TableCell>
                  <TableCell className="font-medium text-green-600">{formatCurrency(record.netSalary)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Paid' ? 'default' : record.status === 'Draft' ? 'outline' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right print:hidden">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { remove(record.id); toast.success("Record deleted"); }}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
