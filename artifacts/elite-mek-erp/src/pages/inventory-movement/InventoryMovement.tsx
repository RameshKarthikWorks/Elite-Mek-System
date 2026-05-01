import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useCrudStore, SEED_INVENTORY_MOVEMENTS, SEED_INVENTORY } from "@/lib/store/data";
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
  itemId: z.string().min(1, "Item is required"),
  fromLocation: z.string().min(1, "From Location is required"),
  toLocation: z.string().min(1, "To Location is required"),
  quantity: z.coerce.number().min(1, "Quantity must be > 0"),
  movementDate: z.string().min(1, "Movement Date is required"),
  movementType: z.enum(["Issue", "Receipt", "Transfer", "Return"]),
  issuedBy: z.string().min(1, "Issued By is required"),
  receivedBy: z.string().min(1, "Received By is required"),
  remarks: z.string().optional(),
});

export default function InventoryMovement() {
  const { data: movements, create, update, remove } = useCrudStore("inventory_movements", SEED_INVENTORY_MOVEMENTS, "Inventory Movement");
  const { data: inventory } = useCrudStore("inventory", SEED_INVENTORY, "Inventory");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [itemFilter, setItemFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: "",
      fromLocation: "",
      toLocation: "",
      quantity: 1,
      movementDate: "",
      movementType: "Issue",
      issuedBy: "",
      receivedBy: "",
      remarks: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      update(editingId, values);
      toast.success("Movement record updated");
    } else {
      create({ ...values, remarks: values.remarks ?? "", id: `MOV-${String(movements.length + 1).padStart(3, '0')}` });
      toast.success("Movement record created");
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
    return movements.filter((m) => {
      const item = inventory.find(i => i.id === m.itemId);
      const matchesSearch = item?.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || m.movementType === typeFilter;
      const matchesItem = itemFilter === "All" || m.itemId === itemFilter;
      return matchesSearch && matchesType && matchesItem;
    });
  }, [movements, inventory, search, typeFilter, itemFilter]);

  const chartData = useMemo(() => {
    const types = ["Issue", "Receipt", "Transfer", "Return"];
    return types.map(type => ({
      name: type,
      volume: filteredData.filter(m => m.movementType === type).reduce((sum, m) => sum + m.quantity, 0)
    }));
  }, [filteredData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Movement"
        subtitle="Track goods receipts, issues, and transfers"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Movement</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Movement</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="movementType" render={({ field }) => (
                      <FormItem><FormLabel>Movement Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Issue">Issue</SelectItem>
                            <SelectItem value="Receipt">Receipt</SelectItem>
                            <SelectItem value="Transfer">Transfer</SelectItem>
                            <SelectItem value="Return">Return</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="movementDate" render={({ field }) => (
                      <FormItem><FormLabel>Movement Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="itemId" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Item</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {inventory.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="hidden"></div>
                    <FormField control={form.control} name="fromLocation" render={({ field }) => (
                      <FormItem><FormLabel>From Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="toLocation" render={({ field }) => (
                      <FormItem><FormLabel>To Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="issuedBy" render={({ field }) => (
                      <FormItem><FormLabel>Issued By</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="receivedBy" render={({ field }) => (
                      <FormItem><FormLabel>Received By</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="remarks" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Remarks</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Movement</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Volume by Movement Type</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movements..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={itemFilter} onValueChange={setItemFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Items</SelectItem>
            {inventory.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Issue">Issue</SelectItem>
            <SelectItem value="Receipt">Receipt</SelectItem>
            <SelectItem value="Transfer">Transfer</SelectItem>
            <SelectItem value="Return">Return</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movement ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>From &rarr; To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><span className="text-muted-foreground text-sm">No movements found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.movementDate}</TableCell>
                  <TableCell>
                    <Badge variant={record.movementType === 'Receipt' ? 'default' : record.movementType === 'Issue' ? 'secondary' : 'outline'}>
                      {record.movementType}
                    </Badge>
                  </TableCell>
                  <TableCell>{inventory.find(i => i.id === record.itemId)?.name || "Unknown"}</TableCell>
                  <TableCell>{record.quantity} {inventory.find(i => i.id === record.itemId)?.unit}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {record.fromLocation} &rarr; {record.toLocation}
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
