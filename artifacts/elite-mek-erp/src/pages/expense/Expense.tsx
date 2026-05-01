import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { useCrudStore, SEED_EXPENSES, SEED_PROJECTS, SEED_EMPLOYEES } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const formSchema = z.object({
  expenseType: z.enum(["Travel", "Material", "Accommodation", "Food", "Fuel", "Other"]),
  projectId: z.string().min(1, "Project is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  expenseDate: z.string().min(1, "Date is required"),
  paidBy: z.string().min(1, "Paid By is required"),
  approvalStatus: z.enum(["Pending", "Approved", "Rejected", "Reimbursed"]),
  remarks: z.string().optional(),
});

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted))'];

export default function Expense() {
  const { data: expenses, create, update, remove } = useCrudStore("expenses", SEED_EXPENSES, "Expenses");
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");
  const { data: employees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenseType: "Travel",
      projectId: "",
      amount: 0,
      expenseDate: "",
      paidBy: "",
      approvalStatus: "Pending",
      remarks: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      update(editingId, values);
      toast.success("Expense updated");
    } else {
      create({ ...values, remarks: values.remarks ?? "", id: `EXP-${String(expenses.length + 1).padStart(3, '0')}` });
      toast.success("Expense created");
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

  const filteredData = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = e.id.toLowerCase().includes(search.toLowerCase()) || e.remarks?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || e.expenseType === typeFilter;
      const matchesStatus = statusFilter === "All" || e.approvalStatus === statusFilter;
      const matchesProject = projectFilter === "All" || e.projectId === projectFilter;
      return matchesSearch && matchesType && matchesStatus && matchesProject;
    });
  }, [expenses, search, typeFilter, statusFilter, projectFilter]);

  const totalApproved = expenses.filter(e => e.approvalStatus === "Approved" || e.approvalStatus === "Reimbursed").reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses.filter(e => e.approvalStatus === "Pending").reduce((sum, e) => sum + e.amount, 0);
  const totalRejected = expenses.filter(e => e.approvalStatus === "Rejected").reduce((sum, e) => sum + e.amount, 0);

  const chartData = useMemo(() => {
    const types = ["Travel", "Material", "Accommodation", "Food", "Fuel", "Other"];
    return types.map(t => ({
      name: t,
      value: filteredData.filter(e => e.expenseType === t).reduce((sum, e) => sum + e.amount, 0)
    })).filter(d => d.value > 0);
  }, [filteredData]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        subtitle="Track project and employee expenses"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Expense</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Expense</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="expenseType" render={({ field }) => (
                      <FormItem><FormLabel>Expense Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Travel">Travel</SelectItem>
                            <SelectItem value="Material">Material</SelectItem>
                            <SelectItem value="Accommodation">Accommodation</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Fuel">Fuel</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="projectId" render={({ field }) => (
                      <FormItem><FormLabel>Project</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="expenseDate" render={({ field }) => (
                      <FormItem><FormLabel>Expense Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="paidBy" render={({ field }) => (
                      <FormItem><FormLabel>Paid By</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="approvalStatus" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Reimbursed">Reimbursed</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="remarks" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Remarks</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Expense</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Approved</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Rejected</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalRejected)}</div></CardContent>
          </Card>
        </div>
        <Card className="md:col-span-3">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Expenses by Type</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ID or remarks..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Projects</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Material">Material</SelectItem>
            <SelectItem value="Accommodation">Accommodation</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Fuel">Fuel</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Reimbursed">Reimbursed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expense ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Paid By</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><span className="text-muted-foreground text-sm">No expenses found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.expenseDate}</TableCell>
                  <TableCell>{record.expenseType}</TableCell>
                  <TableCell>{projects.find(p => p.id === record.projectId)?.name || "Unknown"}</TableCell>
                  <TableCell>{employees.find(e => e.id === record.paidBy)?.name || "Unknown"}</TableCell>
                  <TableCell>{formatCurrency(record.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={record.approvalStatus === 'Approved' || record.approvalStatus === 'Reimbursed' ? 'default' : record.approvalStatus === 'Rejected' ? 'destructive' : 'secondary'}>
                      {record.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
