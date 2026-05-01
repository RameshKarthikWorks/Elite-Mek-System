import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Tag } from "lucide-react";
import { toast } from "sonner";

import { useCrudStore, SEED_CATEGORIES } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const formSchema = z.object({
  categoryName: z.string().min(1, "Name is required"),
  categoryType: z.enum(["Item", "Expense", "Asset", "Document", "Vendor"]),
  parentCategory: z.string().optional().nullable(),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});

export default function Category() {
  const { data: categories, create, update, remove } = useCrudStore("categories", SEED_CATEGORIES, "Categories");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
      categoryType: "Item",
      parentCategory: "none",
      description: "",
      status: "Active",
    },
  });

  // Watch type to filter parent categories
  const selectedType = form.watch("categoryType");
  const availableParents = categories.filter(c => c.categoryType === selectedType && c.id !== editingId && !c.parentCategory);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const parentCategory = values.parentCategory === "none" ? null : values.parentCategory;
    
    if (editingId) {
      update(editingId, { ...values, description: values.description ?? "", parentCategory: parentCategory ?? null });
      toast.success("Category updated");
    } else {
      create({ ...values, description: values.description ?? "", parentCategory: parentCategory ?? null, id: `CAT-${String(categories.length + 1).padStart(3, '0')}` });
      toast.success("Category created");
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.reset({
      ...record,
      parentCategory: record.parentCategory || "none",
    });
    setIsDialogOpen(true);
  };

  const filteredData = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch = c.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || c.categoryType === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      // Sort parents first, then children
      if (!a.parentCategory && b.parentCategory) return -1;
      if (a.parentCategory && !b.parentCategory) return 1;
      return a.categoryName.localeCompare(b.categoryName);
    });
  }, [categories, search, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Management"
        subtitle="Master lists for items, expenses, and system classifications"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "New"} Category</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="categoryName" render={({ field }) => (
                    <FormItem><FormLabel>Category Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="categoryType" render={({ field }) => (
                    <FormItem><FormLabel>Type</FormLabel>
                      <Select onValueChange={(val) => { field.onChange(val); form.setValue('parentCategory', 'none'); }} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Item">Item</SelectItem>
                          <SelectItem value="Expense">Expense</SelectItem>
                          <SelectItem value="Asset">Asset</SelectItem>
                          <SelectItem value="Document">Document</SelectItem>
                          <SelectItem value="Vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="parentCategory" render={({ field }) => (
                    <FormItem><FormLabel>Parent Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- Top Level --</SelectItem>
                          {availableParents.map(p => <SelectItem key={p.id} value={p.id}>{p.categoryName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="submit">Save Category</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Item">Item</SelectItem>
            <SelectItem value="Expense">Expense</SelectItem>
            <SelectItem value="Asset">Asset</SelectItem>
            <SelectItem value="Document">Document</SelectItem>
            <SelectItem value="Vendor">Vendor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><span className="text-muted-foreground text-sm">No categories found</span></TableCell></TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id} className={record.parentCategory ? "bg-muted/10" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.parentCategory && <span className="w-4 h-px bg-border ml-2 mr-1"></span>}
                      <Tag className={`w-4 h-4 ${record.parentCategory ? 'text-muted-foreground' : 'text-primary'}`} />
                      <span className={record.parentCategory ? "text-muted-foreground" : "font-medium"}>{record.categoryName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.categoryType}</TableCell>
                  <TableCell className="text-muted-foreground">{record.description}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>{record.status}</Badge>
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
