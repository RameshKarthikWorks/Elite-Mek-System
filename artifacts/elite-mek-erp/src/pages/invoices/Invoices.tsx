import { useState } from "react";
import { useCrudStore, SEED_INVOICES } from "@/lib/store/data";
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

export default function Invoices() {
  const { data: invoices, create, update, remove } = useCrudStore("invoices", SEED_INVOICES, "Invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    customerId: "", total: 0, status: "Draft", date: new Date().toISOString().split('T')[0]
  });

  const filteredInvoices = invoices.filter(inv => 
    inv.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleOpenDialog = (inv?: any) => {
    if (inv) {
      setFormData(inv);
      setEditingId(inv.id);
    } else {
      setFormData({ customerId: "", total: 0, status: "Draft", date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.customerId) {
      toast.error("Customer ID is required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Invoice updated");
    } else {
      create(formData);
      toast.success("Invoice added");
    }
    setIsDialogOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 print:p-0 print:space-y-0">
      <div className="print:hidden">
        <PageHeader title="Invoice & Billing" action={{ label: "Create Invoice", onClick: () => handleOpenDialog() }} />
      </div>
      
      <div className="hidden print:block">
         <ReportHeader title="Invoice List" subtitle="All generated invoices" dateRange={new Date().toLocaleDateString()} />
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardContent className="p-0 print:p-0">
          <div className="flex items-center justify-between p-4 border-b print:hidden">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px] print:hidden"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-32">No invoices found.</TableCell></TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell>{inv.customerId}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{formatCurrency(inv.total)}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'Paid' ? 'default' : inv.status === 'Overdue' ? 'destructive' : 'secondary'}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="print:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(inv)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(inv.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Create"} Invoice</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Customer ID</Label><Input value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Total Amount</Label><Input type="number" value={formData.total} onChange={e => setFormData({...formData, total: Number(e.target.value)})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Sent">Sent</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Overdue">Overdue</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
