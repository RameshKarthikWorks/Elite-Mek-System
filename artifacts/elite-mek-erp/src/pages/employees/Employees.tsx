import { useState } from "react";
import { useCrudStore, SEED_EMPLOYEES } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Employees() {
  const { data: employees, create, update, remove } = useCrudStore("employees", SEED_EMPLOYEES, "Employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    name: "", department: "", role: "", status: "Active", contact: "", joinDate: ""
  });

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (emp?: any) => {
    if (emp) {
      setFormData(emp);
      setEditingId(emp.id);
    } else {
      setFormData({ name: "", department: "", role: "", status: "Active", contact: "", joinDate: "" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.role) {
      toast.error("Name and Role are required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Employee updated");
    } else {
      create(formData);
      toast.success("Employee added");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Employee Management" action={{ label: "Add Employee", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search employees..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredEmployees.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-32">No employees found.</TableCell></TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.role}</TableCell>
                      <TableCell>{emp.contact}</TableCell>
                      <TableCell><Badge variant={emp.status === 'Active' ? 'default' : 'secondary'}>{emp.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(emp)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(emp.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Employee</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Department</Label><Input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Role</Label><Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Contact</Label><Input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
