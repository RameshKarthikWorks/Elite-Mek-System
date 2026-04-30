import { useState } from "react";
import { useCrudStore, SEED_INVENTORY } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, AlertTriangle, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Inventory() {
  const { data: inventory, create, update, remove } = useCrudStore("inventory", SEED_INVENTORY, "Inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    name: "", category: "Mechanical", unit: "pieces", quantity: 0, reorderLevel: 10, location: ""
  });

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({ name: "", category: "Mechanical", unit: "pieces", quantity: 0, reorderLevel: 10, location: "" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Item name is required");
      return;
    }
    
    if (editingId) {
      update(editingId, formData);
      toast.success("Inventory item updated");
    } else {
      create(formData);
      toast.success("Inventory item added");
    }
    setIsDialogOpen(false);
  };

  const handleAdjustQuantity = (id: string, currentQty: number, adjustment: number) => {
    const newQty = Math.max(0, currentQty + adjustment);
    update(id, { quantity: newQty });
    toast.success(`Quantity updated to ${newQty}`);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Inventory Management" action={{ label: "Add Item", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search inventory..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Total Items: {filteredInventory.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-32">No items found.</TableCell></TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const isLowStock = item.quantity <= item.reorderLevel;
                    return (
                      <TableRow key={item.id} className={isLowStock ? "bg-destructive/5 hover:bg-destructive/10" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleAdjustQuantity(item.id, item.quantity, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleAdjustQuantity(item.id, item.quantity, 1)}><Plus className="h-3 w-3" /></Button>
                            <span className="text-xs text-muted-foreground w-12 text-left">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(item)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(item.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Inventory Item</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Quantity</Label>
              <div className="col-span-3 flex gap-2">
                <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                <Input placeholder="Unit (e.g. pieces)" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Reorder Level</Label><Input type="number" value={formData.reorderLevel} onChange={e => setFormData({...formData, reorderLevel: Number(e.target.value)})} className="col-span-3" /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
