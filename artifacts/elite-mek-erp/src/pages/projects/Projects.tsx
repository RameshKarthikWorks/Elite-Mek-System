import { useState } from "react";
import { useCrudStore, SEED_PROJECTS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Edit, Trash, Eye, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Projects() {
  const { data: projects, create, update, remove } = useCrudStore("projects", SEED_PROJECTS, "Projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    name: "",
    customerId: "c1",
    status: "Active",
    progress: 0,
    value: 0,
    start: "",
    end: "",
    manager: "PM User"
  });

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge className="bg-primary hover:bg-primary/80">{status}</Badge>;
      case "Completed": return <Badge className="bg-emerald-500 hover:bg-emerald-600">{status}</Badge>;
      case "Planning": return <Badge variant="outline" className="text-amber-500 border-amber-500">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleOpenDialog = (project?: any) => {
    if (project) {
      setFormData(project);
      setEditingId(project.id);
    } else {
      setFormData({
        name: "", customerId: "c1", status: "Active", progress: 0, value: 0, start: "", end: "", manager: "PM User"
      });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Project name is required");
      return;
    }
    
    if (editingId) {
      update(editingId, formData);
      toast.success("Project updated successfully");
    } else {
      create(formData);
      toast.success("Project created successfully");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      remove(id);
      toast.success("Project deleted");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader 
        title="Project Management" 
        subtitle="Manage all active and planned projects."
        action={{ label: "New Project", onClick: () => handleOpenDialog() }}
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search projects..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {filteredProjects.length}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.name}
                        <div className="text-xs text-muted-foreground mt-1">
                          {project.start && project.end ? `${project.start} to ${project.end}` : "Dates not set"}
                        </div>
                      </TableCell>
                      <TableCell>{project.manager}</TableCell>
                      <TableCell>{formatCurrency(project.value)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden max-w-[100px]">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-xs">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(project)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(project.id)} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Project" : "Create New Project"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Project Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">Value (INR)</Label>
              <Input id="value" type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">Progress (%)</Label>
              <Input id="progress" type="number" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manager" className="text-right">Manager</Label>
              <Input id="manager" value={formData.manager} onChange={(e) => setFormData({...formData, manager: e.target.value})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
