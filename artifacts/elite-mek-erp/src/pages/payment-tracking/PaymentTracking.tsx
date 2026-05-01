import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { useCrudStore, SEED_PAYMENTS } from "@/lib/store/data";
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
  referenceType: z.enum(["Invoice", "PO", "Expense", "Petty Cash"]),
  referenceNumber: z.string().min(1, "Reference Number is required"),
  partyName: z.string().min(1, "Party Name is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  paymentDate: z.string().min(1, "Date is required"),
  mode: z.enum(["Cash", "NEFT", "RTGS", "Cheque", "UPI"]),
  status: z.enum(["Pending", "Completed", "Failed", "Reversed"]),
  remarks: z.string().optional(),
});

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#8b5cf6'];

export default function PaymentTracking() {
  const { data: payments, create, update, remove } = useCrudStore("payments", SEED_PAYMENTS, "Payment Tracking");

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referenceType: "Invoice",
      referenceNumber: "",
      partyName: "",
      amount: 0,
      paymentDate: "",
      mode: "NEFT",
      status: "Pending",
      remarks: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      update(editingId, values);
      toast.success("Payment record updated");
    } else {
      create({ ...values, remarks: values.remarks ?? "", id: `PAY-${String(payments.length + 1).padStart(3, '0')}` });
      toast.success("Payment record created");
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
    return payments.filter((p) => {
      const matchesSearch = p.referenceNumber.toLowerCase().includes(search.toLowerCase()) || 
                           p.partyName.toLowerCase().includes(search.toLowerCase());
      const matchesMode = modeFilter === "All" || p.mode === modeFilter;
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesType = typeFilter === "All" || p.referenceType === typeFilter;
      return matchesSearch && matchesMode && matchesStatus && matchesType;
    });
  }, [payments, search, modeFilter, statusFilter, typeFilter]);

  const totalCompleted = filteredData.filter(p => p.status === "Completed").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = filteredData.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);
  const totalFailed = filteredData.filter(p => p.status === "Failed" || p.status === "Reversed").reduce((sum, p) => sum + p.amount, 0);

  const chartData = useMemo(() => {
    const modes = ["Cash", "NEFT", "RTGS", "Cheque", "UPI"];
    return modes.map(m => ({
      name: m,
      value: filteredData.filter(p => p.mode === m && p.status === "Completed").reduce((sum, p) => sum + p.amount, 0)
    })).filter(d => d.value > 0);
  }, [filteredData]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Tracking"
        subtitle="Monitor outgoing and incoming payments across all modes"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Payment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Payment</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="referenceType" render={({ field }) => (
                      <FormItem><FormLabel>Reference Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Invoice">Invoice</SelectItem>
                            <SelectItem value="PO">PO</SelectItem>
                            <SelectItem value="Expense">Expense</SelectItem>
                            <SelectItem value="Petty Cash">Petty Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                      <FormItem><FormLabel>Ref Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="partyName" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Party Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="paymentDate" render={({ field }) => (
                      <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="mode" render={({ field }) => (
                      <FormItem><FormLabel>Payment Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="NEFT">NEFT</SelectItem>
                            <SelectItem value="RTGS">RTGS</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                            <SelectItem value="Reversed">Reversed</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="remarks" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Remarks</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Payment</Button>
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
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed Payments</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalCompleted)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Failed/Reversed</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalFailed)}</div></CardContent>
          </Card>
        </div>
        <Card className="md:col-span-3">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed Value by Mode</CardTitle></CardHeader>
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
          <Input placeholder="Search ref or party..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Ref Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Invoice">Invoice</SelectItem>
            <SelectItem value="PO">PO</SelectItem>
            <SelectItem value="Expense">Expense</SelectItem>
            <SelectItem value="Petty Cash">Petty Cash</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Mode" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Modes</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="NEFT">NEFT</SelectItem>
            <SelectItem value="RTGS">RTGS</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Party Name</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Amount</TableHead>
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
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.paymentDate}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{record.referenceNumber}</span>
                      <span className="text-xs text-muted-foreground">{record.referenceType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.partyName}</TableCell>
                  <TableCell>{record.mode}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(record.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Completed' ? 'default' : record.status === 'Pending' ? 'secondary' : 'destructive'}>
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
