import { useState } from "react";
import { useCrudStore, SEED_SITES } from "@/lib/store/data";
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

export default function Sites() {
  const { data: sites, create, update, remove } = useCrudStore("sites", SEED_SITES, "Sites");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    projectId: "", location: "", supervisor: ""
  });

  const filteredSites = sites.filter(s => 
    s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (site?: any) => {
    if (site) {
      setFormData(site);
      setEditingId(site.id);
    } else {
      setFormData({ projectId: "", location: "", supervisor: "" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.location) {
      toast.error("Location is required");
      return;
    }
    if (editingId) {
      update(editingId, formData);
      toast.success("Site updated");
    } else {
      create(formData);
      toast.success("Site added");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Site Management" action={{ label: "Add Site", onClick: () => handleOpenDialog() }} />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search sites..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total: {filteredSites.length}</div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center h-32">No sites found.</TableCell></TableRow>
              ) : (
                filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.location}</TableCell>
                    <TableCell>{site.projectId}</TableCell>
                    <TableCell>{site.supervisor}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(site)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { if(confirm("Delete?")) remove(site.id); }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Site</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Project ID</Label><Input value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Supervisor</Label><Input value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} className="col-span-3" /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
