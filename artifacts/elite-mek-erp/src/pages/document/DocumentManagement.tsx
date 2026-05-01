import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, FileText, Download, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { addDays, isBefore, parseISO } from "date-fns";

import { useCrudStore, SEED_DOCUMENTS, SEED_PROJECTS } from "@/lib/store/data";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const formSchema = z.object({
  documentTitle: z.string().min(1, "Title is required"),
  documentType: z.enum(["Drawing", "Specification", "Contract", "Certificate", "Report", "Other"]),
  projectId: z.string().optional().nullable(),
  version: z.string().min(1, "Version is required"),
  fileName: z.string().min(1, "File Name is required"),
  accessLevel: z.enum(["Public", "Internal", "Restricted"]),
  expiryDate: z.string().optional().nullable(),
  tags: z.string().optional(),
});

export default function DocumentManagement() {
  const { data: documents, create, update, remove } = useCrudStore("documents", SEED_DOCUMENTS, "Documents");
  const { data: projects } = useCrudStore("projects", SEED_PROJECTS, "Projects");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentTitle: "",
      documentType: "Drawing",
      projectId: "",
      version: "v1.0",
      fileName: "",
      accessLevel: "Internal",
      expiryDate: "",
      tags: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      update(editingId, values);
      toast.success("Document updated");
    } else {
      create({ 
        ...values, 
        id: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: "Current User",
        employeeId: null, projectId: values.projectId ?? null, tags: values.tags ?? "",
        expiryDate: null,
      });
      toast.success("Document uploaded");
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const filteredData = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch = d.documentTitle.toLowerCase().includes(search.toLowerCase()) || 
                           (d.tags && d.tags.toLowerCase().includes(search.toLowerCase()));
      const matchesType = typeFilter === "All" || d.documentType === typeFilter;
      const matchesProject = projectFilter === "All" || d.projectId === projectFilter;
      return matchesSearch && matchesType && matchesProject;
    });
  }, [documents, search, typeFilter, projectFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Vault"
        subtitle="Centralized storage for drawings, contracts, and certificates"
        actions={
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
              <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) { form.reset(); setEditingId(null); }}}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Upload Document</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit" : "Upload"} Document</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="documentTitle" render={({ field }) => (
                        <FormItem className="col-span-2"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="documentType" render={({ field }) => (
                        <FormItem><FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Drawing">Drawing</SelectItem>
                              <SelectItem value="Specification">Specification</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Certificate">Certificate</SelectItem>
                              <SelectItem value="Report">Report</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="projectId" render={({ field }) => (
                        <FormItem><FormLabel>Project (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="version" render={({ field }) => (
                        <FormItem><FormLabel>Version</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="accessLevel" render={({ field }) => (
                        <FormItem><FormLabel>Access Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select access" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Public">Public</SelectItem>
                              <SelectItem value="Internal">Internal</SelectItem>
                              <SelectItem value="Restricted">Restricted</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="expiryDate" render={({ field }) => (
                        <FormItem><FormLabel>Expiry Date (Optional)</FormLabel><FormControl><Input type="date" value={field.value || ""} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem><FormLabel>Tags (comma separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="fileName" render={({ field }) => (
                        <FormItem className="col-span-2"><FormLabel>Mock File Name (to simulate upload)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save Document</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents or tags..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Drawing">Drawing</SelectItem>
            <SelectItem value="Specification">Specification</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Certificate">Certificate</SelectItem>
            <SelectItem value="Report">Report</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Projects</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filteredData.length === 0 ? (
        <span className="text-muted-foreground text-sm">No documents found</span>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredData.map(record => {
             const isExpiring = record.expiryDate && isBefore(parseISO(record.expiryDate), addDays(new Date(), 30));
             return (
              <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-6 h-6 text-primary" /></div>
                    <Badge variant={record.accessLevel === 'Public' ? 'outline' : record.accessLevel === 'Restricted' ? 'destructive' : 'secondary'}>{record.accessLevel}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-1" title={record.documentTitle}>{record.documentTitle}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{record.documentType}</span>
                    <span>{record.version}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{record.fileName}</div>
                  {isExpiring && <Badge variant="destructive" className="text-[10px]">Expires {record.expiryDate}</Badge>}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between gap-2 border-t mt-auto">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => toast.success(`Downloading ${record.fileName}...`)}>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>Edit</Button>
                </CardFooter>
              </Card>
             )
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {record.documentTitle}
                    </div>
                    <div className="text-xs text-muted-foreground">{record.fileName}</div>
                  </TableCell>
                  <TableCell>{record.documentType}</TableCell>
                  <TableCell>{projects.find(p => p.id === record.projectId)?.name || "-"}</TableCell>
                  <TableCell>{record.version}</TableCell>
                  <TableCell>
                    <Badge variant={record.accessLevel === 'Public' ? 'outline' : record.accessLevel === 'Restricted' ? 'destructive' : 'secondary'}>
                      {record.accessLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.uploadDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`Downloading ${record.fileName}...`)}><Download className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { remove(record.id); toast.success("Record deleted"); }}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
