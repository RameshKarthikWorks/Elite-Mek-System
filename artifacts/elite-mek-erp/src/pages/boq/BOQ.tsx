import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useCrudStore, SEED_BOQ, SEED_PROJECTS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const itemSchema = z.object({
  name: z.string().min(1, "Name required"),
  unit: z.string().min(1, "Unit required"),
  qty: z.coerce.number().min(0),
  rate: z.coerce.number().min(0),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  projectId: z.string().min(1, "Project is required"),
  revision: z.string().min(1, "Revision # is required"),
  status: z.enum(["Draft", "Approved", "Revised"]),
});

export default function BOQ() {
  const { data: boqs, create, update, remove } = useCrudStore("boq", SEED_BOQ, "BOQ");
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [items, setItems] = useState<z.infer<typeof itemSchema>[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      projectId: "",
      revision: "0",
      status: "Draft",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const mappedItems = items.map(item => ({ ...item, amount: item.qty * item.rate }));

    const record = {
      ...values,
      totalAmount,
      items: mappedItems
    };

    if (editingId) {
      update(editingId, record);
      toast.success("BOQ updated");
    } else {
      create({ ...record, id: `BOQ-${String(boqs.length + 1).padStart(3, '0')}` });
      toast.success("BOQ created");
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingId(null);
    setItems([]);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.reset(record);
    setItems(record.items || []);
    setIsDialogOpen(true);
  };

  const addItem = () => {
    setItems([...items, { name: "", unit: "", qty: 0, rate: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const filteredData = useMemo(() => {
    return boqs.filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const matchesProject = projectFilter === "All" || b.projectId === projectFilter;
      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [boqs, search, statusFilter, projectFilter]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="BOQ Management"
        subtitle="Manage Bill of Quantities, revisions and estimates"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); setItems([]); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New BOQ</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} BOQ</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>BOQ Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormField control={form.control} name="revision" render={({ field }) => (
                      <FormItem><FormLabel>Revision #</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Revised">Revised</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                  </div>
                  
                  <div className="mt-8 border rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Line Items</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>Add Item</Button>
                    </div>
                    {items.length === 0 ? (
                      <span className="text-muted-foreground text-sm">No items added</span>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead className="w-24">Unit</TableHead>
                            <TableHead className="w-24">Qty</TableHead>
                            <TableHead className="w-32">Rate</TableHead>
                            <TableHead className="w-32">Amount</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell><Input value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} placeholder="Name" /></TableCell>
                              <TableCell><Input value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} placeholder="Unit" /></TableCell>
                              <TableCell><Input type="number" value={item.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} placeholder="Qty" /></TableCell>
                              <TableCell><Input type="number" value={item.rate} onChange={(e) => updateItem(idx, 'rate', e.target.value)} placeholder="Rate" /></TableCell>
                              <TableCell className="align-middle">{formatCurrency(item.qty * item.rate)}</TableCell>
                              <TableCell><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="text-right font-bold mt-4 text-lg">
                      Total: {formatCurrency(items.reduce((sum, item) => sum + (item.qty * item.rate), 0))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Save BOQ</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search BOQs..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Projects</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Revised">Revised</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BOQ ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Revision</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><span className="text-muted-foreground text-sm">No BOQs found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.title}</TableCell>
                  <TableCell>{projects.find(p => p.id === record.projectId)?.name || "Unknown"}</TableCell>
                  <TableCell>{formatCurrency(record.totalAmount)}</TableCell>
                  <TableCell><Badge variant="outline">Rev {record.revision}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Approved' ? 'default' : record.status === 'Revised' ? 'destructive' : 'secondary'}>
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
