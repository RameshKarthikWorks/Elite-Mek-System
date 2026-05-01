import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO, isValid } from "date-fns";

import { useCrudStore, SEED_REVENUE, SEED_CUSTOMERS, SEED_PROJECTS } from "@/lib/store/data";
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
  customerId: z.string().min(1, "Customer is required"),
  projectId: z.string().min(1, "Project is required"),
  invoiceNumber: z.string().min(1, "Invoice Number is required"),
  invoiceAmount: z.coerce.number().min(0, "Amount must be positive"),
  receivedAmount: z.coerce.number().min(0),
  paymentDate: z.string().nullable().optional(),
  status: z.enum(["Pending", "Partial", "Collected"]),
});

export default function Revenue() {
  const { data: revenue, create, update, remove } = useCrudStore("revenue", SEED_REVENUE, "Revenue");
  const { data: customers } = useCrudStore("customers", SEED_CUSTOMERS, "Customers");
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      projectId: "",
      invoiceNumber: "",
      invoiceAmount: 0,
      receivedAmount: 0,
      paymentDate: "",
      status: "Pending",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const balance = values.invoiceAmount - values.receivedAmount;
    let status = values.status;
    if (balance <= 0) status = "Collected";
    else if (values.receivedAmount > 0) status = "Partial";
    else status = "Pending";

    const record = {
      ...values,
      balance,
      status,
    };

    if (editingId) {
      update(editingId, record);
      toast.success("Revenue record updated");
    } else {
      create({ ...record, paymentDate: record.paymentDate ?? null, id: `REV-${String(revenue.length + 1).padStart(3, '0')}` });
      toast.success("Revenue record created");
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.reset({
      ...record,
      paymentDate: record.paymentDate || "",
    });
    setIsDialogOpen(true);
  };

  const filteredData = useMemo(() => {
    return revenue.filter((r) => {
      const matchesSearch = r.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
      const matchesCustomer = customerFilter === "All" || r.customerId === customerFilter;
      const matchesProject = projectFilter === "All" || r.projectId === projectFilter;
      return matchesSearch && matchesCustomer && matchesProject;
    });
  }, [revenue, search, customerFilter, projectFilter]);

  const totalInvoiced = filteredData.reduce((sum, r) => sum + r.invoiceAmount, 0);
  const totalReceived = filteredData.reduce((sum, r) => sum + r.receivedAmount, 0);
  const totalOutstanding = totalInvoiced - totalReceived;

  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; invoiced: number; received: number; outstanding: number }> = {};
    
    // Process all revenue records that have a payment date or we can default to current month for pending
    filteredData.forEach(r => {
      // Create a date representation based on ID or whatever date we have
      // Using invoiceNumber roughly as sorting or simply taking all active records
      const dateStr = r.paymentDate ? r.paymentDate.substring(0, 7) : "Pending";
      const key = dateStr;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, invoiced: 0, received: 0, outstanding: 0 };
      }
      monthlyData[key].invoiced += r.invoiceAmount;
      monthlyData[key].received += r.receivedAmount;
      monthlyData[key].outstanding += r.balance;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Management"
        subtitle="Track project invoicing, collections and outstanding balances"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Record</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Revenue Record</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Invoice Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="customerId" render={({ field }) => (
                      <FormItem><FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
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
                    <FormField control={form.control} name="invoiceAmount" render={({ field }) => (
                      <FormItem><FormLabel>Invoice Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="receivedAmount" render={({ field }) => (
                      <FormItem><FormLabel>Received Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="paymentDate" render={({ field }) => (
                      <FormItem><FormLabel>Last Payment Date</FormLabel><FormControl><Input type="date" value={field.value || ""} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Partial">Partial</SelectItem>
                            <SelectItem value="Collected">Collected</SelectItem>
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
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Invoiced</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</div></CardContent>
          </Card>
        </div>
        <Card className="md:col-span-3">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Revenue vs Outstanding</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                <Area type="monotone" dataKey="received" name="Received" stroke="#16a34a" fill="#16a34a33" />
                <Area type="monotone" dataKey="outstanding" name="Outstanding" stroke="#dc2626" fill="#dc262633" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoice..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Customer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Customers</SelectItem>
            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Projects</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Invoiced</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><span className="text-muted-foreground text-sm">No records found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.invoiceNumber}</TableCell>
                  <TableCell>{customers.find(c => c.id === record.customerId)?.company || "Unknown"}</TableCell>
                  <TableCell>{projects.find(p => p.id === record.projectId)?.name || "Unknown"}</TableCell>
                  <TableCell>{formatCurrency(record.invoiceAmount)}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(record.receivedAmount)}</TableCell>
                  <TableCell className="text-red-600 font-medium">{formatCurrency(record.balance)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Collected' ? 'default' : record.status === 'Pending' ? 'secondary' : 'outline'}>
                      {record.status}
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
