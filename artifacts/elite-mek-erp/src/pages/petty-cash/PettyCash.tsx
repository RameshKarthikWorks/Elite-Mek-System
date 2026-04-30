import { useState } from "react";
import { useCrudStore, SEED_PETTY_CASH } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PettyCash() {
  const { data: records, create, update, remove } = useCrudStore("pettyCash", SEED_PETTY_CASH, "Petty Cash");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0], voucherNo: "", head: "", type: "out", amount: 0, balance: 0
  });

  const filteredRecords = records.filter(r => 
    r.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleOpenDialog = (record?: any) => {
    if (record) {
      setFormData(record);
      setEditingId(record.id);
    } else {
      setFormData({ date: new Date().toISOString().split('T')[0], voucherNo: "", head: "", type: "out", amount: 0, balance: 0 });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.voucherNo || !formData.head) {
      toast.error("Voucher number and head are required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Record updated");
    } else {
      create(formData);
      toast.success("Record added");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Petty Cash" action={{ label: "Add Entry", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search records..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Voucher No</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center h-32">No records found.</TableCell></TableRow>
                ) : (
                  filteredRecords.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell className="font-medium">{r.voucherNo}</TableCell>
                      <TableCell>{r.head}</TableCell>
                      <TableCell>
                        {r.type === 'in' ? 
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50"><ArrowDownRight className="w-3 h-3 mr-1"/>In</Badge> : 
                          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10"><ArrowUpRight className="w-3 h-3 mr-1"/>Out</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(r.amount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(r.balance)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(r)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(r.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Entry</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Voucher No</Label><Input value={formData.voucherNo} onChange={e => setFormData({...formData, voucherNo: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Head</Label><Input value={formData.head} onChange={e => setFormData({...formData, head: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="in">Cash In</SelectItem><SelectItem value="out">Cash Out</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Amount</Label><Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Balance</Label><Input type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} className="col-span-3" /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
