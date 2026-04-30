import { useState } from "react";
import { useCrudStore, SEED_ATTENDANCE, SEED_EMPLOYEES } from "@/lib/store/data";
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

export default function Attendance() {
  const { data: attendance, create, update, remove } = useCrudStore("attendance", SEED_ATTENDANCE, "Attendance");
  const { data: employees } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    employeeId: "", date: new Date().toISOString().split('T')[0], status: "Present"
  });

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || "Unknown Employee";
  };

  const filteredAttendance = attendance.filter(a => 
    getEmployeeName(a.employeeId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.date.includes(searchTerm)
  );

  const handleOpenDialog = (record?: any) => {
    if (record) {
      setFormData(record);
      setEditingId(record.id);
    } else {
      setFormData({ employeeId: "", date: new Date().toISOString().split('T')[0], status: "Present" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.employeeId) {
      toast.error("Employee is required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Attendance updated");
    } else {
      create(formData);
      toast.success("Attendance logged");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Attendance" action={{ label: "Log Attendance", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search records..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredAttendance.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-32">No attendance records found.</TableCell></TableRow>
                ) : (
                  filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="font-medium">{getEmployeeName(record.employeeId)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'Present' ? 'default' : 
                          record.status === 'Absent' ? 'destructive' : 
                          'secondary'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Log"} Attendance</DialogTitle></DialogHeader>
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
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Half-day">Half-day</SelectItem>
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
