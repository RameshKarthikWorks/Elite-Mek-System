import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { addDays, isBefore, parseISO } from "date-fns";

import { useCrudStore, SEED_CONTRACTS, SEED_PROJECTS } from "@/lib/store/data";
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
  title: z.string().min(1, "Title is required"),
  partyType: z.enum(["Customer", "Vendor"]),
  partyName: z.string().min(1, "Party Name is required"),
  projectId: z.string().min(1, "Project is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  contractValue: z.coerce.number().min(0),
  contractType: z.enum(["Service", "Supply", "AMC", "Subcontract"]),
  status: z.enum(["Draft", "Active", "Expired", "Terminated"]),
  renewalReminderDays: z.coerce.number().min(0),
});

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function Contract() {
  const { data: contracts, create, update, remove } = useCrudStore("contracts", SEED_CONTRACTS, "Contracts");
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      partyType: "Customer",
      partyName: "",
      projectId: "",
      startDate: "",
      endDate: "",
      contractValue: 0,
      contractType: "Service",
      status: "Draft",
      renewalReminderDays: 30,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      update(editingId, values);
      toast.success("Contract updated");
    } else {
      create({ ...values, id: `CON-${String(contracts.length + 1).padStart(3, '0')}` });
      toast.success("Contract created");
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
    return contracts.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                           c.partyName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      const matchesType = typeFilter === "All" || c.contractType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [contracts, search, statusFilter, typeFilter]);

  const chartData = useMemo(() => {
    const types = ["Service", "Supply", "AMC", "Subcontract"];
    return types.map(t => ({
      name: t,
      value: filteredData.filter(c => c.contractType === t).length
    })).filter(d => d.value > 0);
  }, [filteredData]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contract Management"
        subtitle="Manage customer and vendor contracts and renewals"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Contract</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Contract</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Contract Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="partyType" render={({ field }) => (
                      <FormItem><FormLabel>Party Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select party type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Customer">Customer</SelectItem>
                            <SelectItem value="Vendor">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="partyName" render={({ field }) => (
                      <FormItem><FormLabel>Party Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormField control={form.control} name="contractType" render={({ field }) => (
                      <FormItem><FormLabel>Contract Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Service">Service</SelectItem>
                            <SelectItem value="Supply">Supply</SelectItem>
                            <SelectItem value="AMC">AMC</SelectItem>
                            <SelectItem value="Subcontract">Subcontract</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="endDate" render={({ field }) => (
                      <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contractValue" render={({ field }) => (
                      <FormItem><FormLabel>Contract Value (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                            <SelectItem value="Terminated">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="renewalReminderDays" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Renewal Reminder (Days before expiry)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Contract</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Contracts by Type</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search title or party..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Contract Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Service">Service</SelectItem>
            <SelectItem value="Supply">Supply</SelectItem>
            <SelectItem value="AMC">AMC</SelectItem>
            <SelectItem value="Subcontract">Subcontract</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><span className="text-muted-foreground text-sm">No contracts found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => {
                const isExpiringSoon = record.status === 'Active' && isBefore(parseISO(record.endDate), addDays(new Date(), record.renewalReminderDays || 30));
                
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.title}</div>
                      <div className="text-xs text-muted-foreground">{record.id}</div>
                    </TableCell>
                    <TableCell>{record.contractType}</TableCell>
                    <TableCell>
                      <div>{record.partyName}</div>
                      <div className="text-xs text-muted-foreground">{record.partyType}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(record.contractValue)}</TableCell>
                    <TableCell className="text-sm">
                      {record.startDate} <br/>to {record.endDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={record.status === 'Active' ? 'default' : record.status === 'Draft' ? 'secondary' : 'destructive'}>
                          {record.status}
                        </Badge>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="flex items-center gap-1 text-[10px] px-1 py-0 h-4">
                            <AlertTriangle className="w-3 h-3" /> Expires Soon
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { remove(record.id); toast.success("Record deleted"); }}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
