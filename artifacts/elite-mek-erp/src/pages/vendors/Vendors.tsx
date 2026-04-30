import { useState } from "react";
import { useCrudStore, SEED_VENDORS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Vendors() {
  const { data: vendors, create, update, remove } = useCrudStore("vendors", SEED_VENDORS, "Vendors");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    name: "", category: "General", paymentTerms: "Net 30", rating: 5
  });

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (vendor?: any) => {
    if (vendor) {
      setFormData(vendor);
      setEditingId(vendor.id);
    } else {
      setFormData({ name: "", category: "General", paymentTerms: "Net 30", rating: 5 });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Vendor name is required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Vendor updated");
    } else {
      create(formData);
      toast.success("Vendor added");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Vendor Management" action={{ label: "Add Vendor", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vendors..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredVendors.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-32">No vendors found.</TableCell></TableRow>
                ) : (
                  filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.category}</TableCell>
                      <TableCell>{vendor.paymentTerms}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-amber-500">
                           <Star className="w-4 h-4 fill-current mr-1" />
                           <span className="text-foreground">{vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(vendor)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(vendor.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Vendor</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Payment Terms</Label><Input value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Rating</Label><Input type="number" min="1" max="5" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="col-span-3" /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
