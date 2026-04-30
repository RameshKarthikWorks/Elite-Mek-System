import { useState } from "react";
import { useCrudStore, SEED_CUSTOMERS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Customers() {
  const { data: customers, create, update, remove } = useCrudStore("customers", SEED_CUSTOMERS, "Customers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    company: "", contact: "", gstin: "", billing: ""
  });

  const filteredCustomers = customers.filter(c => 
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (cust?: any) => {
    if (cust) {
      setFormData(cust);
      setEditingId(cust.id);
    } else {
      setFormData({ company: "", contact: "", gstin: "", billing: "" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.company) {
      toast.error("Company name is required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Customer updated");
    } else {
      create(formData);
      toast.success("Customer added");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Customer Management" action={{ label: "Add Customer", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredCustomers.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Billing Address</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-32">No customers found.</TableCell></TableRow>
                ) : (
                  filteredCustomers.map((cust) => (
                    <TableRow key={cust.id}>
                      <TableCell className="font-medium">{cust.company}</TableCell>
                      <TableCell>{cust.contact}</TableCell>
                      <TableCell>{cust.gstin}</TableCell>
                      <TableCell className="truncate max-w-xs">{cust.billing}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(cust)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(cust.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Customer</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Company</Label><Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Contact</Label><Input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">GSTIN</Label><Input value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Address</Label><Input value={formData.billing} onChange={e => setFormData({...formData, billing: e.target.value})} className="col-span-3" /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
