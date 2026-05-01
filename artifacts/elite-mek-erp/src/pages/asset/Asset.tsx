import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { addDays, isBefore, parseISO } from "date-fns";

import { useCrudStore, SEED_ASSETS, SEED_EMPLOYEES } from "@/lib/store/data";
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
  assetName: z.string().min(1, "Asset Name is required"),
  category: z.enum(["Plant & Machinery", "IT Equipment", "Vehicle", "Tools", "Furniture"]),
  assignedTo: z.string().min(1, "Assigned To is required"),
  purchaseDate: z.string().min(1, "Purchase Date is required"),
  purchaseValue: z.coerce.number().min(0),
  warrantyExpiry: z.string().min(1, "Warranty Expiry is required"),
  maintenanceDueDate: z.string().min(1, "Maintenance Due Date is required"),
  status: z.enum(["Active", "Under Maintenance", "Disposed", "Lost"]),
  siteLocation: z.string().min(1, "Location is required"),
});

export default function Asset() {
  const { data: assets, create, update, remove } = useCrudStore("assets", SEED_ASSETS, "Assets");
  const { data: employees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetName: "",
      category: "IT Equipment",
      assignedTo: "",
      purchaseDate: "",
      purchaseValue: 0,
      warrantyExpiry: "",
      maintenanceDueDate: "",
      status: "Active",
      siteLocation: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      update(editingId, values);
      toast.success("Asset updated");
    } else {
      create({ ...values, id: `AST-${String(assets.length + 1).padStart(3, '0')}` });
      toast.success("Asset created");
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
    return assets.filter((a) => {
      const matchesSearch = a.assetName.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || a.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, search, categoryFilter, statusFilter]);

  const chartData = useMemo(() => {
    const categories = ["Plant & Machinery", "IT Equipment", "Vehicle", "Tools", "Furniture"];
    return categories.map(cat => ({
      name: cat,
      count: filteredData.filter(a => a.category === cat).length
    }));
  }, [filteredData]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Management"
        subtitle="Manage company assets, warranty, and maintenance"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Asset</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Asset</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="assetName" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Asset Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Plant & Machinery">Plant & Machinery</SelectItem>
                            <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                            <SelectItem value="Vehicle">Vehicle</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="assignedTo" render={({ field }) => (
                      <FormItem><FormLabel>Assigned To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                      <FormItem><FormLabel>Purchase Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="purchaseValue" render={({ field }) => (
                      <FormItem><FormLabel>Purchase Value (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="warrantyExpiry" render={({ field }) => (
                      <FormItem><FormLabel>Warranty Expiry</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="maintenanceDueDate" render={({ field }) => (
                      <FormItem><FormLabel>Maintenance Due</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="siteLocation" render={({ field }) => (
                      <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                            <SelectItem value="Disposed">Disposed</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Asset</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Assets by Category</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Plant & Machinery">Plant & Machinery</SelectItem>
            <SelectItem value="IT Equipment">IT Equipment</SelectItem>
            <SelectItem value="Vehicle">Vehicle</SelectItem>
            <SelectItem value="Tools">Tools</SelectItem>
            <SelectItem value="Furniture">Furniture</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
            <SelectItem value="Disposed">Disposed</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Name & Category</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Maintenance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><span className="text-muted-foreground text-sm">No assets found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => {
                const maintenanceDue = isBefore(parseISO(record.maintenanceDueDate), addDays(new Date(), 7));
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>
                      <div>{record.assetName}</div>
                      <div className="text-xs text-muted-foreground">{record.category}</div>
                    </TableCell>
                    <TableCell>{employees.find(e => e.id === record.assignedTo)?.name || "Unknown"}</TableCell>
                    <TableCell>{record.siteLocation}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.maintenanceDueDate}
                        {maintenanceDue && record.status === 'Active' && (
                          <Badge variant="destructive" className="px-1 py-0"><AlertTriangle className="w-3 h-3" /></Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'Active' ? 'default' : record.status === 'Under Maintenance' ? 'secondary' : 'destructive'}>
                        {record.status}
                      </Badge>
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
