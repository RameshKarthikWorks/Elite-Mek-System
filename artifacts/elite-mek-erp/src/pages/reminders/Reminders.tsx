import { useState } from "react";
import { useCrudStore, SEED_REMINDERS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Reminders() {
  const { data: reminders, create, update, remove } = useCrudStore("reminders", SEED_REMINDERS, "Reminders");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    title: "", dueDate: "", priority: "Medium", status: "Pending"
  });

  const filteredReminders = reminders.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (reminder?: any) => {
    if (reminder) {
      setFormData(reminder);
      setEditingId(reminder.id);
    } else {
      setFormData({ title: "", dueDate: "", priority: "Medium", status: "Pending" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Reminder updated");
    } else {
      create(formData);
      toast.success("Reminder added");
    }
    setIsDialogOpen(false);
  };

  const markCompleted = (id: string) => {
    update(id, { status: "Completed" });
    toast.success("Reminder marked as completed");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Reminders" action={{ label: "Add Reminder", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reminders..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredReminders.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-32">No reminders found.</TableCell></TableRow>
                ) : (
                  filteredReminders.map((reminder) => (
                    <TableRow key={reminder.id} className={reminder.status === "Completed" ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{reminder.title}</TableCell>
                      <TableCell>{reminder.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          reminder.priority === "High" ? "text-destructive border-destructive" :
                          reminder.priority === "Medium" ? "text-amber-500 border-amber-500" : ""
                        }>
                          {reminder.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={reminder.status === 'Completed' ? 'secondary' : 'default'}>
                          {reminder.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {reminder.status !== "Completed" && (
                              <DropdownMenuItem onClick={() => markCompleted(reminder.id)}><CheckCircle className="mr-2 h-4 w-4" /> Mark Complete</DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenDialog(reminder)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(reminder.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Reminder</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Title</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Due Date</Label><Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Priority</Label>
              <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
