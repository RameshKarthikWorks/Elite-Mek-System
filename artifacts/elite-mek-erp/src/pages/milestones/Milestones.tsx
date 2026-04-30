import { useState } from "react";
import { useCrudStore, SEED_MILESTONES, SEED_PROJECTS } from "@/lib/store/data";
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

export default function Milestones() {
  const { data: milestones, create, update, remove } = useCrudStore("milestones", SEED_MILESTONES, "Milestones");
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    projectId: "", name: "", targetDate: "", progress: 0, status: "InProgress"
  });

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || "Unknown Project";

  const filteredMilestones = milestones.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProjectName(m.projectId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (milestone?: any) => {
    if (milestone) {
      setFormData(milestone);
      setEditingId(milestone.id);
    } else {
      setFormData({ projectId: "", name: "", targetDate: "", progress: 0, status: "InProgress" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.projectId || !formData.name) {
      toast.error("Project and Name are required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Milestone updated");
    } else {
      create(formData);
      toast.success("Milestone created");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Milestone Tracking" action={{ label: "Add Milestone", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search milestones..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredMilestones.length}</div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMilestones.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-32">No milestones found.</TableCell></TableRow>
                ) : (
                  filteredMilestones.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{getProjectName(m.projectId)}</TableCell>
                      <TableCell>{m.targetDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden max-w-[100px]">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${m.progress}%` }} />
                          </div>
                          <span className="text-xs">{m.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          m.status === 'Completed' ? 'default' : 
                          m.status === 'Delayed' ? 'destructive' : 
                          'secondary'
                        }>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(m)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(m.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Milestone</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Project</Label>
              <Select value={formData.projectId} onValueChange={v => setFormData({...formData, projectId: v})}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Target Date</Label><Input type="date" value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Progress %</Label><Input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: Number(e.target.value)})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
