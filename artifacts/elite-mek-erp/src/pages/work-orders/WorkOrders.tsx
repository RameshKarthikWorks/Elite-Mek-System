import { useState } from "react";
import { useCrudStore, SEED_WORK_ORDERS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function WorkOrders() {
  const { data: orders, create, update, remove } = useCrudStore("workOrders", SEED_WORK_ORDERS, "Work Orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    projectId: "", siteId: "", assignedTo: "", status: "Open", priority: "Medium"
  });

  const filteredOrders = orders.filter(o => 
    o.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.projectId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (order?: any) => {
    if (order) {
      setFormData(order);
      setEditingId(order.id);
    } else {
      setFormData({ projectId: "", siteId: "", assignedTo: "", status: "Open", priority: "Medium" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.projectId) {
      toast.error("Project ID is required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Work Order updated");
    } else {
      create(formData);
      toast.success("Work Order added");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Work Orders" action={{ label: "Add Work Order", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredOrders.length}</div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Site ID</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-32">No work orders found.</TableCell></TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.projectId}</TableCell>
                    <TableCell>{order.siteId}</TableCell>
                    <TableCell>{order.assignedTo}</TableCell>
                    <TableCell><Badge variant="outline">{order.priority}</Badge></TableCell>
                    <TableCell><Badge variant={order.status === 'Open' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(order)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(order.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Work Order</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Project ID</Label><Input value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Site ID</Label><Input value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Assigned To</Label><Input value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Priority</Label>
              <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="InProgress">InProgress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
