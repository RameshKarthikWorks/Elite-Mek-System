import { useState } from "react";
import { useCrudStore, SEED_LEAVES, SEED_EMPLOYEES } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Leave() {
  const { data: leaves, create, update, remove } = useCrudStore("leaves", SEED_LEAVES, "Leave");
  const { data: employees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    employeeId: "", type: "Sick Leave", startDate: "", endDate: "", reason: "", status: "Pending"
  });

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || "Unknown";

  const filteredLeaves = leaves.filter(l => 
    getEmployeeName(l.employeeId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (record?: any) => {
    if (record) {
      setFormData(record);
      setEditingId(record.id);
    } else {
      setFormData({ employeeId: "", type: "Sick Leave", startDate: "", endDate: "", reason: "", status: "Pending" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      toast.error("Employee and dates are required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Leave request updated");
    } else {
      create(formData);
      toast.success("Leave request submitted");
    }
    setIsDialogOpen(false);
  };

  const handleStatusChange = (id: string, status: string) => {
    update(id, { status });
    toast.success(`Leave request ${status.toLowerCase()}`);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Leave Management" action={{ label: "Apply Leave", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leaves..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredLeaves.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-32">No leave requests found.</TableCell></TableRow>
                ) : (
                  filteredLeaves.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{getEmployeeName(record.employeeId)}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{record.startDate} to {record.endDate}</TableCell>
                      <TableCell className="truncate max-w-xs">{record.reason}</TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'Approved' ? 'default' : 
                          record.status === 'Rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {record.status === 'Pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(record.id, 'Approved')}><CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(record.id, 'Rejected')}><XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject</DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenDialog(record)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(record.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Apply"} Leave</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Employee</Label>
              <Select value={formData.employeeId} onValueChange={v => setFormData({...formData, employeeId: v})}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Start Date</Label><Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">End Date</Label><Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Reason</Label><Input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="col-span-3" /></div>
            {editingId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
