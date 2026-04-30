import { useState } from "react";
import { useCrudStore, SEED_PURCHASE_ORDERS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ReportHeader } from "@/components/ReportHeader";

export default function PurchaseOrders() {
  const { data: purchaseOrders, create, update, remove } = useCrudStore("purchaseOrders", SEED_PURCHASE_ORDERS, "Purchase Orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    vendorId: "", total: 0, items: 1, status: "Draft", date: new Date().toISOString().split('T')[0]
  });

  const filteredPOs = purchaseOrders.filter(po => 
    po.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleOpenDialog = (po?: any) => {
    if (po) {
      setFormData(po);
      setEditingId(po.id);
    } else {
      setFormData({ vendorId: "", total: 0, items: 1, status: "Draft", date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.vendorId) {
      toast.error("Vendor ID is required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Purchase Order updated");
    } else {
      create(formData);
      toast.success("Purchase Order created");
    }
    setIsDialogOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 print:p-0 print:space-y-0">
      <div className="print:hidden">
        <PageHeader title="Purchase Orders" action={{ label: "Create PO", onClick: () => handleOpenDialog() }} />
      </div>
      
      <div className="hidden print:block">
         <ReportHeader title="Purchase Orders" subtitle="List of all POs" dateRange={new Date().toLocaleDateString()} />
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardContent className="p-0 print:p-0">
          <div className="flex items-center justify-between p-4 border-b print:hidden">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search POs..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px] print:hidden"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPOs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center h-32">No POs found.</TableCell></TableRow>
              ) : (
                filteredPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.id}</TableCell>
                    <TableCell>{po.vendorId}</TableCell>
                    <TableCell>{po.date}</TableCell>
                    <TableCell>{po.items}</TableCell>
                    <TableCell>{formatCurrency(po.total)}</TableCell>
                    <TableCell>
                      <Badge variant={po.status === 'Approved' || po.status === 'Issued' ? 'default' : 'secondary'}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="print:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(po)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(po.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Create"} Purchase Order</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Vendor ID</Label><Input value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Items Count</Label><Input type="number" value={formData.items} onChange={e => setFormData({...formData, items: Number(e.target.value)})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Total Amount</Label><Input type="number" value={formData.total} onChange={e => setFormData({...formData, total: Number(e.target.value)})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Issued">Issued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
